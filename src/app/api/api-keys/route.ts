import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import crypto from "crypto";
import { getSession, apiError } from "@/lib/api-utils";
import { logActivity, getActorName } from "@/lib/activity";
import { logError } from "@/lib/logger";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !["Admin", "Super Admin"].includes(session.role as string))
      return apiError("Unauthorized", 401);

    const keys = await db.apiKey.findMany({
      orderBy: { created: "desc" },
      select: { id: true, name: true, created: true, lastUsed: true, createdAt: true },
    });
    return NextResponse.json(keys);
  } catch (_error) {
    return NextResponse.json({ error: "Failed to fetch API keys" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !["Admin", "Super Admin"].includes(session.role as string))
      return apiError("Unauthorized", 401);

    const data = await req.json();
    const raw = "pk_live_" + crypto.randomBytes(16).toString("hex");
    const hash = crypto.createHash("sha256").update(raw).digest("hex");

    await db.apiKey.create({
      data: {
        name: data.name || "Generated Key",
        tokenHash: hash,
      },
    });

    await logActivity({
      actorName: await getActorName(session?.id),
      userId: session?.id,
      action: "created an API key",
      target: data.name || "Generated Key",
    });

    return NextResponse.json({ token: raw, name: data.name || "Generated Key" }, { status: 201 });
  } catch (error) {
    logError("Create API Key", error);
    return NextResponse.json({ error: "Failed to create API Key" }, { status: 400 });
  }
}
