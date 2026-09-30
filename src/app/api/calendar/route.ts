import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logError } from "@/lib/logger";
import { getSession, apiError, checkRoutePermission } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    const deniedGET = checkRoutePermission(session, { url: "/api/calendar", method: "GET" });
    if (deniedGET) return deniedGET;
    if (!session) return apiError("Unauthorized", 401);

    const { searchParams } = new URL(req.url);
    const start = searchParams.get("start");
    const end = searchParams.get("end");

    if (!start || !end) {
      return apiError("start and end query params required (ISO dates)", 400);
    }

    const startDate = new Date(start);
    const endDate = new Date(end);

    const [applications, tasks, leaveRequests, followUps, payments, holidays] = await Promise.all([
      db.application.findMany({
        where: {
          appliedDate: { gte: startDate, lte: endDate },
        },
        include: {
          student: { select: { name: true } },
          university: { select: { name: true } },
          course: { select: { name: true } },
        },
      }),
      db.task.findMany({
        where: {
          dueDate: { gte: startDate, lte: endDate },
        },
        include: { assignee: { select: { name: true } } },
      }),
      db.leaveRequest.findMany({
        where: {
          startDate: { lte: endDate },
          endDate: { gte: startDate },
          status: "Approved",
        },
        include: { user: { select: { name: true } } },
      }),
      db.lead.findMany({
        where: {
          nextFollowUp: { gte: startDate, lte: endDate },
        },
        select: { id: true, name: true, nextFollowUp: true, status: true },
      }),
      db.payment.findMany({
        where: {
          date: { gte: startDate, lte: endDate },
        },
        include: { student: { select: { name: true } } },
      }),
      db.holiday.findMany({
        where: {
          date: { gte: startDate, lte: endDate },
        },
      }),
    ]);

    const events: unknown[] = [
      ...applications.map((a) => ({
        id: `app-${a.id}`,
        title: `Application: ${a.student.name} - ${a.course.name}`,
        start: a.appliedDate.toISOString(),
        end: a.appliedDate.toISOString(),
        type: "application",
        status: a.status,
        url: `/applications`,
      })),
      ...tasks.map((t) => ({
        id: `task-${t.id}`,
        title: `Task: ${t.title}`,
        start: t.dueDate!.toISOString(),
        end: t.dueDate!.toISOString(),
        type: "task",
        priority: t.priority,
        status: t.status,
        assignee: t.assignee?.name,
        url: `/staff-tasks`,
      })),
      ...leaveRequests.map((l) => ({
        id: `leave-${l.id}`,
        title: `Leave: ${l.user.name}`,
        start: l.startDate.toISOString(),
        end: l.endDate.toISOString(),
        type: "leave",
        status: l.status,
        url: `/hr/leave`,
      })),
      ...followUps.map((f) => ({
        id: `followup-${f.id}`,
        title: `Follow-up: ${f.name}`,
        start: f.nextFollowUp!.toISOString(),
        end: f.nextFollowUp!.toISOString(),
        type: "followup",
        status: f.status,
        url: `/leads`,
      })),
      ...payments.map((p) => ({
        id: `payment-${p.id}`,
        title: `Payment: ${p.student.name} - ${p.currency} ${p.amount}`,
        start: p.date.toISOString(),
        end: p.date.toISOString(),
        type: "payment",
        status: p.status,
        url: `/payments`,
      })),
      ...holidays.map((h) => ({
        id: `holiday-${h.id}`,
        title: `Holiday: ${h.name}`,
        start: h.date.toISOString(),
        end: h.date.toISOString(),
        type: "holiday",
        status: h.type,
      })),
    ];

    return NextResponse.json(events);
  } catch (error) {
    logError("Calendar fetch", error);
    return apiError("Failed to fetch calendar events");
  }
}
