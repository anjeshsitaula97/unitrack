import { NextResponse } from "next/server";
import { db } from "@/lib/db";
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

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const month = parseInt(searchParams.get("month") || String(new Date().getMonth() + 1));
    const year = parseInt(searchParams.get("year") || String(new Date().getFullYear()));

    const where: any = { month, year };
    if (!["Admin", "Super Admin"].includes(session.role)) where.userId = session.id;

    const records = await db.payroll.findMany({
      where,
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
    console.error("Fetch Payroll Error:", error);
    return NextResponse.json({ error: "Failed to fetch payroll" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
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
          create: (items || []).map((item: any) => ({
            label: item.label,
            type: item.type,
            amount: parseFloat(item.amount) || 0,
          })),
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
    console.error("Create Payroll Error:", error);
    return NextResponse.json({ error: "Failed to create payroll" }, { status: 500 });
  }
}
