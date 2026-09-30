import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logError } from "@/lib/logger";
import { getSession, checkRoutePermission } from "@/lib/api-utils";
import { logActivity, diffChanges, getActorName } from "@/lib/activity";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    const deniedPUT = checkRoutePermission(session, { url: "/api/branches/[id]", method: "PUT" });
    if (deniedPUT) return deniedPUT;
    const { id } = await params;
    const data = await req.json();

    const existing = await db.branch.findUnique({ where: { id: Number(id) } });

    const branch = await db.branch.update({
      where: { id: Number(id) },
      data: {
        name: data.name,
        location: data.location,
        manager: data.manager,
        phone: data.phone,
        email: data.email,
        status: data.status,
        logo: data.logo,
        latitude: data.latitude != null ? parseFloat(data.latitude) : null,
        longitude: data.longitude != null ? parseFloat(data.longitude) : null,
      },
    });

    const changes = diffChanges(existing, branch);
    await logActivity({
      actorName: await getActorName(session?.id),
      userId: session?.id,
      action: "updated a branch",
      target: branch.name,
      changes,
    });

    return NextResponse.json(branch);
  } catch (error) {
    logError("Update branch", error);
    return NextResponse.json({ error: "Failed to update branch" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    const deniedDELETE = checkRoutePermission(session, {
      url: "/api/branches/[id]",
      method: "DELETE",
    });
    if (deniedDELETE) return deniedDELETE;
    const { id } = await params;
    const branch = await db.branch.findUnique({ where: { id: Number(id) } });
    await db.branch.delete({
      where: { id: Number(id) },
    });
    await logActivity({
      actorName: await getActorName(session?.id),
      userId: session?.id,
      action: "deleted a branch",
      target: branch?.name || id,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    logError("Delete branch", error);
    return NextResponse.json({ error: "Failed to delete branch" }, { status: 500 });
  }
}
