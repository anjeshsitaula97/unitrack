import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logError } from "@/lib/logger";
import { softDeleteApplication } from "@/lib/trash";
import { getSession, apiError, checkRoutePermission } from "@/lib/api-utils";
import { logActivity, diffChanges } from "@/lib/activity";
import { getApplicationStatuses } from "@/lib/application-statuses";
import {
  applicationEmailTemplateKey,
  formatTemplateDate,
  getAutoStatusEmailsEnabled,
  sendTemplatedEmail,
} from "@/lib/email-templates";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    const deniedGET = checkRoutePermission(session, {
      url: "/api/applications/[id]",
      method: "GET",
    });
    if (deniedGET) return deniedGET;
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
    const deniedPATCH = checkRoutePermission(session, {
      url: "/api/applications/[id]",
      method: "PATCH",
    });
    if (deniedPATCH) return deniedPATCH;
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
        student: { select: { firstName: true, lastName: true, name: true, email: true } },
        university: { select: { name: true, country: true } },
        course: { select: { name: true, level: true, startDate: true, intake: true } },
      },
    });

    await logActivity({
      actorName: user?.name || existing.student.firstName + " " + existing.student.lastName,
      userId: session.id,
      action: "updated application status",
      target: `${existing.student.firstName} ${existing.student.lastName} — ${existing.course.name}`,
      targetBy: `${existing.status} → ${status}`,
      changes: diffChanges(existing, updated, ["student", "university", "course"]),
    });

    if (
      existing.status !== status &&
      updated.student.email &&
      (await getAutoStatusEmailsEnabled())
    ) {
      const studentName =
        [updated.student.firstName, updated.student.lastName].filter(Boolean).join(" ").trim() ||
        updated.student.name;

      await sendTemplatedEmail({
        key: applicationEmailTemplateKey(status),
        to: updated.student.email,
        actorName: user?.name || "System",
        actorUserId: session.id,
        vars: {
          studentName,
          studentEmail: updated.student.email,
          universityName: updated.university.name,
          universityCountry: updated.university.country || "",
          courseName: updated.course.name,
          courseStartDate: formatTemplateDate(updated.course.startDate),
          courseIntake: updated.course.intake || "To be confirmed",
          previousStatus: existing.status,
          newStatus: status,
          applicationStatus: status,
          actorName: user?.name || "System",
        },
      });
    }

    return NextResponse.json(updated);
  } catch (error) {
    logError("Update application", error);
    return apiError("Failed to update application");
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    const deniedDELETE = checkRoutePermission(session, {
      url: "/api/applications/[id]",
      method: "DELETE",
    });
    if (deniedDELETE) return deniedDELETE;
    // Deleting an application is a destructive action; require an explicit
    // Admin gate rather than relying on a permission a custom role could hold.
    if (!session || !["Admin", "Super Admin"].includes(session.role as string))
      return apiError("Unauthorized", 401);

    const { id } = await params;

    const [existing, user] = await Promise.all([
      db.application.findUnique({
        where: { id: Number(id) },
        include: { student: true, course: true },
      }),
      db.user.findUnique({ where: { id: session.id } }),
    ]);

    if (!existing) return apiError("Application not found", 404);

    // Soft delete (30-day Trash window) like students and leads, so notes and
    // workflow history are not permanently destroyed on a stray click.
    await softDeleteApplication(Number(id));

    await logActivity({
      actorName: user?.name || existing.student.firstName + " " + existing.student.lastName,
      userId: session.id,
      action: "deleted an application",
      target: `${existing.student.firstName} ${existing.student.lastName} — ${existing.course.name}`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logError("Delete application", error);
    return apiError("Failed to delete application");
  }
}
