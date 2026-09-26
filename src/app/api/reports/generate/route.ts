import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { logError } from "@/lib/logger";
import { getSession, apiError } from "@/lib/api-utils";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return apiError("Unauthorized", 401);

    const { entity, fields, filters, chartType: _chartType } = await req.json();
    if (!entity || !fields?.length) {
      return NextResponse.json({ error: "entity and fields[] required" }, { status: 400 });
    }

    let data: unknown[] = [];
    const include: Record<string, unknown> = {};
    if (fields.includes("university")) include.university = { select: { name: true } };
    if (fields.includes("student")) include.student = { select: { name: true, email: true } };
    if (fields.includes("course")) include.course = { select: { name: true } };

    const where: Record<string, unknown> = {};
    if (filters?.length) {
      for (const f of filters) {
        if (!f.value) continue;
        if (f.op === "contains") where[f.field] = { contains: f.value };
        else if (f.op === "equals") where[f.field] = f.value;
        else if (f.op === "gt")
          where[f.field] = { gt: isNaN(Number(f.value)) ? f.value : Number(f.value) };
        else if (f.op === "lt")
          where[f.field] = { lt: isNaN(Number(f.value)) ? f.value : Number(f.value) };
        else if (f.op === "startsWith")
          where[f.field] = { startsWith: f.value };
      }
    }

    switch (entity) {
      case "Student":
        data = await db.student.findMany({
          where: where as Prisma.StudentWhereInput,
          include: include as Prisma.StudentInclude,
          take: 500,
        });
        break;
      case "University":
        data = await db.university.findMany({
          where: where as Prisma.UniversityWhereInput,
          include: include as Prisma.UniversityInclude,
          take: 500,
        });
        break;
      case "Course":
        data = await db.course.findMany({
          where: where as Prisma.CourseWhereInput,
          include: include as Prisma.CourseInclude,
          take: 500,
        });
        break;
      case "Lead":
        data = await db.lead.findMany({ where: where as Prisma.LeadWhereInput, take: 500 });
        break;
      case "Payment":
        data = await db.payment.findMany({
          where: { ...where, studentId: where.studentId } as Prisma.PaymentWhereInput,
          include: include as Prisma.PaymentInclude,
          take: 500,
        });
        break;
      case "Application":
        data = await db.application.findMany({
          where: where as Prisma.ApplicationWhereInput,
          include: include as Prisma.ApplicationInclude,
          take: 500,
        });
        break;
      default:
        return NextResponse.json({ error: "Invalid entity" }, { status: 400 });
    }

    const mapped = data.map((row) => {
      const r = row as Record<string, unknown>;
      const obj: Record<string, unknown> = {};
      for (const field of fields) {
        if (field === "university") obj[field] = (r.university as { name?: string })?.name || "-";
        else if (field === "student") obj[field] = (r.student as { name?: string })?.name || "-";
        else if (field === "course") obj[field] = (r.course as { name?: string })?.name || "-";
        else obj[field] = r[field] ?? "-";
      }
      return obj;
    });

    return NextResponse.json(mapped);
  } catch (error) {
    logError("Report generation", error);
    return apiError("Failed to generate report");
  }
}
