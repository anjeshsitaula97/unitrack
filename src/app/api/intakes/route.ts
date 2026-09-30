import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logError } from "@/lib/logger";
import { getSession, checkPermission, checkRoutePermission } from "@/lib/api-utils";
import { logActivity, getActorName } from "@/lib/activity";

export async function GET() {
  try {
    const session = await getSession();
    const deniedGET = checkPermission(session, "intakes:read");
    if (deniedGET) return deniedGET;
    const intakes = await db.intake.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(intakes);
  } catch (_error) {
    return NextResponse.json({ error: "Failed to fetch intakes" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const deniedPOST = checkRoutePermission(session, { url: "/api/intakes", method: "POST" });
    if (deniedPOST) return deniedPOST;
    const data = await req.json();
    if (!data.name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

    const newIntake = await db.intake.create({
      data: { name: data.name },
    });
    await logActivity({
      actorName: await getActorName(session?.id),
      userId: session?.id,
      action: "created an intake",
      target: newIntake.name,
    });
    return NextResponse.json(newIntake, { status: 201 });
  } catch (error) {
    logError("Create intake", error);
    return NextResponse.json({ error: "Failed to create intake" }, { status: 400 });
  }
}
