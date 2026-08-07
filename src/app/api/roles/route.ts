import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { verifyAuth } from "@/lib/session";
import { logActivity } from "@/lib/activity";

async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) return null;
  try {
    return await verifyAuth(token);
  } catch (err) {
    return null;
  }
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !["Admin", "Super Admin"].includes(session.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const roles = await db.role.findMany({
      orderBy: { createdAt: "asc" },
    });

    const usersByRole = await db.user.groupBy({
      by: ["role"],
      _count: { role: true },
      where: { status: "Active" },
    });
    const userCountMap = new Map(usersByRole.map((u) => [u.role, u._count.role]));

    const formattedRoles = roles.map((role) => ({
      ...role,
      permissions: JSON.parse(role.permissions || "[]"),
      userCount: userCountMap.get(role.name) || 0,
    }));

    return NextResponse.json(formattedRoles);
  } catch (error) {
    console.error("Fetch Roles Error:", error);
    return NextResponse.json({ error: "Failed to fetch roles" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || !["Admin", "Super Admin"].includes(session.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, description, color, permissions } = body;

    if (!name) {
      return NextResponse.json({ error: "Role name is required" }, { status: 400 });
    }

    const role = await db.role.create({
      data: {
        name,
        description,
        color: color || "text-slate-600 bg-slate-50 border-slate-200",
        permissions: JSON.stringify(permissions || []),
      },
    });

    await logActivity({
      actorName: session.name || "System",
      action: "created new role",
      target: name,
      targetBy: "Admin",
    });

    return NextResponse.json({
      ...role,
      permissions: JSON.parse(role.permissions),
      userCount: 0,
    });
  } catch (error) {
    console.error("Create Role Error:", error);
    if ((error as any).code === "P2002") {
      return NextResponse.json({ error: "A role with this name already exists" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create role" }, { status: 500 });
  }
}
