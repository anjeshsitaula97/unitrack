import { NextResponse } from "next/server";
import { logError } from "@/lib/logger";
import { db } from "@/lib/db";
import { checkRoutePermission, getSession } from "@/lib/api-utils";

export async function GET() {
  try {
    const session = await getSession();
    const deniedGET = checkRoutePermission(session, { url: "/api/hr/dashboard", method: "GET" });
    if (deniedGET) return deniedGET;
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    const _startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

    const [
      totalEmployees,
      departments,
      designations,
      pendingLeaves,
      todayAttendance,
      payrollThisMonth,
    ] = await Promise.all([
      db.user.count({ where: { role: { notIn: ["Admin", "Student"] } } }),
      db.department.count(),
      db.designation.count(),
      db.leaveRequest.count({ where: { status: "Pending" } }),
      db.attendance.findMany({
        where: {
          date: {
            gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
            lte: endOfMonth,
          },
        },
        include: { user: { select: { id: true, name: true, avatar: true, employeeId: true } } },
        take: 10,
      }),
      db.payroll.count({ where: { month, year, status: { not: "Draft" } } }),
    ]);

    const todayPresent = await db.attendance.count({
      where: {
        date: { gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()), lte: endOfMonth },
        status: "Present",
      },
    });

    return NextResponse.json({
      totalEmployees,
      departments,
      designations,
      pendingLeaves,
      todayPresent,
      totalPayrolls: payrollThisMonth,
      recentAttendance: todayAttendance,
    });
  } catch (error) {
    logError("HR Dashboard Error:", error);
    return NextResponse.json({ error: "Failed to fetch HR dashboard" }, { status: 500 });
  }
}
