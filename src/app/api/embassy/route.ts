import { NextResponse } from "next/server";
import { db as prisma } from "@/lib/db";
import { logError } from "@/lib/logger";
import { getSession } from "@/lib/api-utils";
import { logActivity, diffChanges, getActorName } from "@/lib/activity";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const country = searchParams.get("country");
    const visaType = searchParams.get("visaType");

    if (!country || !visaType) {
      return NextResponse.json({ error: "Country and visaType are required" }, { status: 400 });
    }

    const embassyDetails = await prisma.embassyDetail.findFirst({
      where: { country, visaType },
    });

    return NextResponse.json(embassyDetails || null);
  } catch (error) {
    logError("Fetch embassy details", error);
    return NextResponse.json({ error: "Failed to fetch embassy details" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    const { country, visaType, name, address, phone, email, website, workingHours } =
      await req.json();

    if (!country || !visaType || !name) {
      return NextResponse.json(
        { error: "Country, visaType, and name are required" },
        { status: 400 }
      );
    }

    const existing = await prisma.embassyDetail.findFirst({
      where: { country, visaType },
    });

    if (existing) {
      const updated = await prisma.embassyDetail.update({
        where: { id: existing.id },
        data: { name, address, phone, email, website, workingHours },
      });
      const changes = diffChanges(existing, updated);
      await logActivity({
        actorName: await getActorName(session?.id),
        userId: session?.id,
        action: "updated an embassy",
        target: updated.name,
        changes,
      });
      return NextResponse.json(updated);
    } else {
      const newEmbassy = await prisma.embassyDetail.create({
        data: { country, visaType, name, address, phone, email, website, workingHours },
      });
      await logActivity({
        actorName: await getActorName(session?.id),
        userId: session?.id,
        action: "created an embassy",
        target: newEmbassy.name,
      });
      return NextResponse.json(newEmbassy, { status: 201 });
    }
  } catch (error) {
    logError("Save embassy details", error);
    return NextResponse.json({ error: "Failed to save embassy details" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getSession();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const existing = await prisma.embassyDetail.findUnique({ where: { id: Number(id) } });
    await prisma.embassyDetail.delete({
      where: { id: Number(id) },
    });

    await logActivity({
      actorName: await getActorName(session?.id),
      userId: session?.id,
      action: "deleted an embassy",
      target: existing?.name || id,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logError("Delete embassy details", error);
    return NextResponse.json({ error: "Failed to delete embassy details" }, { status: 500 });
  }
}
