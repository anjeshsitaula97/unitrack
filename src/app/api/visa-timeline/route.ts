import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logError } from "@/lib/logger";
import { getSession, apiError } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return apiError("Unauthorized", 401);

    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");
    const country = searchParams.get("country") || "";
    const visaType = searchParams.get("visaType") || "";

    const where: Record<string, unknown> = {};
    if (studentId) where.studentId = Number(studentId);
    if (country) where.country = country;
    if (visaType) where.visaType = visaType;

    const [stages, tasks, applications] = await Promise.all([
      db.workflowStage.findMany({
        where: { country: country || undefined, visaType: visaType || undefined },
        orderBy: { order: "asc" },
      }),
      db.task.findMany({
        where: {
          type: "Visa",
          ...(country ? { country } : {}),
          ...(visaType ? { visaType } : {}),
        },
        include: { assignee: { select: { name: true } } },
        orderBy: { createdAt: "asc" },
      }),
      studentId
        ? db.application.findMany({
            where: { studentId: Number(studentId) },
            include: {
              university: { select: { name: true, country: true } },
              course: { select: { name: true } },
            },
          })
        : [],
    ]);

    const timeline = stages.map((stage, index) => {
      const relatedTasks = tasks.filter(
        (t) => t.country === stage.country && t.visaType === stage.visaType
      );
      const completedTasks = relatedTasks.filter(
        (t) => t.status === "Done" || t.status === "Completed"
      );
      const progress =
        relatedTasks.length > 0
          ? Math.round((completedTasks.length / relatedTasks.length) * 100)
          : 0;

      return {
        id: stage.id,
        name: stage.name,
        order: stage.order,
        description: stage.description,
        country: stage.country,
        visaType: stage.visaType,
        tasks: relatedTasks.map((t) => ({
          id: t.id,
          title: t.title,
          status: t.status,
          priority: t.priority,
          dueDate: t.dueDate,
          assignee: t.assignee?.name,
        })),
        progress,
        completedTasks: completedTasks.length,
        totalTasks: relatedTasks.length,
        isActive:
          index ===
            stages.findLastIndex((s) =>
              tasks.some(
                (t) =>
                  t.country === s.country &&
                  t.visaType === s.visaType &&
                  t.status !== "Completed" &&
                  t.status !== "Done"
              )
            ) ||
          (index === 0 && relatedTasks.length === 0),
      };
    });

    const enrichedTimeline = timeline.map((stage) => ({
      ...stage,
      applications: applications.filter(
        (a) => a.university.country === stage.country || !stage.country
      ),
    }));

    return NextResponse.json({
      stages: enrichedTimeline,
      visaTasks: tasks,
      applications,
      summary: {
        totalStages: stages.length,
        completedStages: timeline.filter((s) => s.progress === 100).length,
        overallProgress:
          stages.length > 0
            ? Math.round(timeline.reduce((sum, s) => sum + s.progress, 0) / stages.length)
            : 0,
      },
    });
  } catch (error) {
    logError("Visa timeline", error);
    return apiError("Failed to fetch visa timeline");
  }
}
