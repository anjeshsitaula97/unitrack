import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logError } from "@/lib/logger";
import { getSession, apiError } from "@/lib/api-utils";
import { logActivity, getActorName } from "@/lib/activity";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return apiError("Unauthorized", 401);

    const { id } = await params;

    const application = await db.application.findUnique({
      where: { id: Number(id) },
      select: { id: true },
    });
    if (!application) return apiError("Application not found", 404);

    const notes = await db.applicationNote.findMany({
      where: { applicationId: Number(id) },
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(notes);
  } catch (error) {
    logError("Fetch application notes", error);
    return apiError("Failed to fetch notes");
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return apiError("Unauthorized", 401);

    const { id } = await params;
    const { content } = await req.json();

    if (!content?.trim()) return apiError("Note content is required", 400);

    const application = await db.application.findUnique({
      where: { id: Number(id) },
      select: {
        id: true,
        student: { select: { firstName: true, lastName: true } },
        course: { select: { name: true } },
      },
    });
    if (!application) return apiError("Application not found", 404);

    const note = await db.applicationNote.create({
      data: {
        applicationId: Number(id),
        content: content.trim(),
        authorId: session.id,
      },
      include: {
        author: { select: { id: true, name: true } },
      },
    });

    await logActivity({
      actorName: await getActorName(session?.id),
      userId: session?.id,
      action: "created a note",
      target: `${application.student.firstName} ${application.student.lastName} — ${application.course.name}`,
    });

    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    logError("Create application note", error);
    return apiError("Failed to create note");
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return apiError("Unauthorized", 401);

    const { id } = await params;
    const { noteId } = await req.json();

    if (!noteId) return apiError("noteId is required", 400);

    const note = await db.applicationNote.findFirst({
      where: { id: Number(noteId), applicationId: Number(id) },
    });

    await db.applicationNote.deleteMany({
      where: { id: Number(noteId), applicationId: Number(id) },
    });

    if (note) {
      await logActivity({
        actorName: await getActorName(session?.id),
        userId: session?.id,
        action: "deleted a note",
        target: note.content,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logError("Delete application note", error);
    return apiError("Failed to delete note");
  }
}
