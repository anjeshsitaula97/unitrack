import { NextRequest, NextResponse } from "next/server";
import { logError } from "@/lib/logger";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/activity";
import { getPaginationParams, paginatedResponse, apiError, getSession, checkRoutePermission } from "@/lib/api-utils";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    const permError = checkRoutePermission(session, req.url, req.method);
    if (permError) return permError;

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
    logError("Failed to fetch payments:", error);
    return apiError("Failed to fetch payments");
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const permError = checkRoutePermission(session, req.url, req.method);
    if (permError) return permError;

    // Rate limit payment creation
    const rl = await checkRateLimit(`create-payment:${getClientIp(req)}`, 30, 60000);
    if (!rl.allowed) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

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
      db.user.findUnique({ where: { id: session!.id } }),
    ]);

    await logActivity({
      actorName: user?.name || "System",
      action: "recorded a payment",
      target: `${newPayment.currency} ${newPayment.amount} for ${newPayment.student.firstName} ${newPayment.student.lastName}`,
    });

    return NextResponse.json(newPayment, { status: 201 });
  } catch (error) {
    logError("Failed to record payment:", error);
    return apiError("Failed to record payment");
  }
}
