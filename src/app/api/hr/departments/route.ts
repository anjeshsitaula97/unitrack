import { NextResponse } from "next/server";
import { logError } from "@/lib/logger";
import { db } from "@/lib/db";
import { logActivity, getActorName } from "@/lib/activity";
import { checkPermission, getSession } from "@/lib/api-utils";

export async function GET() {
  try {
    const session = await getSession();
    const deniedGET = checkPermission(session, "hr:read");
    if (deniedGET) return deniedGET;
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const departments = await db.department.findMany({
      orderBy: { name: "asc" },
      include: {
        head: { select: { id: true, name: true, email: true } },
        _count: { select: { members: true } },
      },
    });
    return NextResponse.json(departments);
  } catch (error) {
    logError("Fetch Departments Error:", error);
    return NextResponse.json({ error: "Failed to fetch departments" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    const deniedPOST = checkPermission(session, "hr:create");
    if (deniedPOST) return deniedPOST;
    if (!session || !["Admin", "Super Admin"].includes(session.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, description, headId } = body;

    if (!name) {
      return NextResponse.json({ error: "Department name is required" }, { status: 400 });
    }

    const dept = await db.department.create({
      data: { name, description, headId: headId || null },
    });
    await logActivity({
      actorName: await getActorName(session?.id),
      userId: session?.id,
      action: "created a department",
      target: dept.name,
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
    logError("Create Department Error:", error);
    return NextResponse.json({ error: "Failed to create department" }, { status: 500 });
  }
}
