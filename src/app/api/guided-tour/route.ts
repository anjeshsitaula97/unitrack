import { NextRequest, NextResponse } from "next/server";
import { getSession, apiError } from "@/lib/api-utils";
import { logError } from "@/lib/logger";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return apiError("Unauthorized", 401);

    const { completed } = await req.json();
    const visited = new Set<string>();
    if (completed && Array.isArray(completed)) {
      completed.forEach((s: string) => visited.add(s));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logError("Guided tour", error);
    return apiError("Failed to save tour state");
  }
}
