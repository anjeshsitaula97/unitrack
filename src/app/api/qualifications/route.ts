import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logError } from "@/lib/logger";
import { getSession } from "@/lib/api-utils";
import { logActivity, getActorName } from "@/lib/activity";

export async function GET() {
  try {
    const qualifications = await db.qualification.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json(qualifications);
  } catch (error) {
    logError("Fetch qualifications", error);
    return NextResponse.json({ error: "Failed to fetch qualifications" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const { name } = await req.json();
    if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

    const qualification = await db.qualification.create({
      data: { name },
    });

    await logActivity({
      actorName: await getActorName(session?.id),
      userId: session?.id,
      action: "created a qualification",
      target: qualification.name,
    });

    return NextResponse.json(qualification);
  } catch (error) {
    logError("Create qualification", error);
    if ((error as { code?: string }).code === "P2002") {
      return NextResponse.json({ error: "Qualification already exists" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create qualification" }, { status: 500 });
  }
}
