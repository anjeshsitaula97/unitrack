import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { checkPermission, getSession } from "@/lib/api-utils";

export async function GET() {
  const session = await getSession();
  const deniedGET = checkPermission(session, "chat:read");
  if (deniedGET) return deniedGET;
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const settings = await db.systemSettings.findFirst();
  const branchesEnabled = settings?.enableBranches ?? false;

  const users = await db.user.findMany({
    where: {
      id: { not: session.id },
      status: "Active",
    },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      role: true,
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ users, branchesEnabled });
}
