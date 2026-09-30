import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { checkPermission, getSession } from "@/lib/api-utils";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  const deniedDELETE = checkPermission(session, "chat:read");
  if (deniedDELETE) return deniedDELETE;
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const room = await db.chatRoom.findUnique({
    where: { id: Number(id) },
    include: { members: { select: { id: true } } },
  });

  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }

  const isMember = room.members.some((m) => m.id === session.id);
  if (!isMember) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await db.chatMessage.deleteMany({ where: { roomId: Number(id) } });
  await db.chatRoom.delete({ where: { id: Number(id) } });

  return NextResponse.json({ success: true });
}
