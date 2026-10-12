import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getSession, checkPermission, apiError } from "@/lib/api-utils";
import { logError } from "@/lib/logger";

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

function canManageNote(
  session: { id: number; role: string } | null,
  note: { authorType: string; authorId: number | null }
): boolean {
  if (!session) return false;
  if (note.authorType === "staff" && note.authorId === session.id) return true;
  return ["Super Admin", "Admin", "Administrator"].includes(session.role as string);
}

async function findNote(studentId: number, noteId: number) {
  return db.studentNote.findFirst({
    where: { id: noteId, studentId },
    select: { ...pick },
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; noteId: string }> }
) {
  try {
    const session = await getSession();
    const denied = checkPermission(session, "students:notes");
    if (denied) return denied;
    if (!session) return apiError("Unauthorized", 401);

    const { id, noteId } = await params;
    const studentId = Number(id);
    const noteIdNum = Number(noteId);
    if (!Number.isInteger(studentId) || studentId <= 0) return apiError("Invalid student id", 400);
    if (!Number.isInteger(noteIdNum) || noteIdNum <= 0) {
      return apiError("Invalid note id", 400);
    }

    const note = await findNote(studentId, noteIdNum);
    if (!note) return apiError("Note not found", 404);
    if (!canManageNote(session, note))
      return apiError("Forbidden: you can only edit your own notes", 403);

    const body = await req.json().catch(() => ({}));
    const content = cleanContent(body.content);
    if (!content) return apiError("content is required", 400);

    const updated = await db.studentNote.update({
      where: { id: noteIdNum },
      data: { content },
      select: { ...pick },
    });

    return NextResponse.json(updated);
  } catch (error) {
    logError("Update student note", error);
    return apiError("Failed to update note", 500);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; noteId: string }> }
) {
  try {
    const session = await getSession();
    const denied = checkPermission(session, "students:notes");
    if (denied) return denied;
    if (!session) return apiError("Unauthorized", 401);

    const { id, noteId } = await params;
    const studentId = Number(id);
    const noteIdNum = Number(noteId);
    if (!Number.isInteger(studentId) || studentId <= 0) return apiError("Invalid student id", 400);
    if (!Number.isInteger(noteIdNum) || noteIdNum <= 0) {
      return apiError("Invalid note id", 400);
    }

    const note = await findNote(studentId, noteIdNum);
    if (!note) return apiError("Note not found", 404);
    if (!canManageNote(session, note)) {
      return apiError("Forbidden: you can only delete your own notes", 403);
    }

    // Detach any replies first so they survive as standalone notes instead of
    // being cascade-deleted with the message they were answering.
    await db.$transaction([
      db.studentNote.updateMany({
        where: { studentId, parentId: noteIdNum },
        data: { parentId: null },
      }),
      db.studentNote.delete({ where: { id: noteIdNum } }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    logError("Delete student note", error);
    return apiError("Failed to delete note", 500);
  }
}
