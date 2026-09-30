import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logError } from "@/lib/logger";
import { getSession, checkRoutePermission } from "@/lib/api-utils";
import { logActivity, diffChanges, getActorName } from "@/lib/activity";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    const deniedPATCH = checkRoutePermission(session, {
      url: "/api/qualifications/[id]",
      method: "PATCH",
    });
    if (deniedPATCH) return deniedPATCH;
    const { id } = await params;
    const { name } = await req.json();
    if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

    const existing = await db.qualification.findUnique({ where: { id: Number(id) } });

    const qualification = await db.qualification.update({
      where: { id: Number(id) },
      data: { name },
    });

    const changes = diffChanges(existing, qualification);
    await logActivity({
      actorName: await getActorName(session?.id),
      userId: session?.id,
      action: "updated a qualification",
      target: qualification.name,
      changes,
    });

    return NextResponse.json(qualification);
  } catch (error) {
    if ((error as { code?: string }).code === "P2002") {
      return NextResponse.json({ error: "Qualification name already exists" }, { status: 400 });
    }
    logError("Update qualification", error);
    return NextResponse.json({ error: "Failed to update qualification" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    const deniedDELETE = checkRoutePermission(session, {
      url: "/api/qualifications/[id]",
      method: "DELETE",
    });
    if (deniedDELETE) return deniedDELETE;
    const { id } = await params;
    const qualification = await db.qualification.findUnique({ where: { id: Number(id) } });
    await db.qualification.delete({
      where: { id: Number(id) },
    });

    await logActivity({
      actorName: await getActorName(session?.id),
      userId: session?.id,
      action: "deleted a qualification",
      target: qualification?.name || id,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if ((error as { code?: string }).code === "P2003") {
      return NextResponse.json(
        { error: "Cannot delete: qualification is in use by one or more students" },
        { status: 409 }
      );
    }
    logError("Delete qualification", error);
    return NextResponse.json({ error: "Failed to delete qualification" }, { status: 500 });
  }
}
