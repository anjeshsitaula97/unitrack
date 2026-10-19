import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession, apiError, checkPermission } from "@/lib/api-utils";
import { logError } from "@/lib/logger";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    const deniedGET = checkPermission(session, "admin:access");
    if (deniedGET) return deniedGET;
    if (!session || !["Admin", "Super Admin"].includes(session.role as string))
      return apiError("Unauthorized", 401);

    const { id } = await params;

    const userDetails = await db.user.findUnique({
      where: { id: Number(id) },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        employeeId: true,
        phone: true,
        gender: true,
        designationId: true,
        departmentId: true,
        hireDate: true,
        employmentType: true,
        basicSalary: true,
        bankName: true,
        bankAccount: true,
        panNumber: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
        consultancyId: true,
        lastLogin: true,
        branchId: true,
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
    logError("Fetch User Details", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
