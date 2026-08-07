import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logError } from "@/lib/logger";
import { getSession, apiError } from "@/lib/api-utils";
import { logActivity, getActorName } from "@/lib/activity";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return apiError("Unauthorized", 401);

    const holidays = await db.holiday.findMany({
      orderBy: { date: "asc" },
    });

    return NextResponse.json(holidays);
  } catch (error) {
    logError("Fetch holidays", error);
    return apiError("Failed to fetch holidays");
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return apiError("Unauthorized", 401);

    const { name, date, type } = await req.json();
    if (!name || !date) {
      return NextResponse.json({ error: "Name and date are required" }, { status: 400 });
    }

    const holiday = await db.holiday.create({
      data: {
        name,
        date: new Date(date),
        type: type || "Public",
      },
    });

    await logActivity({
      actorName: await getActorName(session?.id),
      userId: session?.id,
      action: "created a holiday",
      target: holiday.name,
    });

    return NextResponse.json(holiday, { status: 201 });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return NextResponse.json({ error: "Holiday already exists on this date" }, { status: 409 });
    }
    logError("Create holiday", error);
    return apiError("Failed to create holiday");
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return apiError("Unauthorized", 401);

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing id parameter" }, { status: 400 });
    }

    const holiday = await db.holiday.findUnique({ where: { id: Number(id) } });
    await db.holiday.delete({ where: { id: Number(id) } });
    await logActivity({
      actorName: await getActorName(session?.id),
      userId: session?.id,
      action: "deleted a holiday",
      target: holiday?.name || id,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    logError("Delete holiday", error);
    return apiError("Failed to delete holiday");
  }
}
