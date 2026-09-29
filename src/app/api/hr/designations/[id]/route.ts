import { NextResponse } from "next/server";
import { logError } from "@/lib/logger";
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
  } catch {
    return null;
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || !["Admin", "Super Admin"].includes(session.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [{ id }, body] = await Promise.all([params, req.json()]);

    const existing = await db.designation.findUnique({ where: { id: Number(id) } });
    if (!existing) {
      return NextResponse.json({ error: "Designation not found" }, { status: 404 });
    }

    const desig = await db.designation.update({
      where: { id: Number(id) },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.description !== undefined && { description: body.description }),
      },
    });
    await logActivity({
      actorName: await getActorName(session?.id),
      userId: session?.id,
      action: "updated a designation",
      target: existing.title,
      changes: diffChanges(existing, desig),
    });
    return NextResponse.json(desig);
  } catch (error: unknown) {
    const err = error as { code?: string };
    if (err.code === "P2002") {
      return NextResponse.json(
        { error: "A designation with this title already exists" },
        { status: 400 }
      );
    }
    logError("Update Designation Error:", error);
    return NextResponse.json({ error: "Failed to update designation" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || !["Admin", "Super Admin"].includes(session.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const existing = await db.designation.findUnique({ where: { id: Number(id) } });
    if (!existing) {
      return NextResponse.json({ error: "Designation not found" }, { status: 404 });
    }

    await db.designation.delete({ where: { id: Number(id) } });
    await logActivity({
      actorName: await getActorName(session?.id),
      userId: session?.id,
      action: "deleted a designation",
      target: existing.title,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    logError("Delete Designation Error:", error);
    return NextResponse.json({ error: "Failed to delete designation" }, { status: 500 });
  }
}
