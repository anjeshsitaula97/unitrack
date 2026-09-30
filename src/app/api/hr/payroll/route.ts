import { NextResponse } from "next/server";
import { logError } from "@/lib/logger";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { logActivity, getActorName } from "@/lib/activity";
import { getSession, checkPermission } from "@/lib/api-utils";

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const deniedGET = checkPermission(session, "hr:read");
    if (deniedGET) return deniedGET;

    const { searchParams } = new URL(req.url);
    const month = parseInt(searchParams.get("month") || String(new Date().getMonth() + 1));
    const year = parseInt(searchParams.get("year") || String(new Date().getFullYear()));

    // Staff see only their own payslips; admins see the whole period.
    const where: Record<string, unknown> = { month, year };
    if (!["Admin", "Super Admin"].includes(session.role)) where.userId = session.id;

    const records = await db.payroll.findMany({
      where: where as Prisma.PayrollWhereInput,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            employeeId: true,
            basicSalary: true,
            department: { select: { name: true } },
          },
        },
        items: true,
      },
    });
    return NextResponse.json(records);
  } catch (error) {
    logError("Fetch Payroll Error:", error);
    return NextResponse.json({ error: "Failed to fetch payroll" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    const deniedPOST = checkPermission(session, "hr:payroll");
    if (deniedPOST) return deniedPOST;
    if (!session || !["Admin", "Super Admin"].includes(session.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { userId, month, year, basicSalary, allowances, deductions, bonus, items } = body;

    if (!userId || !month || !year) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const totalAllowances = allowances || 0;
    const totalDeductions = deductions || 0;
    const totalBonus = bonus || 0;
    const netSalary = (basicSalary || 0) + totalAllowances + totalBonus - totalDeductions;

    const payroll = await db.payroll.create({
      data: {
        userId: Number(userId),
        month: parseInt(month),
        year: parseInt(year),
        basicSalary: parseFloat(basicSalary) || 0,
        allowances: totalAllowances,
        deductions: totalDeductions,
        bonus: totalBonus,
        netSalary,
        items: {
          create: (items || []).map(
            (item: { label: string; type: string; amount?: string | number }) => ({
              label: item.label,
              type: item.type,
              amount: parseFloat(String(item.amount ?? "")) || 0,
            })
          ),
        },
      },
      include: {
        user: { select: { id: true, name: true, employeeId: true } },
        items: true,
      },
    });
    await logActivity({
      actorName: await getActorName(session?.id),
      userId: session?.id,
      action: "created a payroll record",
      target: payroll.user?.name || String(payroll.id),
    });
    return NextResponse.json(payroll);
  } catch (error) {
    logError("Create Payroll Error:", error);
    return NextResponse.json({ error: "Failed to create payroll" }, { status: 500 });
  }
}
