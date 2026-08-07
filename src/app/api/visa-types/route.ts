import { NextResponse } from "next/server";
import { db as prisma } from "@/lib/db";
import { logError } from "@/lib/logger";
import { getSession } from "@/lib/api-utils";
import { logActivity, diffChanges, getActorName } from "@/lib/activity";

export async function GET() {
  try {
    const visaTypes = await prisma.visaType.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(visaTypes);
  } catch (error) {
    logError("Fetch visa types", error);
    return NextResponse.json({ error: "Failed to fetch visa types" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    const { label, description } = await req.json();

    if (!label) {
      return NextResponse.json({ error: "Label is required" }, { status: 400 });
    }

    const existing = await prisma.visaType.findUnique({
      where: { label },
    });

    if (existing) {
      return NextResponse.json({ error: "Visa Type already exists" }, { status: 400 });
    }

    const newVisaType = await prisma.visaType.create({
      data: {
        label,
        description,
      },
    });

    await logActivity({
      actorName: await getActorName(session?.id),
      userId: session?.id,
      action: "created a visa type",
      target: newVisaType.label,
    });

    return NextResponse.json(newVisaType, { status: 201 });
  } catch (error) {
    logError("Create visa type", error);
    return NextResponse.json({ error: "Failed to create visa type" }, { status: 500 });
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

    const existing = await prisma.visaType.findUnique({ where: { id: Number(id) } });
    await prisma.visaType.delete({
      where: { id: Number(id) },
    });

    await logActivity({
      actorName: await getActorName(session?.id),
      userId: session?.id,
      action: "deleted a visa type",
      target: existing?.label || id,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logError("Delete visa type", error);
    return NextResponse.json({ error: "Failed to delete visa type" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getSession();
    const { id, label, description } = await req.json();

    if (!id || !label) {
      return NextResponse.json({ error: "ID and Label are required" }, { status: 400 });
    }

    const existing = await prisma.visaType.findUnique({ where: { id: Number(id) } });
    const updatedVisaType = await prisma.visaType.update({
      where: { id: Number(id) },
      data: {
        label,
        description,
      },
    });

    const changes = diffChanges(existing, updatedVisaType);
    await logActivity({
      actorName: await getActorName(session?.id),
      userId: session?.id,
      action: "updated a visa type",
      target: updatedVisaType.label,
      changes,
    });

    return NextResponse.json(updatedVisaType);
  } catch (error) {
    logError("Update visa type", error);
    return NextResponse.json({ error: "Failed to update visa type" }, { status: 500 });
  }
}
