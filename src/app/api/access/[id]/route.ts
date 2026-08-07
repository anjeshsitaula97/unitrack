import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { createNotification } from "@/lib/notifications";
import { getSession, apiError } from "@/lib/api-utils";
import { logActivity, diffChanges, getActorName } from "@/lib/activity";

const _ALLOWED_FIELDS = ["role", "status", "password"];

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || !["Admin", "Super Admin"].includes(session.role as string))
      return apiError("Unauthorized", 401);

    const { id } = await params;
    const body = await req.json();
    const { role, status, password } = body;
    const existing = await db.user.findUnique({ where: { id: Number(id) } });

    const VALID_ROLES = ["Super Admin", "Admin", "B2B Partner", "Student", "Viewer", "Editor"];
    const normalizedRole = VALID_ROLES.find((r) => r.toLowerCase() === (role || "").toLowerCase());
    if (role && !normalizedRole) return apiError("Invalid role", 400);
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
    console.error("Update User Error:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
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
