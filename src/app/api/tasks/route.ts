import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { logActivity, diffChanges, getActorName } from "@/lib/activity";
import { checkPermission, checkRoutePermission, getSession } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    const deniedGET = checkPermission(session, "tasks:read");
    if (deniedGET) return deniedGET;
    const { searchParams } = new URL(req.url);
    const country = searchParams.get("country");
    const visaType = searchParams.get("visaType");

    const where: Record<string, unknown> = {};
    if (country) where.country = country;
    if (visaType) where.visaType = visaType;

    const tasks = await db.task.findMany({
      where: where as Prisma.TaskWhereInput,
      include: {
        assignee: {
          select: { id: true, name: true, avatar: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json(tasks);
  } catch (_error) {
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const deniedPOST = checkRoutePermission(session, { url: "/api/tasks", method: "POST" });
    if (deniedPOST) return deniedPOST;
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await req.json();
    const { title, description, status, priority, dueDate, assignee, country, visaType } = data;

    if (!title) return NextResponse.json({ error: "Title is required" }, { status: 400 });

    const [newTask, user] = await Promise.all([
      db.task.create({
        data: {
          title,
          description,
          status: status || "Todo",
          priority: priority || "Medium",
          dueDate: dueDate ? new Date(dueDate) : null,
          assigneeId: data.assigneeId || assignee ? Number(data.assigneeId || assignee) : null,
          country,
          visaType,
        },
      }),
      db.user.findUnique({ where: { id: session.id } }),
    ]);
    await logActivity({
      actorName: user?.name || "System",
      action: "created a task",
      target: newTask.title,
    });

    return NextResponse.json(newTask, { status: 201 });
  } catch (_error) {
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    const deniedPATCH = checkRoutePermission(session, { url: "/api/tasks", method: "PATCH" });
    if (deniedPATCH) return deniedPATCH;
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await req.json();
    const { id, ...updateData } = data;

    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

    if (updateData.dueDate) updateData.dueDate = new Date(updateData.dueDate);
    if (updateData.assigneeId !== undefined) updateData.assigneeId = Number(updateData.assigneeId);

    const existing = await db.task.findUnique({ where: { id: Number(id) } });

    const updatedTask = await db.task.update({
      where: { id: Number(id) },
      data: updateData,
    });

    const changes = diffChanges(existing, updatedTask);
    await logActivity({
      actorName: await getActorName(session?.id),
      userId: session?.id,
      action: "updated a task",
      target: updatedTask.title,
      changes,
    });

    return NextResponse.json(updatedTask);
  } catch (_error) {
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    const deniedDELETE = checkRoutePermission(session, { url: "/api/tasks", method: "DELETE" });
    if (deniedDELETE) return deniedDELETE;
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

    const existing = await db.task.findUnique({ where: { id: Number(id) } });

    await db.task.delete({ where: { id: Number(id) } });

    await logActivity({
      actorName: await getActorName(session?.id),
      userId: session?.id,
      action: "deleted a task",
      target: existing?.title || id,
    });

    return NextResponse.json({ success: true });
  } catch (_error) {
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
  }
}
