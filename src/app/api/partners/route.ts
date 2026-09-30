import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logError } from "@/lib/logger";
import { logActivity } from "@/lib/activity";
import { checkPermission, checkRoutePermission, getSession } from "@/lib/api-utils";

export async function GET() {
  try {
    const session = await getSession();
    const deniedGET = checkPermission(session, "universities:read");
    if (deniedGET) return deniedGET;
    const partners = await db.partner.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { students: true } } },
    });
    return NextResponse.json(partners);
  } catch (_error) {
    return NextResponse.json({ error: "Failed to fetch partners" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const deniedPOST = checkRoutePermission(session, { url: "/api/partners", method: "POST" });
    if (deniedPOST) return deniedPOST;
    const data = await req.json();

    const newPartner = await db.partner.create({
      data: {
        name: data.name,
        contactPerson: data.contactPerson || null,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address || null,
        description: data.description || null,
        countries: JSON.stringify(data.countries || []),
      },
    });

    if (session) {
      const user = await db.user.findUnique({ where: { id: session.id } });
      await logActivity({
        actorName: user?.name || "System",
        action: "created a new partner",
        target: newPartner.name,
      });
    }

    return NextResponse.json(newPartner, { status: 201 });
  } catch (error) {
    logError("Create partner", error);
    return NextResponse.json({ error: "Failed to create partner" }, { status: 400 });
  }
}
