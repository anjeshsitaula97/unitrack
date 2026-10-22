import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { checkPermission, getSession } from "@/lib/api-utils";
import { isChatRoomMember } from "@/lib/chat-access";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const roomId = url.searchParams.get("roomId");
  const session = await getSession();
  const deniedGET = checkPermission(session, "chat:read");
  if (deniedGET) return deniedGET;
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!roomId) {
    return NextResponse.json({ error: "roomId required" }, { status: 400 });
  }

  const numericRoomId = Number(roomId);
  if (!Number.isInteger(numericRoomId)) {
    return NextResponse.json({ error: "roomId must be a number" }, { status: 400 });
  }

  // Reading a room's messages requires membership in that room. Listing
  // rooms was already filtered this way, but the message endpoint accepted any
  // roomId, so a caller could read conversations they were never added to.
  if (!(await isChatRoomMember(numericRoomId, session))) {
    return NextResponse.json({ error: "Forbidden: not a member of this room" }, { status: 403 });
  }

  const messages = await db.chatMessage.findMany({
    where: { roomId: numericRoomId },
    orderBy: { createdAt: "asc" },
    include: { sender: { select: { id: true, name: true, avatar: true } } },
  });
  return NextResponse.json(messages);
}

export async function POST(request: Request) {
  const session = await getSession();
  const deniedPOST = checkPermission(session, "chat:send");
  if (deniedPOST) return deniedPOST;
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { roomId, content } = await request.json();
  if (!roomId || !content) {
    return NextResponse.json({ error: "roomId and content required" }, { status: 400 });
  }

  const numericRoomId = Number(roomId);
  if (!Number.isInteger(numericRoomId)) {
    return NextResponse.json({ error: "roomId must be a number" }, { status: 400 });
  }

  // Sending into a room is subject to the same membership rule as reading it.
  if (!(await isChatRoomMember(numericRoomId, session))) {
    return NextResponse.json({ error: "Forbidden: not a member of this room" }, { status: 403 });
  }

  const newMessage = await db.chatMessage.create({
    data: {
      roomId: numericRoomId,
      senderId: session.id,
      content,
    },
    include: { sender: { select: { id: true, name: true, avatar: true } } },
  });
  // For support rooms, mock reply (optional placeholder)
  return NextResponse.json(newMessage, { status: 201 });
}
