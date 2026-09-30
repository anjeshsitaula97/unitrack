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
    const docs = await db.academicDocument.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json(docs);
  } catch (error) {
    logError("Fetch academic documents", error);
    return NextResponse.json({ error: "Failed to fetch academic documents" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const deniedPOST = checkRoutePermission(session, {
      url: "/api/academic-documents",
      method: "POST",
    });
    if (deniedPOST) return deniedPOST;
    const { name } = await req.json();
    if (!name?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 });
    const doc = await db.academicDocument.create({ data: { name: name.trim() } });
    await logActivity({
      actorName: await getActorName(session?.id),
      userId: session?.id,
      action: "created an academic document",
      target: doc.name,
    });
    return NextResponse.json(doc);
  } catch (error: unknown) {
    if ((error as { code?: string })?.code === "P2002") {
      return NextResponse.json({ error: "Document already exists" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create academic document" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    const deniedPATCH = checkRoutePermission(session, {
      url: "/api/academic-documents",
      method: "PATCH",
    });
    if (deniedPATCH) return deniedPATCH;
    const { id, name } = await req.json();
    if (!id || !name?.trim())
      return NextResponse.json({ error: "ID and name are required" }, { status: 400 });
    const existing = await db.academicDocument.findUnique({ where: { id: Number(id) } });
    const doc = await db.academicDocument.update({
      where: { id: Number(id) },
      data: { name: name.trim() },
    });
    const changes = diffChanges(existing, doc);
    await logActivity({
      actorName: await getActorName(session?.id),
      userId: session?.id,
      action: "updated an academic document",
      target: doc.name,
      changes,
    });
    return NextResponse.json(doc);
  } catch (error: unknown) {
    if ((error as { code?: string })?.code === "P2002") {
      return NextResponse.json({ error: "Document already exists" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update academic document" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    const deniedDELETE = checkRoutePermission(session, {
      url: "/api/academic-documents",
      method: "DELETE",
    });
    if (deniedDELETE) return deniedDELETE;
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });
    const existing = await db.academicDocument.findUnique({ where: { id: Number(id) } });
    await db.academicDocument.delete({ where: { id: Number(id) } });
    await logActivity({
      actorName: await getActorName(session?.id),
      userId: session?.id,
      action: "deleted an academic document",
      target: existing?.name || id,
    });
    return NextResponse.json({ success: true });
  } catch (_error) {
    return NextResponse.json({ error: "Failed to delete academic document" }, { status: 500 });
  }
}
