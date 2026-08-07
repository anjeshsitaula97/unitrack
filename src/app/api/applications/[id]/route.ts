import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logError } from "@/lib/logger";
import { getSession, apiError } from "@/lib/api-utils";
import { logActivity, diffChanges } from "@/lib/activity";
import { getApplicationStatuses } from "@/lib/application-statuses";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return apiError("Unauthorized", 401);

    const { id } = await params;

    const application = await db.application.findUnique({
      where: { id: Number(id) },
      include: {
        student: true,
        university: true,
        course: true,
      },
    });

    if (!application) return apiError("Application not found", 404);

    return NextResponse.json(application);
  } catch (error) {
    logError("Fetch application", error);
    return apiError("Failed to fetch application");
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return apiError("Unauthorized", 401);

    const { id } = await params;
    const body = await req.json();
    const { status } = body;

    if (!status) {
      return apiError("Status is required", 400);
    }

    const settings = await db.systemSettings.findFirst();
    const validStatuses = getApplicationStatuses(settings?.applicationStatuses).map((s) => s.name);
    if (!validStatuses.includes(status)) {
      return apiError("Invalid status", 400);
    }

    const [existing, user] = await Promise.all([
      db.application.findUnique({
        where: { id: Number(id) },
        include: { student: true, course: true },
      }),
      db.user.findUnique({ where: { id: session.id } }),
    ]);

    if (!existing) return apiError("Application not found", 404);

    const updated = await db.application.update({
      where: { id: Number(id) },
      data: { status },
      include: {
        student: { select: { firstName: true, lastName: true, email: true } },
        university: { select: { name: true, country: true } },
        course: { select: { name: true, level: true } },
      },
    });

    await logActivity({
      actorName: user?.name || existing.student.firstName + " " + existing.student.lastName,
      action: "updated application status",
      target: `${existing.student.firstName} ${existing.student.lastName} — ${existing.course.name}`,
      targetBy: `${existing.status} → ${status}`,
      changes: diffChanges(existing, updated, ["student", "university", "course"]),
    });

    return NextResponse.json(updated);
  } catch (error) {
    logError("Update application", error);
    return apiError("Failed to update application");
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return apiError("Unauthorized", 401);

    const { id } = await params;

    const [existing, user] = await Promise.all([
      db.application.findUnique({
        where: { id: Number(id) },
        include: { student: true, course: true },
      }),
      db.user.findUnique({ where: { id: session.id } }),
    ]);

    if (!existing) return apiError("Application not found", 404);

    await db.application.delete({ where: { id: Number(id) } });

    await logActivity({
      actorName: user?.name || existing.student.firstName + " " + existing.student.lastName,
      action: "deleted an application",
      target: `${existing.student.firstName} ${existing.student.lastName} — ${existing.course.name}`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logError("Delete application", error);
    return apiError("Failed to delete application");
  }
}
