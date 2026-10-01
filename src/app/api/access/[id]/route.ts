import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { createNotification } from "@/lib/notifications";
import { getSession, apiError, checkPermission } from "@/lib/api-utils";
import { logActivity, diffChanges, getActorName } from "@/lib/activity";
import { logError } from "@/lib/logger";

const _ALLOWED_FIELDS = ["role", "status", "password"];

/**
 * Roles the session logic reasons about by name. The Role table is the source of
 * truth for what an admin may pick in the UI, so validation below is driven from
 * it; these are additionally required because authorisation branches on them.
 */
const CORE_ROLES = ["Super Admin", "Admin", "B2B Partner", "Student", "Viewer", "Editor"];

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    const deniedPUT = checkPermission(session, "admin:access");
    if (deniedPUT) return deniedPUT;
    if (!session || !["Admin", "Super Admin"].includes(session.role as string))
      return apiError("Unauthorized", 401);

    const { id } = await params;
    const body = await req.json();
    const { role, status, password } = body;
    const existing = await db.user.findUnique({ where: { id: Number(id) } });

    // The dropdown in the UI is built from the Role table, so a hardcoded list
    // here rejected any role an admin had legitimately created ("Moderator",
    // "Administrator") with a 400 that surfaced as "Failed to update user".
    // Accept the stored roles plus the core ones, matching what is selectable.
    const knownRoles = await db.role.findMany({ select: { name: true } });
    const validRoles = Array.from(new Set([...knownRoles.map((r) => r.name), ...CORE_ROLES]));
    const normalizedRole = validRoles.find((r) => r.toLowerCase() === (role || "").toLowerCase());
    if (role && !normalizedRole) return apiError("Invalid role", 400);

    // Only a Super Admin may hand out or modify Super Admin, so an ordinary
    // admin cannot escalate themselves or a colleague by editing the role.
    if (
      (normalizedRole === "Super Admin" || existing?.role === "Super Admin") &&
      session.role !== "Super Admin"
    ) {
      return NextResponse.json(
        { error: "Only a Super Admin can manage Super Admin accounts" },
        { status: 403 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (normalizedRole) updateData.role = normalizedRole;
    if (status) updateData.status = status;
    if (password) {
      updateData.password = await bcrypt.hash(password, 12);
    }

    const user = await db.user.update({
      where: { id: Number(id) },
      data: updateData,
    });

    if (password) {
      const studentRole =
        normalizedRole?.toLowerCase() === "student" || existing?.role?.toLowerCase() === "student";
      if (studentRole) {
        const student = await db.student.findUnique({ where: { email: user.email } });
        if (student) {
          await db.student.update({
            where: { id: student.id },
            data: { studentPassword: updateData.password as string },
          });
        }
      }
    }

    if (existing) {
      await createNotification({
        title: "User Access Updated",
        message: `User "${existing.name}" role changed to ${role}, status: ${status}.`,
        type: "Info",
      });
    }

    const changes = diffChanges(existing, user);

    await logActivity({
      actorName: await getActorName(session?.id),
      userId: session?.id,
      action: "updated a user",
      target: existing?.name || id,
      changes,
    });

    return NextResponse.json(user);
  } catch (error) {
    logError("Update User", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    const deniedDELETE = checkPermission(session, "admin:access");
    if (deniedDELETE) return deniedDELETE;
    if (!session || !["Admin", "Super Admin"].includes(session.role as string))
      return apiError("Unauthorized", 401);

    const { id } = await params;
    const existing = await db.user.findUnique({ where: { id: Number(id) } });

    await db.user.delete({ where: { id: Number(id) } });

    if (existing) {
      await createNotification({
        title: "User Removed",
        message: `User "${existing.name}" has been removed from the system.`,
        type: "Warning",
      });
    }

    await logActivity({
      actorName: await getActorName(session?.id),
      userId: session?.id,
      action: "deleted a user",
      target: existing?.name || id,
    });

    return NextResponse.json({ success: true });
  } catch (_error) {
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
