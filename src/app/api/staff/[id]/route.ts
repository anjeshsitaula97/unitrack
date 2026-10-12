import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { logActivity, diffChanges, getActorName } from "@/lib/activity";
import { getSession, checkPermission, invalidateRoleCache } from "@/lib/api-utils";
import { validateRoleAssignment } from "@/lib/role-assignment";
import { isSuperAdminRole } from "@/lib/permission-catalog";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
const session = await getSession();
      const deniedPUT = checkPermission(session, "admin:access");
      if (deniedPUT) return deniedPUT;
      if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      if (!isSuperAdminRole(session.role) && session.role !== "Admin") {
        return NextResponse.json({ error: "Forbidden: insufficient permissions" }, { status: 403 });
      }

    const { id } = await params;

    const updateData: Record<string, unknown> = {};
    try {
      const body = await req.json();
      const { name, email, password, role, status } = body;

      const existingUser = await db.user.findUnique({
        where: { id: Number(id) },
      });

      if (!existingUser) {
        return NextResponse.json({ error: "Staff member not found" }, { status: 404 });
      }

      // A role change is a privilege change: validate it before anything is
      // written. Without this an ordinary Admin could PUT role="Super Admin"
      // and grant themselves the one role that bypasses every permission.
      if (role !== undefined) {
        const roleError = await validateRoleAssignment(session.role, role);
        if (roleError) {
          return NextResponse.json({ error: roleError }, { status: 403 });
        }
      }

      // A non-super-admin must not strip or disable a Super Admin account.
      if (isSuperAdminRole(existingUser.role) && !isSuperAdminRole(session.role)) {
        return NextResponse.json(
          { error: "Only a Super Admin can modify a Super Admin account" },
          { status: 403 }
        );
      }

      if (name) updateData.name = name;
      if (email) updateData.email = email;
      if (role) updateData.role = role;
      if (status) updateData.status = status;
      if (password) {
        updateData.password = await bcrypt.hash(password, 12);
      }

const user = await db.user.update({
          where: { id: Number(id) },
          data: updateData as Prisma.UserUpdateInput,
        });

        // Drop the cached grant set so the new role takes effect on the next
        // request instead of after the 30s TTL.
        invalidateRoleCache(user.id);

      const changes = diffChanges(existingUser, user);

      await logActivity({
        actorName: await getActorName(session?.id),
        userId: session?.id,
        action: "updated a user",
        target: existingUser.name,
        changes,
      });

      const { password: _, ...userWithoutPassword } = user;
      return NextResponse.json(userWithoutPassword);
    } catch (_error: unknown) {
      return NextResponse.json(
        {
          error: "Failed to update staff",
        },
        { status: 500 }
      );
    }
  } catch (_error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    const deniedDELETE = checkPermission(session, "admin:access");
    if (deniedDELETE) return deniedDELETE;
    if (!session || !["Admin", "Super Admin"].includes(session.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Prevent self-deletion
    if (Number(id) === session.id) {
      return NextResponse.json({ error: "You cannot delete your own account" }, { status: 400 });
    }

    const existingUser = await db.user.findUnique({ where: { id: Number(id) } });

    const result = await db.user.deleteMany({
      where: { id: Number(id) },
    });

    if (result.count === 0) {
      return NextResponse.json({ error: "Staff member not found" }, { status: 404 });
    }

    if (existingUser) {
      await logActivity({
        actorName: await getActorName(session?.id),
        userId: session?.id,
        action: "deleted a user",
        target: existingUser.name,
      });
    }

    return NextResponse.json({ success: true });
  } catch (_error) {
    return NextResponse.json({ error: "Failed to delete staff" }, { status: 500 });
  }
}
