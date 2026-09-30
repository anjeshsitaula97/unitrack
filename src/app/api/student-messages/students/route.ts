import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { checkRoutePermission, getSession } from "@/lib/api-utils";

export async function GET() {
  const session = await getSession();
  const deniedGET = checkRoutePermission(session, {
    url: "/api/student-messages/students",
    method: "GET",
  });
  if (deniedGET) return deniedGET;
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const students = await db.student.findMany({
    select: { id: true, name: true, email: true, photoUrl: true, status: true },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(students);
}
