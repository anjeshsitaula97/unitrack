import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { logError } from "@/lib/logger";
import { verifyAuth } from "@/lib/session";
import { db } from "@/lib/db";
import { logActivity, diffChanges, getActorName } from "@/lib/activity";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyAuth(token);
    const userId = payload.id;

    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (_error) {
    return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  }
}

export async function PUT(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyAuth(token);
    const userId = payload.id;

    const body = await request.json();
    const { name, avatar } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const existing = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
      },
    });

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        name,
        avatar,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
      },
    });

    const changes = diffChanges(existing, updatedUser);

    await logActivity({
      actorName: await getActorName(userId),
      userId,
      action: "updated profile",
      target: updatedUser.name,
      changes,
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    logError("Profile update", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
