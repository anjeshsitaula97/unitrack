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

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const conversationId = searchParams.get("conversationId");
  if (!conversationId)
    return NextResponse.json({ error: "conversationId is required" }, { status: 400 });

  const conv = await db.studentConversation.findUnique({ where: { id: Number(conversationId) } });
  if (!conv) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const messages = await db.studentMessage.findMany({
    where: { conversationId: Number(conversationId) },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(messages);
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { conversationId, content } = await req.json();
  if (!conversationId || !content)
    return NextResponse.json({ error: "conversationId and content required" }, { status: 400 });

  const conv = await db.studentConversation.findUnique({ where: { id: Number(conversationId) } });
  if (!conv) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const message = await db.studentMessage.create({
    data: { conversationId: Number(conversationId), senderId: String(session.id), content },
  });

  await db.studentConversation.update({
    where: { id: Number(conversationId) },
    data: { lastMessage: content, lastMessageAt: new Date(), updatedAt: new Date() },
  });

  return NextResponse.json(message);
}
