import { NextResponse } from "next/server";
import { logError } from "@/lib/logger";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { verifyAuth } from "@/lib/session";

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

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const year = parseInt(searchParams.get("year") || String(new Date().getFullYear()));

    const where: Record<string, unknown> = { year };
    if (userId) where.userId = userId;
    if (!["Admin", "Super Admin"].includes(session.role) && !userId) where.userId = session.id;

    const balances = await db.leaveBalance.findMany({
      where: where as Prisma.LeaveBalanceWhereInput,
      include: {
        leaveType: { select: { id: true, name: true, daysPerYear: true } },
        user: { select: { id: true, name: true, employeeId: true } },
      },
      orderBy: [{ userId: "asc" }, { leaveType: { name: "asc" } }],
    });
    return NextResponse.json(balances);
  } catch (error) {
    logError("Fetch Leave Balances Error:", error);
    return NextResponse.json({ error: "Failed to fetch leave balances" }, { status: 500 });
  }
}
