// Cleaned and verified route file - v2
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { verifyAuth } from "@/lib/session";
import { logActivity, diffChanges, getActorName } from "@/lib/activity";

async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) return null;
  try {
    return await verifyAuth(token);
  } catch (_err) {
    return null;
  }
}

export async function GET() {
  try {
    const categories = await db.learningCategory.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json(categories);
  } catch (_error) {
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await req.json();
    const { name } = data;

    if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

    const newCategory = await db.learningCategory.create({
      data: { name },
    });

    await logActivity({
      actorName: await getActorName(session?.id),
      userId: session?.id,
      action: "created a category",
      target: newCategory.name,
    });

    return NextResponse.json(newCategory, { status: 201 });
  } catch (_error) {
    return NextResponse.json({ error: "Failed to add category" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

    const category = await db.learningCategory.findUnique({ where: { id: Number(id) } });

    await db.learningCategory.delete({ where: { id: Number(id) } });

    await logActivity({
      actorName: await getActorName(session?.id),
      userId: session?.id,
      action: "deleted a category",
      target: category?.name || id,
    });

    return NextResponse.json({ success: true });
  } catch (_error) {
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await req.json();
    const { id, name } = data;

    if (!id || !name)
      return NextResponse.json({ error: "ID and Name are required" }, { status: 400 });

    const existing = await db.learningCategory.findUnique({ where: { id: Number(id) } });

    const updatedCategory = await db.learningCategory.update({
      where: { id: Number(id) },
      data: { name },
    });

    const changes = diffChanges(existing, updatedCategory);
    await logActivity({
      actorName: await getActorName(session?.id),
      userId: session?.id,
      action: "updated a category",
      target: updatedCategory.name,
      changes,
    });

    return NextResponse.json(updatedCategory);
  } catch (_error) {
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
  }
}
