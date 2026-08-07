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
  } catch (err) {
    return null;
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const roomId = url.searchParams.get("roomId");
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!roomId) {
    return NextResponse.json({ error: "roomId required" }, { status: 400 });
  }
  const messages = await db.chatMessage.findMany({
    where: { roomId: Number(roomId) },
    orderBy: { createdAt: "asc" },
    include: { sender: { select: { id: true, name: true, avatar: true } } },
  });
  return NextResponse.json(messages);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { roomId, content } = await request.json();
  if (!roomId || !content) {
    return NextResponse.json({ error: "roomId and content required" }, { status: 400 });
  }
  const newMessage = await db.chatMessage.create({
    data: {
      roomId: Number(roomId),
      senderId: session.id,
      content,
    },
    include: { sender: { select: { id: true, name: true, avatar: true } } },
  });
  // For support rooms, mock reply (optional placeholder)
  return NextResponse.json(newMessage, { status: 201 });
}
