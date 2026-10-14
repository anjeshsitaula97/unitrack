import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession, apiError } from "@/lib/api-utils";
import { isSuperAdminRole } from "@/lib/permission-catalog";
import { logError } from "@/lib/logger";
import { logActivity, getActorName } from "@/lib/activity";

/** Roles allowed to view and edit their own consultancy profile. */
const EDITOR_ROLES = ["Super Admin", "Admin"];

/** Branding + contact fields every editor may change. */
const PROFILE_FIELDS = ["name", "email", "phone", "website", "address", "logoUrl"] as const;

/** Subscription fields only the platform owner (Super Admin) may change. */
const PACKAGE_FIELDS = [
  "packageName",
  "packageStartDate",
  "packageExpiryDate",
  "maxUsers",
] as const;

/**
 * The consultancy the current session is scoped to. A regular Admin is always
 * bound to their own consultancy (from the token); a Super Admin follows the
 * `active_consultancy` cookie, so this returns null while "All Consultancies"
 * is selected.
 */
async function currentConsultancyId(): Promise<number | null> {
  const session = await getSession();
  return session?.consultancyId ?? null;
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return apiError("Unauthorized", 401);

    const consultancyId = await currentConsultancyId();
    if (!consultancyId) {
      return NextResponse.json({
        consultancy: null,
        canEdit: false,
        isSuperAdmin: isSuperAdminRole(session.role),
      });
    }

    const consultancy = await db.consultancy.findUnique({ where: { id: consultancyId } });
    if (!consultancy) {
      return NextResponse.json({
        consultancy: null,
        canEdit: false,
        isSuperAdmin: isSuperAdminRole(session.role),
      });
    }

    return NextResponse.json({
      consultancy,
      canEdit: EDITOR_ROLES.includes(session.role),
      isSuperAdmin: isSuperAdminRole(session.role),
    });
  } catch (error) {
    logError("Fetch current consultancy", error);
    return apiError("Failed to fetch consultancy");
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return apiError("Unauthorized", 401);
    if (!EDITOR_ROLES.includes(session.role)) {
      return apiError("Forbidden: only an Admin can edit the consultancy profile", 403);
    }

    const consultancyId = await currentConsultancyId();
    if (!consultancyId) {
      return apiError("Select a consultancy before editing its profile", 400);
    }

    const existing = await db.consultancy.findUnique({ where: { id: consultancyId } });
    if (!existing) return apiError("Consultancy not found", 404);

    const body = await req.json();
    const isSuperAdmin = isSuperAdminRole(session.role);

    const data: Record<string, unknown> = {};
    for (const field of PROFILE_FIELDS) {
      if (field in body) data[field] = body[field] === "" ? null : body[field];
    }

    // Package/subscription details are the platform owner's to assign.
    if (isSuperAdmin) {
      for (const field of PACKAGE_FIELDS) {
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
        if (field in data && data[field]) {
          const d = new Date(String(data[field]));
          data[field] = Number.isNaN(d.getTime()) ? null : d;
        } else if (field in data) {
          data[field] = null;
        }
      }
    }

    if (Object.keys(data).length === 0) {
      return apiError("Nothing to update", 400);
    }

    if ("name" in data) {
      const name = typeof data.name === "string" ? data.name.trim() : "";
      if (!name) return apiError("Consultancy name cannot be empty", 400);
      data.name = name;
    }

    const updated = await db.consultancy.update({ where: { id: consultancyId }, data });

    await logActivity({
      actorName: await getActorName(session.id),
      userId: session.id,
      action: "updated their consultancy profile",
      target: `${updated.code} — ${updated.name}`,
    });

    return NextResponse.json(updated);
  } catch (error) {
    logError("Update current consultancy", error);
    return apiError("Failed to update consultancy");
  }
}
