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

    const designations = await db.designation.findMany({
      orderBy: { title: "asc" },
      include: { _count: { select: { members: true } } },
    });
    return NextResponse.json(designations);
  } catch (error) {
    logError("Fetch Designations Error:", error);
    return NextResponse.json({ error: "Failed to fetch designations" }, { status: 500 });
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
    const { title, description } = body;

    if (!title) {
      return NextResponse.json({ error: "Designation title is required" }, { status: 400 });
    }

    const desig = await db.designation.create({
      data: { title, description },
    });
    await logActivity({
      actorName: await getActorName(session?.id),
      userId: session?.id,
      action: "created a designation",
      target: desig.title,
    });
    return NextResponse.json(desig);
  } catch (error: unknown) {
    const err = error as { code?: string };
    if (err.code === "P2002") {
      return NextResponse.json(
        { error: "A designation with this title already exists" },
        { status: 400 }
      );
    }
    logError("Create Designation Error:", error);
    return NextResponse.json({ error: "Failed to create designation" }, { status: 500 });
  }
}
