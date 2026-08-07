import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession, apiError } from "@/lib/api-utils";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || !["Admin", "Super Admin"].includes(session.role as string))
      return apiError("Unauthorized", 401);

    const { id } = await params;

    const userDetails = await db.user.findUnique({
      where: { id: Number(id) },
      include: {
        loginLogs: {
          orderBy: { createdAt: "desc" },
          take: 50,
        },
        activities: {
          orderBy: { createdAt: "desc" },
          take: 100,
        },
        _count: {
          select: {
            activities: true,
            loginLogs: true,
            tasks: true,
            tickets: true,
          },
        },
      },
    });

    if (!userDetails) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(userDetails);
  } catch (error: unknown) {
    console.error("Failed to fetch user details:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
