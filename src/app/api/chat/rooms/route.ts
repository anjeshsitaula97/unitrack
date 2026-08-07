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

export async function GET() {
  const session = await getSession();
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
