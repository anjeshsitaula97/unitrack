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
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const conversations = await db.studentConversation.findMany({
    where: { studentId: session.id },
    include: {
      staff: { select: { id: true, name: true, email: true, avatar: true, role: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(conversations);
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { staffId, subject } = await req.json();
  if (!staffId) return NextResponse.json({ error: "staffId is required" }, { status: 400 });

  const existing = await db.studentConversation.findUnique({
    where: { studentId_staffId: { studentId: session.id, staffId } },
  });

  if (existing) return NextResponse.json(existing);

  const conversation = await db.studentConversation.create({
    data: { studentId: session.id, staffId, subject },
  });

  return NextResponse.json(conversation);
}
