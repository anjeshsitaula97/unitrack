import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/activity";
import { getSession, apiError } from "@/lib/api-utils";
import { deleteUploadedFile } from "@/lib/marketing-files";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return apiError("Unauthorized", 401);

    const { id } = await params;
    const request = await db.marketingRequest.findUnique({
      where: { id: parseInt(id) },
      include: {
        requester: { select: { id: true, name: true, email: true, avatar: true } },
        assignee: { select: { id: true, name: true, email: true, avatar: true } },
        materials: {
          include: {
            uploader: { select: { id: true, name: true, avatar: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!request) {
      return apiError("Marketing request not found", 404);
    }

    return NextResponse.json(request);
  } catch (error) {
    console.error(error);
    return apiError("Failed to fetch marketing request");
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return apiError("Unauthorized", 401);

    const { id } = await params;
    const data = await req.json();
    const { title, description, type, status, priority, dueDate, assignedTo } = data;

    const existing = await db.marketingRequest.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existing) {
      return apiError("Marketing request not found", 404);
    }

    const updateData: Record<string, unknown> = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (type) updateData.type = type;
    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    if (dueDate) updateData.dueDate = new Date(dueDate);
    if (assignedTo !== undefined) updateData.assignedTo = assignedTo ? parseInt(assignedTo) : null;

    if (status === "Completed" && existing.status !== "Completed") {
      updateData.completedAt = new Date();
    }

    const request = await db.marketingRequest.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        requester: { select: { id: true, name: true, email: true, avatar: true } },
        assignee: { select: { id: true, name: true, email: true, avatar: true } },
        materials: {
          include: {
            uploader: { select: { id: true, name: true, avatar: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    const user = await db.user.findUnique({ where: { id: session.id } });
    await logActivity({
      actorName: user?.name || "System",
      userId: session.id,
      action: "updated a marketing request",
      target: request.title,
    });

    if (assignedTo && assignedTo !== existing.assignedTo) {
      await db.notification.create({
        data: {
          userId: assignedTo,
          title: "Marketing Request Assigned",
          message: `You have been assigned to "${request.title}"`,
          type: "Info",
        },
      });
    }

    return NextResponse.json(request);
  } catch (error) {
    console.error(error);
    return apiError("Failed to update marketing request", 400);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return apiError("Unauthorized", 401);

    const { id } = await params;
    const request = await db.marketingRequest.findUnique({
      where: { id: parseInt(id) },
    });

    if (!request) {
      return apiError("Marketing request not found", 404);
    }

    const materials = await db.marketingMaterial.findMany({
      where: { requestId: parseInt(id) },
      select: { fileUrl: true },
    });

    for (const material of materials) {
      deleteUploadedFile(material.fileUrl);
    }

    await db.marketingRequest.delete({ where: { id: parseInt(id) } });

    const user = await db.user.findUnique({ where: { id: session.id } });
    await logActivity({
      actorName: user?.name || "System",
      userId: session.id,
      action: "deleted a marketing request",
      target: request.title,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return apiError("Failed to delete marketing request", 400);
  }
}