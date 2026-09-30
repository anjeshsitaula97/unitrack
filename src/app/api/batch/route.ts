import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logError } from "@/lib/logger";
import { getSession, apiError, checkPermission } from "@/lib/api-utils";
import { logActivity } from "@/lib/activity";
import { createNotification } from "@/lib/notifications";
import {
  softDeleteStudent,
  softDeleteUniversity,
  softDeleteCourse,
  softDeleteLead,
} from "@/lib/trash";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const deniedPOST = checkPermission(session, "batch:write");
    if (deniedPOST) return deniedPOST;
    if (!session) return apiError("Unauthorized", 401);

    const { entity, ids, action, data } = await req.json();
    if (!entity || !ids?.length || !action) {
      return NextResponse.json({ error: "entity, ids[], and action required" }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { id: session.id } });
    let count = 0;

    switch (action) {
      case "delete": {
        for (const rawId of ids) {
          const id = Number(rawId);
          switch (entity) {
            case "students":
              await softDeleteStudent(String(id));
              break;
            case "universities":
              await softDeleteUniversity(id);
              break;
            case "courses":
              await softDeleteCourse(id);
              break;
            case "leads":
              await softDeleteLead(id);
              break;
          }
          count++;
        }
        break;
      }
      case "updateStatus": {
        if (!data?.status)
          return NextResponse.json({ error: "status required for updateStatus" }, { status: 400 });
        for (const rawId of ids) {
          const id = Number(rawId);
          switch (entity) {
            case "students":
              await db.student.update({ where: { id }, data: { status: data.status } });
              break;
            case "universities":
              await db.university.update({ where: { id }, data: { status: data.status } });
              break;
            case "courses":
              await db.course.update({ where: { id }, data: { status: data.status } });
              break;
            case "leads":
              await db.lead.update({ where: { id }, data: { status: data.status } });
              break;
            case "applications":
              await db.application.update({ where: { id }, data: { status: data.status } });
              break;
            case "payments":
              await db.payment.update({ where: { id }, data: { status: data.status } });
              break;
          }
          count++;
        }
        break;
      }
      case "assignCounselor": {
        if (!data?.counselor)
          return NextResponse.json({ error: "counselor required" }, { status: 400 });
        for (const rawId of ids) {
          const id = Number(rawId);
          switch (entity) {
            case "students":
              await db.student.update({ where: { id }, data: { counselor: data.counselor } });
              break;
            case "leads":
              await db.lead.update({ where: { id }, data: { counselor: data.counselor } });
              break;
          }
          count++;
        }
        break;
      }
      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }

    await logActivity({
      actorName: user?.name || "System",
      action: `batch ${action}`,
      target: `${count} ${entity}`,
    });

    await createNotification({
      title: "Batch Operation Complete",
      message: `${action} applied to ${count} ${entity}`,
      type: "Success",
    });

    return NextResponse.json({ success: true, count });
  } catch (error) {
    logError("Batch operation", error);
    return apiError("Batch operation failed");
  }
}
