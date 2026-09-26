import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/activity";
import { getPaginationParams, paginatedResponse, apiError, getSession } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return apiError("Unauthorized", 401);

    const { searchParams } = new URL(req.url);
    const params = getPaginationParams(searchParams);
    const studentId = searchParams.get("studentId");
    const statusFilter = searchParams.get("status") || "";
    const methodFilter = searchParams.get("method") || "";

    const where: Record<string, unknown> = {};
    if (studentId) where.studentId = Number(studentId);
    if (statusFilter) where.status = statusFilter;
    if (methodFilter) where.method = methodFilter;

    if (params.search) {
      where.student = {
        OR: [
          { firstName: { contains: params.search } },
          { lastName: { contains: params.search } },
          { email: { contains: params.search } },
        ],
      };
    }

    const [payments, total] = await Promise.all([
      db.payment.findMany({
        where: where as Prisma.PaymentWhereInput,
        include: {
          student: {
            select: { firstName: true, lastName: true, email: true },
          },
        },
        orderBy: { date: "desc" },
        skip: params.skip,
        take: params.perPage,
      }),
      db.payment.count({ where: where as Prisma.PaymentWhereInput }),
    ]);

    return NextResponse.json(paginatedResponse(payments, total, params));
  } catch (error) {
    console.error("Failed to fetch payments:", error);
    return apiError("Failed to fetch payments");
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await req.json();
    const studentId = Number(data.studentId);
    const { amount, currency, status, method, date, description, proofUrl } = data;

    if (!studentId || !amount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const [newPayment, user] = await Promise.all([
      db.payment.create({
        data: {
          studentId,
          amount: parseFloat(amount),
          currency: currency || "NPR",
          status: status || "Pending",
          method: method || "Cash",
          date: date ? new Date(date) : new Date(),
          description: description || "",
          proofUrl: proofUrl || null,
        },
        include: { student: true },
      }),
      db.user.findUnique({ where: { id: session.id } }),
    ]);

    await logActivity({
      actorName: user?.name || "System",
      action: "recorded a payment",
      target: `${newPayment.currency} ${newPayment.amount} for ${newPayment.student.firstName} ${newPayment.student.lastName}`,
    });

    return NextResponse.json(newPayment, { status: 201 });
  } catch (error) {
    console.error("Failed to record payment:", error);
    return apiError("Failed to record payment");
  }
}
