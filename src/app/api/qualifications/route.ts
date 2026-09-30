import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logError } from "@/lib/logger";
import { getSession, checkPermission, checkRoutePermission } from "@/lib/api-utils";
import { logActivity, getActorName } from "@/lib/activity";

export async function GET() {
  try {
    const session = await getSession();
    const deniedGET = checkPermission(session, "qualifications:read");
    if (deniedGET) return deniedGET;
    const qualifications = await db.qualification.findMany({
      orderBy: { level: "asc" },
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
    const deniedPOST = checkRoutePermission(session, {
      url: "/api/qualifications",
      method: "POST",
    });
    if (deniedPOST) return deniedPOST;
    const { name, level } = await req.json();
    if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

    const qualification = await db.qualification.create({
      data: { name, level: level || 0 },
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

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    const deniedPATCH = checkRoutePermission(session, {
      url: "/api/qualifications",
      method: "PATCH",
    });
    if (deniedPATCH) return deniedPATCH;
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const { name, level } = await req.json();
    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

    const qualification = await db.qualification.update({
      where: { id: Number(id) },
      data: { name, level },
    });

    await logActivity({
      actorName: await getActorName(session?.id),
      userId: session?.id,
      action: "updated a qualification",
      target: qualification.name,
    });

    return NextResponse.json(qualification);
  } catch (error) {
    logError("Update qualification", error);
    return NextResponse.json({ error: "Failed to update qualification" }, { status: 500 });
  }
}
