import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getStudentSession, apiError } from "@/lib/api-utils";

export async function GET() {
  try {
    const session = await getStudentSession();
    if (!session) return apiError("Unauthorized", 401);

    const payments = await db.payment.findMany({
      where: { studentId: Number(session.id) },
      orderBy: { date: "desc" },
    });

    const totalPaid = payments
      .filter((p) => p.status === "Paid" || p.status === "Completed")
      .reduce((sum, p) => sum + p.amount, 0);

    return NextResponse.json({
      payments,
      totalPaid,
      pendingAmount: payments
        .filter((p) => p.status === "Pending")
        .reduce((sum, p) => sum + p.amount, 0),
    });
  } catch (error) {
    console.error("Student payments error:", error);
    return apiError("Failed to fetch payments");
  }
}
