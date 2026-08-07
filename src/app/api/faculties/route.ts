import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logError } from "@/lib/logger";
import { getSession } from "@/lib/api-utils";
import { logActivity, diffChanges, getActorName } from "@/lib/activity";

export async function GET() {
  try {
    const faculties = await db.faculty.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json(faculties);
  } catch (_error) {
    return NextResponse.json({ error: "Failed to fetch faculties" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const data = await req.json();
    if (!data.name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

    const newFaculty = await db.faculty.create({
      data: { name: data.name },
    });
    await logActivity({
      actorName: await getActorName(session?.id),
      userId: session?.id,
      action: "created a faculty",
      target: newFaculty.name,
    });
    return NextResponse.json(newFaculty, { status: 201 });
  } catch (error) {
    logError("Create faculty", error);
    return NextResponse.json({ error: "Failed to create faculty" }, { status: 400 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getSession();
    const data = await req.json();
    const { id, name } = data;
    if (!id || !name)
      return NextResponse.json({ error: "ID and Name are required" }, { status: 400 });

    const existing = await db.faculty.findUnique({ where: { id: Number(id) } });
    const updated = await db.faculty.update({
      where: { id: Number(id) },
      data: { name },
    });
    const changes = diffChanges(existing, updated);
    await logActivity({
      actorName: await getActorName(session?.id),
      userId: session?.id,
      action: "updated a faculty",
      target: updated.name,
      changes,
    });
    return NextResponse.json(updated);
  } catch (_error) {
    return NextResponse.json({ error: "Failed to update faculty" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

    const existing = await db.faculty.findUnique({ where: { id: Number(id) } });
    await db.faculty.delete({
      where: { id: Number(id) },
    });
    await logActivity({
      actorName: await getActorName(session?.id),
      userId: session?.id,
      action: "deleted a faculty",
      target: existing?.name || id,
    });
    return NextResponse.json({ success: true });
  } catch (_error) {
    return NextResponse.json({ error: "Failed to delete faculty" }, { status: 500 });
  }
}
