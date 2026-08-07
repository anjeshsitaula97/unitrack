import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/activity";
import { getSession, apiError } from "@/lib/api-utils";

export async function GET(_req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return apiError("Unauthorized", 401);

    const expenses = await db.expense.findMany({
      orderBy: { date: "desc" },
    });
    return NextResponse.json(expenses);
  } catch (_error) {
    return NextResponse.json({ error: "Failed to fetch expenses" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !["Admin", "Super Admin", "Staff"].includes(session.role as string))
      return apiError("Unauthorized", 401);

    const data = await req.json();

    const {
      category,
      amount,
      currency,
      date,
      description,
      paidTo,
      method,
      billNo,
      transactionNo,
      screenshot,
    } = data;

    if (!category || !amount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const [newExpense, user] = await Promise.all([
      db.expense.create({
        data: {
          category,
          amount: parseFloat(amount),
          currency: currency || "NPR",
          date: date ? new Date(date) : new Date(),
          description,
          paidTo,
          method,
          billNo,
          transactionNo,
          screenshot,
        },
      }),
      db.user.findUnique({ where: { id: session.id } }),
    ]);

    await logActivity({
      actorName: user?.name || "System",
      action: "recorded an expense",
      target: `${newExpense.category} - ${newExpense.currency} ${newExpense.amount}`,
    });

    return NextResponse.json(newExpense, { status: 201 });
  } catch (_error) {
    return NextResponse.json({ error: "Failed to record expense" }, { status: 500 });
  }
}
