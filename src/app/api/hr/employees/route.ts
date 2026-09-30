import { NextResponse } from "next/server";
import { logError } from "@/lib/logger";
import { db } from "@/lib/db";
import { logActivity, getActorName } from "@/lib/activity";
import { checkPermission, getSession } from "@/lib/api-utils";

export async function GET() {
  try {
    const session = await getSession();
    const deniedGET = checkPermission(session, "hr:read");
    if (deniedGET) return deniedGET;
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const employees = await db.user.findMany({
      where: { role: { notIn: ["Admin", "Student"] } },
      orderBy: { name: "asc" },
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
        branchId: true,
        faceDescriptor: true,
        department: { select: { id: true, name: true } },
        designation: { select: { id: true, title: true } },
        branch: { select: { id: true, name: true } },
      },
    });
    return NextResponse.json(employees);
  } catch (error) {
    logError("Fetch Employees Error:", error);
    return NextResponse.json({ error: "Failed to fetch employees" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    const deniedPOST = checkPermission(session, "hr:create");
    if (deniedPOST) return deniedPOST;
    if (!session || !["Admin", "Super Admin"].includes(session.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const employee = await db.user.update({
      where: { id: body.userId },
      data: {
        employeeId: body.employeeId,
        phone: body.phone,
        alternatePhone: body.alternatePhone,
        dateOfBirth: body.dateOfBirth,
        gender: body.gender,
        address: body.address,
        city: body.city,
        state: body.state,
        zipCode: body.zipCode,
        country: body.country,
        emergencyContact: body.emergencyContact,
        emergencyPhone: body.emergencyPhone,
        bankName: body.bankName,
        bankAccount: body.bankAccount,
        bankIfsc: body.bankIfsc,
        panNumber: body.panNumber,
        basicSalary: body.basicSalary ? parseFloat(body.basicSalary) : null,
        hireDate: body.hireDate,
        employmentType: body.employmentType || "Full-Time",
        departmentId: body.departmentId || null,
        designationId: body.designationId || null,
        branchId: body.branchId || null,
      },
    });

    await logActivity({
      actorName: await getActorName(session?.id),
      userId: session?.id,
      action: "created an employee",
      target: employee.name,
    });
    return NextResponse.json(employee);
  } catch (error) {
    logError("Create Employee Error:", error);
    return NextResponse.json({ error: "Failed to create employee profile" }, { status: 500 });
  }
}
