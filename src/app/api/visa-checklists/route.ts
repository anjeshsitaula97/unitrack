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

    const checklists = await prisma.visaChecklist.findMany({
      where: { country, visaType },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(checklists);
  } catch (error) {
    logError("Fetch visa checklists", error);
    return NextResponse.json({ error: "Failed to fetch visa checklists" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    const { country, visaType, title, description, isRequired } = await req.json();

    if (!country || !visaType || !title) {
      return NextResponse.json(
        { error: "Country, visaType, and title are required" },
        { status: 400 }
      );
    }

    const newChecklist = await prisma.visaChecklist.create({
      data: {
        country,
        visaType,
        title,
        description,
        isRequired: isRequired !== undefined ? isRequired : true,
      },
    });

    await logActivity({
      actorName: await getActorName(session?.id),
      userId: session?.id,
      action: "created a visa checklist",
      target: newChecklist.title,
    });

    return NextResponse.json(newChecklist, { status: 201 });
  } catch (error) {
    logError("Create visa checklist", error);
    return NextResponse.json({ error: "Failed to create visa checklist" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getSession();
    const { id, title, description, isRequired } = await req.json();

    if (!id || !title) {
      return NextResponse.json({ error: "ID and title are required" }, { status: 400 });
    }

    const existing = await prisma.visaChecklist.findUnique({ where: { id: Number(id) } });
    const updated = await prisma.visaChecklist.update({
      where: { id: Number(id) },
      data: {
        title,
        description,
        ...(isRequired !== undefined ? { isRequired } : {}),
      },
    });

    const changes = diffChanges(existing, updated);
    await logActivity({
      actorName: await getActorName(session?.id),
      userId: session?.id,
      action: "updated a visa checklist",
      target: updated.title,
      changes,
    });

    return NextResponse.json(updated);
  } catch (error) {
    logError("Update visa checklist", error);
    return NextResponse.json({ error: "Failed to update visa checklist" }, { status: 500 });
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

    const existing = await prisma.visaChecklist.findUnique({ where: { id: Number(id) } });
    await prisma.visaChecklist.delete({
      where: { id: Number(id) },
    });

    await logActivity({
      actorName: await getActorName(session?.id),
      userId: session?.id,
      action: "deleted a visa checklist",
      target: existing?.title || id,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logError("Delete visa checklist", error);
    return NextResponse.json({ error: "Failed to delete visa checklist" }, { status: 500 });
  }
}
