import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { logError } from "@/lib/logger";
import { getSession, apiError, checkRoutePermission } from "@/lib/api-utils";

type ReportRow = {
  id?: number;
  name?: string;
  email?: string;
  role?: string;
  status?: string;
  createdAt?: string | Date;
  lastLogin?: string | Date;
  appliedDate?: string | Date;
  date?: string | Date;
  amount?: number | string;
  currency?: string;
  method?: string;
  description?: string;
  proofUrl?: string;
  prerequisites?: unknown;
  university?: { name?: string } | null;
  student?: { name?: string; email?: string } | null;
  course?: { name?: string } | null;
};

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    const deniedGET = checkRoutePermission(session, { url: "/api/reports", method: "GET" });
    if (deniedGET) return deniedGET;
    if (!session) return apiError("Unauthorized", 401);

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const start = searchParams.get("startDate");
    const end = searchParams.get("endDate");

    // Build the Prisma 'where' clause for createdAt filtering
    const dateFilter: { createdAt?: { gte?: Date; lte?: Date } } = {};
    if (start || end) {
      dateFilter.createdAt = {};
      if (start) dateFilter.createdAt.gte = new Date(start);
      // Set end date boundary to the end of the day or exact match
      if (end) {
        const endDate = new Date(end);
        endDate.setHours(23, 59, 59, 999);
        dateFilter.createdAt.lte = endDate;
      }
    }

    let data: unknown[] = [];

    switch (type) {
      case "universities":
        data = await db.university.findMany({
          where: dateFilter as Prisma.UniversityWhereInput,
          orderBy: { createdAt: "desc" },
        });
        break;
      case "courses":
        data = await db.course.findMany({
          where: dateFilter as Prisma.CourseWhereInput,
          include: { university: { select: { name: true } } },
          orderBy: { createdAt: "desc" },
        });
        // Flatten for excel
        data = data.map((row) => {
          const c = row as ReportRow;
          return {
            ...c,
            universityName: c.university?.name || "Unknown",
            prerequisites: undefined, // removing raw JSON from report
            university: undefined,
          };
        });
        break;
      case "users":
        data = await db.user.findMany({
          where: dateFilter as Prisma.UserWhereInput,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true,
            createdAt: true,
            lastLogin: true,
          },
        });
        break;
      case "applications":
        data = await db.application.findMany({
          where: { appliedDate: dateFilter.createdAt } as Prisma.ApplicationWhereInput,
          include: {
            student: { select: { name: true, email: true } },
            university: { select: { name: true } },
            course: { select: { name: true } },
          },
          orderBy: { appliedDate: "desc" },
        });
        data = data.map((row) => {
          const a = row as ReportRow;
          return {
            "Application ID": a.id,
            "Student Name": a.student?.name || "N/A",
            "Student Email": a.student?.email || "N/A",
            University: a.university?.name || "N/A",
            Course: a.course?.name || "N/A",
            Status: a.status,
            "Date Applied": a.appliedDate,
          };
        });
        break;
      case "payments":
        data = await db.payment.findMany({
          where: { date: dateFilter.createdAt } as Prisma.PaymentWhereInput,
          include: {
            student: { select: { name: true, email: true } },
          },
          orderBy: { date: "desc" },
        });
        data = data.map((row) => {
          const p = row as ReportRow;
          return {
            "Payment ID": p.id,
            "Student Name": p.student?.name || "N/A",
            "Student Email": p.student?.email || "N/A",
            Amount: p.amount,
            Currency: p.currency,
            Method: p.method,
            Status: p.status,
            "Transaction Date": p.date,
            Description: p.description,
            "Proof Link": p.proofUrl || "No attachment",
          };
        });
        break;
      default:
        return NextResponse.json({ error: "Invalid report type" }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (error) {
    logError("Reports", error);
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 });
  }
}
