import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession, apiError } from "@/lib/api-utils";
import { isSuperAdminRole } from "@/lib/permission-catalog";
import { logError } from "@/lib/logger";
import { logActivity, getActorName } from "@/lib/activity";
import { runWithConsultancy } from "@/lib/consultancy";

async function requireSuperAdmin() {
  const session = await getSession();
  if (!session) return { session: null, error: apiError("Unauthorized", 401) };
  if (!isSuperAdminRole(session.role)) {
    return { session: null, error: apiError("Forbidden: Super Admin only", 403) };
  }
  return { session, error: null };
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { session, error } = await requireSuperAdmin();
    if (error) return error;
    if (!session) return apiError("Unauthorized", 401);

    const { id } = await ctx.params;
    const consultancyId = Number(id);
    if (!Number.isInteger(consultancyId) || consultancyId <= 0) {
      return apiError("Invalid consultancy id", 400);
    }

    const existing = await db.consultancy.findUnique({ where: { id: consultancyId } });
    if (!existing) return apiError("Consultancy not found", 404);

    const body = await req.json();
    const data: Record<string, unknown> = {};
    const fields = [
      "name",
      "status",
      "email",
      "phone",
      "website",
      "address",
      "logoUrl",
      "packageName",
      "packageStartDate",
      "packageExpiryDate",
      "maxUsers",
    ];
    for (const field of fields) {
      if (field in body) data[field] = body[field] === "" ? null : body[field];
    }

    if ("maxUsers" in data) {
      const raw = data.maxUsers;
      data.maxUsers =
        raw === null || raw === undefined
          ? null
          : Number.isFinite(Number(raw)) && Number(raw) > 0
            ? Math.floor(Number(raw))
            : null;
    }

    for (const field of ["packageStartDate", "packageExpiryDate"] as const) {
      if (field in data) {
        const d = data[field] ? new Date(String(data[field])) : null;
        data[field] = d && !Number.isNaN(d.getTime()) ? d : null;
      }
    }

    const updated = await db.consultancy.update({ where: { id: consultancyId }, data });

    await logActivity({
      actorName: await getActorName(session.id),
      userId: session.id,
      action: "updated a consultancy",
      target: `${updated.code} — ${updated.name}`,
    });

    return NextResponse.json(updated);
  } catch (error) {
    logError("Update consultancy", error);
    return apiError("Failed to update consultancy");
  }
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { session, error } = await requireSuperAdmin();
    if (error) return error;
    if (!session) return apiError("Unauthorized", 401);

    const { id } = await ctx.params;
    const consultancyId = Number(id);
    if (!Number.isInteger(consultancyId) || consultancyId <= 0) {
      return apiError("Invalid consultancy id", 400);
    }

    const consultancy = await db.consultancy.findUnique({ where: { id: consultancyId } });
    if (!consultancy) return apiError("Consultancy not found", 404);

    // Refuse rather than orphan accounts; the platform owner should move or
    // remove users first. Count at platform scope so the active selection does
    // not narrow the query.
    const userCount = await runWithConsultancy({ consultancyId: null }, async () =>
      db.user.count({ where: { consultancyId } })
    );
    if (userCount > 0) {
      return apiError(
        `This consultancy still has ${userCount} user(s). Reassign or remove them first.`,
        409
      );
    }

    // Remove the defaults that were provisioned with the consultancy so they do
    // not linger as orphaned rows once it is gone. Scoped to the deleted
    // consultancy so nothing else is touched.
    await runWithConsultancy({ consultancyId }, async () => {
      await db.role.deleteMany({});
      await db.systemSettings.deleteMany({});
    });

    await db.consultancy.delete({ where: { id: consultancyId } });

    await logActivity({
      actorName: await getActorName(session.id),
      userId: session.id,
      action: "deleted a consultancy",
      target: `${consultancy.code} — ${consultancy.name}`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logError("Delete consultancy", error);
    return apiError("Failed to delete consultancy");
  }
}
