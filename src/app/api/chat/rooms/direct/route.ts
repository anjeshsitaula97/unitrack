import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { verifyAuth } from "@/lib/session";

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

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userId } = await request.json();
  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  const targetUser = await db.user.findUnique({ where: { id: userId } });
  if (!targetUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const existingRoom = await db.chatRoom.findFirst({
    where: {
      type: "DIRECT",
      AND: [{ members: { some: { id: session.id } } }, { members: { some: { id: userId } } }],
    },
    include: {
      members: { select: { id: true, name: true, avatar: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  if (existingRoom) {
    return NextResponse.json(existingRoom);
  }

  const newRoom = await db.chatRoom.create({
    data: {
      type: "DIRECT",
      members: { connect: [{ id: session.id }, { id: userId }] },
    },
    include: {
      members: { select: { id: true, name: true, avatar: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  return NextResponse.json(newRoom, { status: 201 });
}
