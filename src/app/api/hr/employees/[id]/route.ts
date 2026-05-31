import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';
import { verifyAuth } from '@/lib/session';

async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (!token) return null;
  try { return await verifyAuth(token); } catch { return null; }
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const employee = await db.user.findUnique({
      where: { id },
      select: {
        id: true, name: true, email: true, role: true, status: true,
        employeeId: true, phone: true, alternatePhone: true, dateOfBirth: true,
        gender: true, address: true, city: true, state: true, zipCode: true,
        country: true, emergencyContact: true, emergencyPhone: true,
        bankName: true, bankAccount: true, bankIfsc: true, panNumber: true,
        basicSalary: true, hireDate: true, employmentType: true,
        avatar: true, faceDescriptor: true, createdAt: true, updatedAt: true,
        branchId: true,
        department: { select: { id: true, name: true } },
        designation: { select: { id: true, title: true } },
        branch: { select: { id: true, name: true } },
      },
    });

    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }
    return NextResponse.json(employee);
  } catch (error) {
    console.error("Fetch Employee Error:", error);
    return NextResponse.json({ error: "Failed to fetch employee" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'Admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const employee = await db.user.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.email !== undefined && { email: body.email }),
        ...(body.employeeId !== undefined && { employeeId: body.employeeId }),
        ...(body.phone !== undefined && { phone: body.phone }),
        ...(body.alternatePhone !== undefined && { alternatePhone: body.alternatePhone }),
        ...(body.dateOfBirth !== undefined && { dateOfBirth: body.dateOfBirth }),
        ...(body.gender !== undefined && { gender: body.gender }),
        ...(body.address !== undefined && { address: body.address }),
        ...(body.city !== undefined && { city: body.city }),
        ...(body.state !== undefined && { state: body.state }),
        ...(body.zipCode !== undefined && { zipCode: body.zipCode }),
        ...(body.country !== undefined && { country: body.country }),
        ...(body.emergencyContact !== undefined && { emergencyContact: body.emergencyContact }),
        ...(body.emergencyPhone !== undefined && { emergencyPhone: body.emergencyPhone }),
        ...(body.bankName !== undefined && { bankName: body.bankName }),
        ...(body.bankAccount !== undefined && { bankAccount: body.bankAccount }),
        ...(body.bankIfsc !== undefined && { bankIfsc: body.bankIfsc }),
        ...(body.panNumber !== undefined && { panNumber: body.panNumber }),
        ...(body.basicSalary !== undefined && { basicSalary: body.basicSalary ? parseFloat(body.basicSalary) : null }),
        ...(body.hireDate !== undefined && { hireDate: body.hireDate }),
        ...(body.employmentType !== undefined && { employmentType: body.employmentType }),
        ...(body.departmentId !== undefined && { departmentId: body.departmentId || null }),
        ...(body.designationId !== undefined && { designationId: body.designationId || null }),
        ...(body.branchId !== undefined && { branchId: body.branchId || null }),
        ...(body.status !== undefined && { status: body.status }),
        ...(body.role !== undefined && { role: body.role }),
        ...(body.faceDescriptor !== undefined && { faceDescriptor: body.faceDescriptor }),
      },
    });

    return NextResponse.json(employee);
  } catch (error) {
    console.error("Update Employee Error:", error);
    return NextResponse.json({ error: "Failed to update employee" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'Admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    if (id === session.id) {
      return NextResponse.json({ error: 'You cannot delete your own account' }, { status: 400 });
    }

    await db.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete Employee Error:", error);
    return NextResponse.json({ error: "Failed to delete employee" }, { status: 500 });
  }
}
