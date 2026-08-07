import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logError } from "@/lib/logger";
import { getSession } from "@/lib/api-utils";
import { logActivity, diffChanges, getActorName } from "@/lib/activity";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const session = await getSession();

    const updateData: Record<string, any> = {};
    for (const field of ["name", "contactPerson", "email", "phone", "address", "description"]) {
      if (field in body) updateData[field] = body[field] || null;
    }
    if ("countries" in body) {
      updateData.countries = JSON.stringify(body.countries || []);
    }

    const existing = await db.partner.findUnique({ where: { id: Number(id) } });

    const partner = await db.partner.update({
      where: { id: Number(id) },
      data: updateData,
    });

    const changes = diffChanges(existing, partner);
    await logActivity({
      actorName: await getActorName(session?.id),
      userId: session?.id,
      action: "updated a partner",
      target: partner.name,
      changes,
    });

    return NextResponse.json(partner);
  } catch (error) {
    logError("Update partner", error);
    return NextResponse.json({ error: "Failed to update partner" }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getSession();

    const partner = await db.partner.findUnique({ where: { id: Number(id) } });

    await db.partner.update({
      where: { id: Number(id) },
      data: { students: { set: [] } },
    });

    await db.partner.delete({ where: { id: Number(id) } });

    await logActivity({
      actorName: await getActorName(session?.id),
      userId: session?.id,
      action: "deleted a partner",
      target: partner?.name || id,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logError("Delete partner", error);
    return NextResponse.json({ error: "Failed to delete partner" }, { status: 400 });
  }
}
