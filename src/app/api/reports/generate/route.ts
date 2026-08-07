import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logError } from "@/lib/logger";
import { getSession, apiError } from "@/lib/api-utils";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return apiError("Unauthorized", 401);

    const { entity, fields, filters, chartType } = await req.json();
    if (!entity || !fields?.length) {
      return NextResponse.json({ error: "entity and fields[] required" }, { status: 400 });
    }

    let data: any[] = [];
    const include: any = {};
    if (fields.includes("university")) include.university = { select: { name: true } };
    if (fields.includes("student")) include.student = { select: { name: true, email: true } };
    if (fields.includes("course")) include.course = { select: { name: true } };

    const where: any = {};
    if (filters?.length) {
      for (const f of filters) {
        if (!f.value) continue;
        if (f.op === "contains") where[f.field] = { contains: f.value, mode: "insensitive" };
        else if (f.op === "equals") where[f.field] = f.value;
        else if (f.op === "gt")
          where[f.field] = { gt: isNaN(Number(f.value)) ? f.value : Number(f.value) };
        else if (f.op === "lt")
          where[f.field] = { lt: isNaN(Number(f.value)) ? f.value : Number(f.value) };
        else if (f.op === "startsWith")
          where[f.field] = { startsWith: f.value, mode: "insensitive" };
      }
    }

    switch (entity) {
      case "Student":
        data = await db.student.findMany({ where, include, take: 500 });
        break;
      case "University":
        data = await db.university.findMany({ where, include, take: 500 });
        break;
      case "Course":
        data = await db.course.findMany({ where, include, take: 500 });
        break;
      case "Lead":
        data = await db.lead.findMany({ where, take: 500 });
        break;
      case "Payment":
        data = await db.payment.findMany({
          where: { ...where, studentId: where.studentId },
          include,
          take: 500,
        });
        break;
      case "Application":
        data = await db.application.findMany({ where, include, take: 500 });
        break;
      default:
        return NextResponse.json({ error: "Invalid entity" }, { status: 400 });
    }

    const mapped = data.map((row: any) => {
      const obj: Record<string, any> = {};
      for (const field of fields) {
        if (field === "university") obj[field] = row.university?.name || "-";
        else if (field === "student") obj[field] = row.student?.name || "-";
        else if (field === "course") obj[field] = row.course?.name || "-";
        else obj[field] = row[field] ?? "-";
      }
      return obj;
    });

    return NextResponse.json(mapped);
  } catch (error) {
    logError("Report generation", error);
    return apiError("Failed to generate report");
  }
}
