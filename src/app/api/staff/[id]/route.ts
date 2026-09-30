import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { logActivity, diffChanges, getActorName } from "@/lib/activity";
import { getSession, checkPermission } from "@/lib/api-utils";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    const deniedPUT = checkPermission(session, "admin:access");
    if (deniedPUT) return deniedPUT;
    if (!session || !["Admin", "Super Admin"].includes(session.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
