import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logError } from "@/lib/logger";
import { cookies } from "next/headers";
import { verifyAuth } from "@/lib/session";
import { logActivity, getActorName } from "@/lib/activity";

async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) return null;
  try {
    return await verifyAuth(token);
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const settings = await db.systemSettings.findFirst();

    return NextResponse.json({
      officeLatitude: settings?.officeLatitude ?? null,
      officeLongitude: settings?.officeLongitude ?? null,
      officeRadius: settings?.officeRadius ?? 100,
    });
  } catch (error) {
    logError("Fetch office settings", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getSession();
    if (!session || !["Admin", "Super Admin"].includes(session.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const existing = await db.systemSettings.findFirst();

    await db.systemSettings.upsert({
      where: { id: 1 },
      update: {
        officeLatitude: body.officeLatitude != null ? parseFloat(body.officeLatitude) : null,
        officeLongitude: body.officeLongitude != null ? parseFloat(body.officeLongitude) : null,
        officeRadius: body.officeRadius != null ? parseFloat(body.officeRadius) : 100,
      },
      create: {
        officeLatitude: body.officeLatitude != null ? parseFloat(body.officeLatitude) : null,
        officeLongitude: body.officeLongitude != null ? parseFloat(body.officeLongitude) : null,
        officeRadius: body.officeRadius != null ? parseFloat(body.officeRadius) : 100,
      },
    });

    await logActivity({
      actorName: await getActorName(session?.id),
      userId: session?.id,
      action: "updated HR settings",
      target: "HR settings",
      details: JSON.stringify([
        {
          field: "settings",
          from: JSON.stringify({
            officeLatitude: existing?.officeLatitude,
            officeLongitude: existing?.officeLongitude,
            officeRadius: existing?.officeRadius,
          }),
          to: JSON.stringify({
            officeLatitude: body.officeLatitude != null ? parseFloat(body.officeLatitude) : null,
            officeLongitude: body.officeLongitude != null ? parseFloat(body.officeLongitude) : null,
            officeRadius: body.officeRadius != null ? parseFloat(body.officeRadius) : 100,
          }),
        },
      ]),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logError("Update office settings", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
