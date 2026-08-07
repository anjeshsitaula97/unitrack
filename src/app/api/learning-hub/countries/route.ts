import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { verifyAuth } from "@/lib/session";
import { logActivity, getActorName } from "@/lib/activity";

async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) return null;
  try {
    return await verifyAuth(token);
  } catch (_err) {
    return null;
  }
}

export async function GET() {
  try {
    const countries = await db.country.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json(countries);
  } catch (_error) {
    return NextResponse.json({ error: "Failed to fetch countries" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await req.json();
    const { name, code } = data;

    if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

    const newCountry = await db.country.create({
      data: { name, code: code?.toLowerCase() },
    });

    await logActivity({
      actorName: await getActorName(session?.id),
      userId: session?.id,
      action: "created a country",
      target: newCountry.name,
    });

    return NextResponse.json(newCountry, { status: 201 });
  } catch (_error) {
    return NextResponse.json({ error: "Failed to add country" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

    const country = await db.country.findUnique({ where: { id: Number(id) } });

    await db.country.delete({ where: { id: Number(id) } });

    await logActivity({
      actorName: await getActorName(session?.id),
      userId: session?.id,
      action: "deleted a country",
      target: country?.name || id,
    });

    return NextResponse.json({ success: true });
  } catch (_error) {
    return NextResponse.json({ error: "Failed to delete country" }, { status: 500 });
  }
}
