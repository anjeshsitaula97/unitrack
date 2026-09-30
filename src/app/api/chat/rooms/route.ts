import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { checkPermission, getSession } from "@/lib/api-utils";

export async function GET() {
  const session = await getSession();
  const deniedGET = checkPermission(session, "chat:read");
  if (deniedGET) return deniedGET;
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const rooms = await db.chatRoom.findMany({
    where: { members: { some: { id: session.id } } },
    include: {
      members: { select: { id: true, name: true, avatar: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(rooms);
}

export async function POST(request: Request) {
  const session = await getSession();
  const deniedPOST = checkPermission(session, "chat:send");
  if (deniedPOST) return deniedPOST;
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { name, type, memberIds } = await request.json();
  const newRoom = await db.chatRoom.create({
    data: {
      name,
      type: type ?? "DIRECT",
      members: { connect: [...(memberIds ?? []), { id: session.id }] },
    },
    include: { members: true, messages: true },
  });
  return NextResponse.json(newRoom, { status: 201 });
}
