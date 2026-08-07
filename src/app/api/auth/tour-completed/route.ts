import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAuth } from "@/lib/session";
import { db } from "@/lib/db";

export async function PATCH() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyAuth(token);

    await db.user.update({
      where: { id: payload.id },
      data: { isFirstLogin: false },
    });

    return NextResponse.json({ success: true });
  } catch (_error) {
    return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  }
}
