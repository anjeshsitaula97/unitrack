import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession, apiError } from "@/lib/api-utils";

export async function GET() {
  try {
    const filters = await db.quickFilter.findMany({
      orderBy: { label: "asc" },
    });
    return NextResponse.json(filters);
  } catch (_error) {
    return NextResponse.json({ error: "Failed to fetch filters" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !["Admin", "Super Admin"].includes(session.role as string))
      return apiError("Unauthorized", 401);

    const { label, icon } = await req.json();
    if (!label) return NextResponse.json({ error: "Label is required" }, { status: 400 });

    const filter = await db.quickFilter.create({
      data: { label, icon: icon || "Filter" },
    });
    return NextResponse.json(filter, { status: 201 });
  } catch (error) {
    if ((error as { code?: string }).code === "P2002") {
      return NextResponse.json({ error: "Filter already exists" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create filter" }, { status: 500 });
  }
}
