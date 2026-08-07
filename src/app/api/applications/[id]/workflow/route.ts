import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logError } from "@/lib/logger";
import { getSession, apiError } from "@/lib/api-utils";
import { logActivity, diffChanges, getActorName } from "@/lib/activity";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return apiError("Unauthorized", 401);

    const { id } = await params;

    const stages = await db.applicationWorkflowStage.findMany({
      where: { applicationId: Number(id) },
      orderBy: { order: "asc" },
    });

    return NextResponse.json(stages);
  } catch (error) {
    logError("Fetch application workflow", error);
    return apiError("Failed to fetch workflow");
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return apiError("Unauthorized", 401);

    const { id } = await params;
    const { name, description } = await req.json();

    if (!name?.trim()) return apiError("Stage name is required", 400);

    const application = await db.application.findUnique({
      where: { id: Number(id) },
      include: {
        student: { select: { firstName: true, lastName: true } },
        course: { select: { name: true } },
      },
    });
    if (!application) return apiError("Application not found", 404);

    const count = await db.applicationWorkflowStage.count({
      where: { applicationId: Number(id) },
    });

    const stage = await db.applicationWorkflowStage.create({
      data: {
        applicationId: Number(id),
        name: name.trim(),
        description: description?.trim() || null,
        order: count + 1,
      },
    });

    await logActivity({
      actorName: await getActorName(session?.id),
      userId: session?.id,
      action: "created a workflow change",
      target: `${application.student.firstName} ${application.student.lastName} — ${application.course.name}`,
    });

    return NextResponse.json(stage, { status: 201 });
  } catch (error) {
    logError("Create application workflow stage", error);
    return apiError("Failed to create stage");
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return apiError("Unauthorized", 401);

    const { id } = await params;
    const { stages } = await req.json();

    if (!Array.isArray(stages)) return apiError("stages array is required", 400);

    const application = await db.application.findUnique({
      where: { id: Number(id) },
      include: {
        student: { select: { firstName: true, lastName: true } },
        course: { select: { name: true } },
      },
    });
    if (!application) return apiError("Application not found", 404);

    const existingStages = await db.applicationWorkflowStage.findMany({
      where: { applicationId: Number(id) },
    });

    await db.$transaction(
      stages.map(
        (s: {
          id: string;
          name?: string;
          description?: string;
          order?: number;
          subtasks?: string;
        }) =>
          db.applicationWorkflowStage.update({
            where: { id: Number(s.id) },
            data: {
              ...(s.name !== undefined && { name: s.name }),
              ...(s.description !== undefined && { description: s.description }),
              ...(s.order !== undefined && { order: s.order }),
              ...(s.subtasks !== undefined && { subtasks: s.subtasks }),
            },
          })
      )
    );

    const changes = stages.flatMap(
      (s: {
        id: string;
        name?: string;
        description?: string;
        order?: number;
        subtasks?: string;
      }) => {
        const before = existingStages.find((st) => st.id === Number(s.id));
        if (!before) return [];
        const after: Record<string, unknown> = { ...before };
        if (s.name !== undefined) after.name = s.name;
        if (s.description !== undefined) after.description = s.description;
        if (s.order !== undefined) after.order = s.order;
        if (s.subtasks !== undefined) after.subtasks = s.subtasks;
        return diffChanges(before as Record<string, unknown>, after);
      }
    );

    await logActivity({
      actorName: await getActorName(session?.id),
      userId: session?.id,
      action: "updated a workflow change",
      target: `${application.student.firstName} ${application.student.lastName} — ${application.course.name}`,
      changes,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logError("Update application workflow", error);
    return apiError("Failed to update workflow");
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return apiError("Unauthorized", 401);

    const { id } = await params;
    const { stageId } = await req.json();

    if (!stageId) return apiError("stageId is required", 400);

    const stage = await db.applicationWorkflowStage.findUnique({ where: { id: Number(stageId) } });

    await db.applicationWorkflowStage.delete({ where: { id: Number(stageId) } });

    if (stage) {
      await logActivity({
        actorName: await getActorName(session?.id),
        userId: session?.id,
        action: "deleted a workflow change",
        target: stage.name,
      });
    }

    const remaining = await db.applicationWorkflowStage.findMany({
      where: { applicationId: Number(id) },
      orderBy: { order: "asc" },
    });

    await db.$transaction(
      remaining.map((s, i) =>
        db.applicationWorkflowStage.update({
          where: { id: s.id },
          data: { order: i + 1 },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    logError("Delete application workflow stage", error);
    return apiError("Failed to delete stage");
  }
}
