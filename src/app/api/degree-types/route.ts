import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logError } from "@/lib/logger";
import { getSession, checkPermission, checkRoutePermission } from "@/lib/api-utils";
import { logActivity, diffChanges, getActorName } from "@/lib/activity";

export async function GET() {
  try {
    const session = await getSession();
    const deniedGET = checkPermission(session, "qualifications:read");
    if (deniedGET) return deniedGET;
    const degreeTypes = await db.degreeType.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json(degreeTypes);
  } catch (_error) {
    return NextResponse.json({ error: "Failed to fetch degree types" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const deniedPOST = checkRoutePermission(session, { url: "/api/degree-types", method: "POST" });
    if (deniedPOST) return deniedPOST;
    const data = await req.json();
    if (!data.name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

    const newDegreeType = await db.degreeType.create({
      data: { name: data.name },
    });
    await logActivity({
      actorName: await getActorName(session?.id),
      userId: session?.id,
      action: "created a degree type",
      target: newDegreeType.name,
    });
    return NextResponse.json(newDegreeType, { status: 201 });
  } catch (error) {
    logError("Create degree type", error);
    return NextResponse.json({ error: "Failed to create degree type" }, { status: 400 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getSession();
    const deniedPUT = checkRoutePermission(session, { url: "/api/degree-types", method: "PUT" });
    if (deniedPUT) return deniedPUT;
    const data = await req.json();
    const { id, name } = data;
    if (!id || !name)
      return NextResponse.json({ error: "ID and Name are required" }, { status: 400 });

    const existing = await db.degreeType.findUnique({ where: { id: Number(id) } });
    const updated = await db.degreeType.update({
      where: { id: Number(id) },
      data: { name },
    });
    const changes = diffChanges(existing, updated);
    await logActivity({
      actorName: await getActorName(session?.id),
      userId: session?.id,
      action: "updated a degree type",
      target: updated.name,
      changes,
    });
    return NextResponse.json(updated);
  } catch (_error) {
    return NextResponse.json({ error: "Failed to update degree type" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    const deniedDELETE = checkRoutePermission(session, {
      url: "/api/degree-types",
      method: "DELETE",
    });
    if (deniedDELETE) return deniedDELETE;
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

    const existing = await db.degreeType.findUnique({ where: { id: Number(id) } });
    await db.degreeType.delete({
      where: { id: Number(id) },
    });
    await logActivity({
      actorName: await getActorName(session?.id),
      userId: session?.id,
      action: "deleted a degree type",
      target: existing?.name || id,
    });
    return NextResponse.json({ success: true });
  } catch (_error) {
    return NextResponse.json({ error: "Failed to delete degree type" }, { status: 500 });
  }
}
