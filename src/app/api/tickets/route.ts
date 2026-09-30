import { NextRequest, NextResponse } from "next/server";
import { logError } from "@/lib/logger";
import { db } from "@/lib/db";
import { logActivity, diffChanges, getActorName } from "@/lib/activity";
import { checkPermission, checkRoutePermission, getSession } from "@/lib/api-utils";

export async function GET(_req: NextRequest) {
  try {
    const session = await getSession();
    const deniedGET = checkPermission(session, "tickets:read");
    if (deniedGET) return deniedGET;
    const tickets = await db.ticket.findMany({
      include: {
        creator: {
          select: { name: true, avatar: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(tickets);
  } catch (_error) {
    return NextResponse.json({ error: "Failed to fetch tickets" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const deniedPOST = checkRoutePermission(session, { url: "/api/tickets", method: "POST" });
    if (deniedPOST) return deniedPOST;
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await req.json();
    const { title, description, type, priority, screenshot } = data;

    if (!title || !description) {
      return NextResponse.json({ error: "Title and description are required" }, { status: 400 });
    }

    const [newTicket, user] = await Promise.all([
      db.ticket.create({
        data: {
          title,
          description,
          type: type || "Technical",
          priority: priority || "Medium",
          status: "Open",
          creatorId: session.id,
          screenshot,
        },
      }),
      db.user.findUnique({ where: { id: session.id } }),
    ]);
    await logActivity({
      actorName: user?.name || "System",
      action: "opened a ticket",
      target: newTicket.title,
    });

    return NextResponse.json(newTicket, { status: 201 });
  } catch (error) {
    logError("Ticket creation error:", error);
    return NextResponse.json({ error: "Failed to create ticket" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    const deniedPATCH = checkRoutePermission(session, { url: "/api/tickets", method: "PATCH" });
    if (deniedPATCH) return deniedPATCH;
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await req.json();
    const { id, title, description, type, priority, status, assignedTo } = data;

    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

    const allowed: Record<string, unknown> = {};
    if (title !== undefined) allowed.title = title;
    if (description !== undefined) allowed.description = description;
    if (type !== undefined) allowed.type = type;
    if (priority !== undefined) allowed.priority = priority;
    if (status !== undefined) allowed.status = status;
    if (assignedTo !== undefined) allowed.assignedTo = assignedTo;

    const existing = await db.ticket.findUnique({ where: { id: Number(id) } });

    const updatedTicket = await db.ticket.update({
      where: { id: Number(id) },
      data: allowed,
    });

    const changes = diffChanges(existing, updatedTicket);
    await logActivity({
      actorName: await getActorName(session?.id),
      userId: session?.id,
      action: "updated a ticket",
      target: updatedTicket.title,
      changes,
    });

    return NextResponse.json(updatedTicket);
  } catch (_error) {
    return NextResponse.json({ error: "Failed to update ticket" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    const deniedDELETE = checkRoutePermission(session, { url: "/api/tickets", method: "DELETE" });
    if (deniedDELETE) return deniedDELETE;
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

    const existing = await db.ticket.findUnique({ where: { id: Number(id) } });

    await db.ticket.delete({ where: { id: Number(id) } });

    await logActivity({
      actorName: await getActorName(session?.id),
      userId: session?.id,
      action: "deleted a ticket",
      target: existing?.title || id,
    });

    return NextResponse.json({ success: true });
  } catch (_error) {
    return NextResponse.json({ error: "Failed to delete ticket" }, { status: 500 });
  }
}
