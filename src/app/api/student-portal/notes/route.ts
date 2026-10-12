import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getStudentSession, apiError } from "@/lib/api-utils";
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

export async function GET() {
  try {
    const session = await getStudentSession();
    if (!session) return apiError("Unauthorized", 401);

    const notes = await db.studentNote.findMany({
      where: { studentId: session.id },
      select: { ...pick },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(notes);
  } catch (error) {
    logError("Fetch portal notes", error);
    return apiError("Failed to fetch notes", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getStudentSession();
    if (!session) return apiError("Unauthorized", 401);

    const rl = await checkRateLimit(`student-notes:${getClientIp(req)}`, 30, 60000);
    if (!rl.allowed) {
      return apiError("Too many requests. Please try again later.", 429);
    }

    const body = await req.json().catch(() => ({}));
    const content = cleanContent(body.content);
    if (!content) return apiError("content is required", 400);

    let parentId: number | null = null;
    if (body.parentId != null) {
      const raw = Number(body.parentId);
      if (!Number.isInteger(raw) || raw <= 0) return apiError("Invalid parentId", 400);
      const parent = await db.studentNote.findFirst({
        where: { id: raw, studentId: session.id },
        select: { id: true },
      });
      if (!parent) return apiError("Parent note not found for this student", 400);
      parentId = raw;
    }

    const student = await db.student.findUnique({
      where: { id: session.id },
      select: { name: true },
    });

    const note = await db.studentNote.create({
      data: {
        studentId: session.id,
        content,
        parentId,
        authorType: "student",
        authorName: student?.name || "Student",
        authorRole: "Student",
        authorId: session.id,
      },
      select: { ...pick },
    });

    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    logError("Create portal note", error);
    return apiError("Failed to create note", 500);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getStudentSession();
    if (!session) return apiError("Unauthorized", 401);

    const { searchParams } = new URL(req.url);
    const raw = searchParams.get("id");
    const noteId = Number(raw);
    if (!Number.isInteger(noteId) || noteId <= 0) return apiError("Invalid note id", 400);

    const note = await db.studentNote.findFirst({
      where: { id: noteId, studentId: session.id },
      select: { id: true, authorType: true, authorId: true },
    });
    if (!note) return apiError("Note not found", 404);
    if (note.authorType !== "student" || note.authorId !== session.id) {
      return apiError("Forbidden: you can only delete your own notes", 403);
    }

    await db.$transaction([
      db.studentNote.updateMany({
        where: { studentId: session.id, parentId: noteId },
        data: { parentId: null },
      }),
      db.studentNote.delete({ where: { id: noteId } }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    logError("Delete portal note", error);
    return apiError("Failed to delete note", 500);
  }
}
