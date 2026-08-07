import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { verifyAuth } from "@/lib/session";
import { logActivity, getActorName } from "@/lib/activity";

async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) return null;
  try {
    return await verifyAuth(token);
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const types = await db.leaveType.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json(types);
  } catch (error) {
    console.error("Fetch Leave Types Error:", error);
    return NextResponse.json({ error: "Failed to fetch leave types" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || !["Admin", "Super Admin"].includes(session.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, description, daysPerYear } = body;

    if (!name) {
      return NextResponse.json({ error: "Leave type name is required" }, { status: 400 });
    }

    const leaveType = await db.leaveType.create({
      data: { name, description, daysPerYear: parseInt(daysPerYear) || 0 },
    });
    await logActivity({
      actorName: await getActorName(session?.id),
      userId: session?.id,
      action: "created a leave type",
      target: leaveType.name,
    });
    return NextResponse.json(leaveType);
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "A leave type with this name already exists" },
        { status: 400 }
      );
    }
    console.error("Create Leave Type Error:", error);
    return NextResponse.json({ error: "Failed to create leave type" }, { status: 500 });
  }
}
