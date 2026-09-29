import { NextRequest, NextResponse } from "next/server";
import { logError } from "@/lib/logger";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/activity";
import { getSession, apiError } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return apiError("Unauthorized", 401);

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status") || "";
    const type = searchParams.get("type") || "";
    const search = searchParams.get("search") || "";
    const assignedToMe = searchParams.get("assignedToMe") === "true";

    const where: Record<string, unknown> = {};

    if (status) where.status = status;
    if (type) where.type = type;
    if (assignedToMe) where.assignedTo = session.id;
    if (search) {
      where.OR = [{ title: { contains: search } }, { description: { contains: search } }];
    }

    const [requests, total] = await Promise.all([
      db.marketingRequest.findMany({
        where,
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
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.marketingRequest.count({ where }),
    ]);

    return NextResponse.json({
      requests,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logError("Fetch marketing requests", error);
    return apiError("Failed to fetch marketing requests");
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return apiError("Unauthorized", 401);

    const data = await req.json();
    const { title, description, type, priority, dueDate, assignedTo } = data;

    if (!title || !description) {
      return apiError("Title and description are required", 400);
    }

    const request = await db.marketingRequest.create({
      data: {
        title,
        description,
        type: type || "Graphic Design",
        priority: priority || "Medium",
        dueDate: dueDate ? new Date(dueDate) : null,
        requestedBy: session.id,
        assignedTo: assignedTo ? parseInt(assignedTo) : null,
        status: "Pending",
      },
      include: {
        requester: { select: { id: true, name: true, email: true, avatar: true } },
        assignee: { select: { id: true, name: true, email: true, avatar: true } },
      },
    });

    const user = await db.user.findUnique({ where: { id: session.id } });
    await logActivity({
      actorName: user?.name || "System",
      userId: session.id,
      action: "created a marketing request",
      target: request.title,
    });

    if (request.assignedTo) {
      await db.notification.create({
        data: {
          userId: String(request.assignedTo),
          title: "New Marketing Request Assigned",
          message: `You have been assigned to "${request.title}"`,
          type: "Info",
        },
      });
    }

    return NextResponse.json(request, { status: 201 });
  } catch (error) {
    logError("Create marketing request", error);
    return apiError("Failed to create marketing request", 400);
  }
}
