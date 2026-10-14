import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession, apiError } from "@/lib/api-utils";
import { isSuperAdminRole } from "@/lib/permission-catalog";
import { logError } from "@/lib/logger";
import { logActivity, getActorName } from "@/lib/activity";
import { nextConsultancyCode, seedConsultancyDefaults } from "@/lib/consultancy-service";
import { runWithConsultancy } from "@/lib/consultancy";

/** Super Admin only: the platform owner manages consultancies. */
async function requireSuperAdmin() {
  const session = await getSession();
  if (!session) return { session: null, error: apiError("Unauthorized", 401) };
  if (!isSuperAdminRole(session.role)) {
    return { session: null, error: apiError("Forbidden: Super Admin only", 403) };
  }
  return { session, error: null };
}

export async function GET() {
  try {
    const { error } = await requireSuperAdmin();
    if (error) return error;

    // Consultancy is not scoped, but read the user counts at platform scope so
    // the totals are not narrowed by whatever consultancy is currently selected.
    const [consultancies, counts] = await Promise.all([
      db.consultancy.findMany({ orderBy: { code: "asc" } }),
      runWithConsultancy({ consultancyId: null }, async () =>
        db.user.groupBy({ by: ["consultancyId"], _count: { _all: true } })
      ),
    ]);

    const countMap = new Map(counts.map((row) => [row.consultancyId ?? 0, row._count._all]));

    return NextResponse.json(
      consultancies.map((c) => ({ ...c, userCount: countMap.get(c.id) ?? 0 }))
    );
  } catch (error) {
    logError("List consultancies", error);
    return apiError("Failed to fetch consultancies");
  }
}

export async function POST(req: NextRequest) {
  try {
    const { session, error } = await requireSuperAdmin();
    if (error) return error;
    if (!session) return apiError("Unauthorized", 401);

    const body = await req.json();
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    if (!name) return apiError("Name is required", 400);

    const code = await nextConsultancyCode();

    const rawMaxUsers = body?.maxUsers;
    const maxUsers =
      rawMaxUsers === "" || rawMaxUsers === undefined || rawMaxUsers === null
        ? null
        : Number.isFinite(Number(rawMaxUsers)) && Number(rawMaxUsers) > 0
          ? Math.floor(Number(rawMaxUsers))
          : null;

    const consultancy = await db.consultancy.create({
      data: {
        code,
        name,
        status: typeof body?.status === "string" ? body.status : "Active",
        email: body?.email || null,
        phone: body?.phone || null,
        website: body?.website || null,
        address: body?.address || null,
        logoUrl: body?.logoUrl || null,
        packageName: body?.packageName || null,
        packageStartDate: body?.packageStartDate || null,
        packageExpiryDate: body?.packageExpiryDate || null,
        maxUsers,
      },
    });

    await seedConsultancyDefaults(consultancy.id);

    await logActivity({
      actorName: await getActorName(session.id),
      userId: session.id,
      action: "created a consultancy",
      target: `${consultancy.code} — ${consultancy.name}`,
    });

    return NextResponse.json(consultancy, { status: 201 });
  } catch (error) {
    logError("Create consultancy", error);
    return apiError("Failed to create consultancy");
  }
}
