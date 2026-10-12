import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getSession, checkPermission, apiError } from "@/lib/api-utils";
import { logError } from "@/lib/logger";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const MAX_NOTE_LENGTH = 3000;

const pick = {
  id: true,
  studentId: true,
  content: true,
  authorType: true,
  authorName: true,
  authorRole: true,
  authorId: true,
  parentId: true,
  createdAt: true,
  updatedAt: true,
} as const;

function cleanContent(content: unknown): string | null {
  if (typeof content !== "string") return null;
  const trimmed = content.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, MAX_NOTE_LENGTH);
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    const denied = checkPermission(session, "students:notes");
    if (denied) return denied;
    if (!session) return apiError("Unauthorized", 401);

    const { id } = await params;
    const studentId = Number(id);
    if (!Number.isInteger(studentId) || studentId <= 0) {
      return apiError("Invalid student id", 400);
    }

    const student = await db.student.findUnique({ where: { id: studentId }, select: { id: true } });
    if (!student) return apiError("Student not found", 404);

    const notes = await db.studentNote.findMany({
      where: { studentId },
      select: { ...pick },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(notes);
  } catch (error) {
    logError("Fetch student notes", error);
    return apiError("Failed to fetch student notes", 500);
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    const denied = checkPermission(session, "students:notes");
    if (denied) return denied;
    if (!session) return apiError("Unauthorized", 401);

    const { id } = await params;
    const studentId = Number(id);
    if (!Number.isInteger(studentId) || studentId <= 0) {
      return apiError("Invalid student id", 400);
    }

    const rl = await checkRateLimit(`student-notes:${getClientIp(req)}`, 30, 60000);
    if (!rl.allowed) {
      return apiError("Too many requests. Please try again later.", 429);
    }

    const student = await db.student.findUnique({ where: { id: studentId }, select: { id: true } });
    if (!student) return apiError("Student not found", 404);

    const body = await req.json().catch(() => ({}));
    const content = cleanContent(body.content);
    if (!content) return apiError("content is required", 400);

    // A reply may only hang off a note that belongs to this same student, so a
    // caller cannot attach a message to another student's thread.
    let parentId: number | null = null;
    if (body.parentId != null) {
      const raw = Number(body.parentId);
      if (!Number.isInteger(raw) || raw <= 0) return apiError("Invalid parentId", 400);
      const parent = await db.studentNote.findFirst({
        where: { id: raw, studentId },
        select: { id: true },
      });
      if (!parent) return apiError("Parent note not found for this student", 400);
      parentId = raw;
    }

    const note = await db.studentNote.create({
      data: {
        studentId,
        content,
        parentId,
        authorType: "staff",
        authorName: session.name || "Staff",
        authorRole: session.role,
        authorId: session.id,
      },
      select: { ...pick },
    });

    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    logError("Create student note", error);
    return apiError("Failed to create note", 500);
  }
}
