import { NextResponse } from "next/server";
import { getSession, apiError } from "@/lib/api-utils";
import { isConfigured } from "@/lib/master-api";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return apiError("Unauthorized", 401);

    if (!isConfigured()) {
      return NextResponse.json({ configured: false, connected: false });
    }

    const MASTER_API_URL = process.env.MASTER_API_URL || "http://localhost:5000";
    let connected = false;
    try {
      const res = await fetch(`${MASTER_API_URL}/api/health`, {
        signal: AbortSignal.timeout(5000),
      });
      connected = res.ok;
    } catch {}

    return NextResponse.json({ configured: true, connected, url: MASTER_API_URL });
  } catch (_error) {
    return apiError("Failed to check Master API status");
  }
}
