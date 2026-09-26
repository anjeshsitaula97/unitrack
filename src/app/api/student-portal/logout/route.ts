import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { getStudentSession } from "@/lib/api-utils";
import { logActivity, getActorName } from "@/lib/activity";
import { logError } from "@/lib/logger";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("student_token")?.value;

    if (token) {
      try {
        const session = await getStudentSession();
        if (session) {
          const student = await db.student.findUnique({
            where: { id: Number(session.id) },
            select: { name: true },
          });
          const actorName = student?.name || (await getActorName(session.id));
          await logActivity({
            actorName,
            userId: session.id,
            action: "logged out",
            target: session.email as string,
          });
        }
      } catch {
      }
    }

    cookieStore.delete("student_token");
    cookieStore.delete("auth_token");
    cookieStore.delete("enabled_modules");

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    logError("Logout Route Error:", error);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}