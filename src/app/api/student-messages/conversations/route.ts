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
    include: {
      student: { select: { id: true, name: true, email: true, photoUrl: true } },
      staff: { select: { id: true, name: true, email: true, role: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(conversations);
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { studentId: rawStudentId, subject } = await req.json();
  const studentId = Number(rawStudentId);
  if (!studentId) return NextResponse.json({ error: "studentId is required" }, { status: 400 });

  const existing = await db.studentConversation.findUnique({
    where: { studentId_staffId: { studentId, staffId: session.id } },
  });

  if (existing) return NextResponse.json(existing);

  const conversation = await db.studentConversation.create({
    data: { studentId, staffId: session.id, subject },
  });

  return NextResponse.json(conversation);
}
