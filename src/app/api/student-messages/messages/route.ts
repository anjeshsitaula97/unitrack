import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { checkRoutePermission, getSession } from "@/lib/api-utils";

export async function GET(req: Request) {
  const session = await getSession();
  const deniedGET = checkRoutePermission(session, {
    url: "/api/student-messages/messages",
    method: "GET",
  });
  if (deniedGET) return deniedGET;
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
  const deniedPOST = checkRoutePermission(session, {
    url: "/api/student-messages/messages",
    method: "POST",
  });
  if (deniedPOST) return deniedPOST;
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
