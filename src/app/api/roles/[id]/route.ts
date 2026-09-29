import { NextRequest, NextResponse } from "next/server";
import { logError } from "@/lib/logger";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { verifyAuth } from "@/lib/session";
import { logActivity, diffChanges } from "@/lib/activity";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { validateCsrfHeaders } from "@/lib/csrf";

async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) return null;
  try {
    return await verifyAuth(token);
  } catch (_err) {
    return null;
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // CSRF protection for state-changing operations
    const csrf = validateCsrfHeaders(req);
    if (!csrf.valid) {
      return NextResponse.json({ error: csrf.error }, { status: 403 });
    }

    const session = await getSession();
    if (!session || !["Admin", "Super Admin"].includes(session.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limit role updates
    const rl = await checkRateLimit(`update-role:${getClientIp(req)}`, 20, 60000);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const { id } = await params;
    const body = await req.json();
    const { name, description, color, permissions } = body;

    const data: Record<string, unknown> = {};
    if (name) data.name = name;
    if (description !== undefined) data.description = description;
    if (color) data.color = color;
    if (permissions) data.permissions = JSON.stringify(permissions);

    const existing = await db.role.findUnique({ where: { id: Number(id) } });

    const role = await db.role.update({
      where: { id: Number(id) },
      data: data as Prisma.RoleUpdateInput,
    });

    await logActivity({
      actorName: session.name || "System",
      action: "updated role",
      target: role.name,
      targetBy: "Admin",
      changes: diffChanges(existing, role, ["permissions"]),
    });

    return NextResponse.json({
      ...role,
      permissions: JSON.parse(role.permissions || "[]"),
      userCount: 0,
    });
  } catch (error) {
    logError("Update Role Error:", error);
    return NextResponse.json({ error: "Failed to update role" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // CSRF protection for state-changing operations
    const csrf = validateCsrfHeaders(req);
    if (!csrf.valid) {
      return NextResponse.json({ error: csrf.error }, { status: 403 });
    }

    const session = await getSession();
    if (!session || !["Admin", "Super Admin"].includes(session.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limit role deletion
    const rl = await checkRateLimit(`delete-role:${getClientIp(req)}`, 10, 60000);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const { id } = await params;

    const role = await db.role.findUnique({ where: { id: Number(id) } });
    if (!role) return NextResponse.json({ error: "Role not found" }, { status: 404 });

    await db.role.delete({ where: { id: Number(id) } });

    await logActivity({
      actorName: session.name || "System",
      action: "deleted role",
      target: role.name,
      targetBy: "Admin",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logError("Delete Role Error:", error);
    return NextResponse.json({ error: "Failed to delete role" }, { status: 500 });
  }
}
