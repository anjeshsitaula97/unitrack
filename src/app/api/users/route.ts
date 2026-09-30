import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logError } from "@/lib/logger";
import { checkRoutePermission, getSession } from "@/lib/api-utils";

export async function GET() {
  try {
    const session = await getSession();
    const deniedGET = checkRoutePermission(session, { url: "/api/users", method: "GET" });
    if (deniedGET) return deniedGET;
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const users = await db.user.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    logError("Fetch users", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}
