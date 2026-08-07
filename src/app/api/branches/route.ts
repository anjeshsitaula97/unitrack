import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logError } from "@/lib/logger";
import { getSession } from "@/lib/api-utils";
import { logActivity, getActorName } from "@/lib/activity";

export async function GET() {
  try {
    const branches = await db.branch.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(branches);
  } catch (error) {
    logError("Fetch branches", error);
    return NextResponse.json({ error: "Failed to fetch branches" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const data = await req.json();

    if (!data.name) {
      return NextResponse.json({ error: "Branch name is required" }, { status: 400 });
    }

    const branch = await db.branch.create({
      data: {
        name: data.name,
        location: data.location,
        manager: data.manager,
        phone: data.phone,
        email: data.email,
        status: data.status || "Active",
        logo: data.logo,
        latitude: data.latitude != null ? parseFloat(data.latitude) : null,
        longitude: data.longitude != null ? parseFloat(data.longitude) : null,
      },
    });

    await logActivity({
      actorName: await getActorName(session?.id),
      userId: session?.id,
      action: "created a branch",
      target: branch.name,
    });

    return NextResponse.json(branch);
  } catch (error) {
    logError("Create branch", error);
    return NextResponse.json({ error: "Failed to create branch" }, { status: 500 });
  }
}
