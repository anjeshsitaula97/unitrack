import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logError } from "@/lib/logger";
import { logActivity, diffChanges, getActorName } from "@/lib/activity";
import { getSession, checkPermission } from "@/lib/api-utils";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    const deniedPUT = checkPermission(session, "hr:update");
    if (deniedPUT) return deniedPUT;
    if (!session || !["Admin", "Super Admin"].includes(session.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [{ id }, body] = await Promise.all([params, req.json()]);

    const existing = await db.department.findUnique({ where: { id: Number(id) } });
    if (!existing) {
      return NextResponse.json({ error: "Department not found" }, { status: 404 });
    }

    const dept = await db.department.update({
      where: { id: Number(id) },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.headId !== undefined && { headId: body.headId ? Number(body.headId) : null }),
      },
    });
    await logActivity({
      actorName: await getActorName(session?.id),
      userId: session?.id,
      action: "updated a department",
      target: existing.name,
      changes: diffChanges(existing, dept),
    });
    return NextResponse.json(dept);
  } catch (error: unknown) {
    const err = error as { code?: string };
    if (err.code === "P2002") {
      return NextResponse.json(
        { error: "A department with this name already exists" },
        { status: 400 }
      );
    }
    logError("Update department", error);
    return NextResponse.json({ error: "Failed to update department" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    const deniedDELETE = checkPermission(session, "hr:delete");
    if (deniedDELETE) return deniedDELETE;
    if (!session || !["Admin", "Super Admin"].includes(session.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const existing = await db.department.findUnique({ where: { id: Number(id) } });
    if (!existing) {
      return NextResponse.json({ error: "Department not found" }, { status: 404 });
    }

    await db.department.delete({ where: { id: Number(id) } });
    await logActivity({
      actorName: await getActorName(session?.id),
      userId: session?.id,
      action: "deleted a department",
      target: existing.name,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    logError("Delete department", error);
    return NextResponse.json({ error: "Failed to delete department" }, { status: 500 });
  }
}
