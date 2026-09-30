import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { db as prisma } from "@/lib/db";
import { logError } from "@/lib/logger";
import { getSession, checkPermission, checkRoutePermission } from "@/lib/api-utils";
import { logActivity, diffChanges, getActorName } from "@/lib/activity";

export async function GET(req: Request) {
  try {
    const session = await getSession();
    const deniedGET = checkPermission(session, "workflow:read");
    if (deniedGET) return deniedGET;
    const { searchParams } = new URL(req.url);
    const country = searchParams.get("country");
    const visaType = searchParams.get("visaType");

    if (!country || !visaType) {
      return NextResponse.json({ error: "Country and visaType are required" }, { status: 400 });
    }

    const stages = await prisma.workflowStage.findMany({
      where: { country, visaType },
      orderBy: { order: "asc" },
    });

    return NextResponse.json(stages);
  } catch (error) {
    logError("Fetch workflow stages", error);
    return NextResponse.json({ error: "Failed to fetch workflow stages" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    const deniedPOST = checkRoutePermission(session, {
      url: "/api/workflow-stages",
      method: "POST",
    });
    if (deniedPOST) return deniedPOST;
    const { country, visaType, name, order, description, subtasks } = await req.json();

    if (!country || !visaType || !name) {
      return NextResponse.json(
        { error: "Country, visaType, and name are required" },
        { status: 400 }
      );
    }

    const newStage = await prisma.workflowStage.create({
      data: {
        country,
        visaType,
        name,
        order: order || 0,
        description,
        subtasks: subtasks ? JSON.stringify(subtasks) : "[]",
      },
    });

    await logActivity({
      actorName: await getActorName(session?.id),
      userId: session?.id,
      action: "created a workflow stage",
      target: newStage.name,
    });

    return NextResponse.json(newStage, { status: 201 });
  } catch (error) {
    logError("Create workflow stage", error);
    return NextResponse.json({ error: "Failed to create workflow stage" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getSession();
    const deniedPATCH = checkRoutePermission(session, {
      url: "/api/workflow-stages",
      method: "PATCH",
    });
    if (deniedPATCH) return deniedPATCH;
    const { id, subtasks, name, description } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (subtasks !== undefined) updateData.subtasks = JSON.stringify(subtasks);
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;

    const existing = await prisma.workflowStage.findUnique({ where: { id: Number(id) } });
    const stage = await prisma.workflowStage.update({
      where: { id: Number(id) },
      data: updateData as Prisma.WorkflowStageUpdateInput,
    });

    const changes = diffChanges(existing, stage);
    await logActivity({
      actorName: await getActorName(session?.id),
      userId: session?.id,
      action: "updated a workflow stage",
      target: stage.name,
      changes,
    });

    return NextResponse.json(stage);
  } catch (error) {
    logError("Update workflow stage", error);
    return NextResponse.json({ error: "Failed to update workflow stage" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getSession();
    const deniedDELETE = checkRoutePermission(session, {
      url: "/api/workflow-stages",
      method: "DELETE",
    });
    if (deniedDELETE) return deniedDELETE;
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const existing = await prisma.workflowStage.findUnique({ where: { id: Number(id) } });
    await prisma.workflowStage.delete({
      where: { id: Number(id) },
    });

    await logActivity({
      actorName: await getActorName(session?.id),
      userId: session?.id,
      action: "deleted a workflow stage",
      target: existing?.name || id,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logError("Delete workflow stage", error);
    return NextResponse.json({ error: "Failed to delete workflow stage" }, { status: 500 });
  }
}
