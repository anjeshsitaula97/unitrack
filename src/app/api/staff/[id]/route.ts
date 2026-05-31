import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { verifyAuth } from '@/lib/session';

async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (!token) {
    console.log("No auth token found in cookies");
    return null;
  }
  try {
    const payload = await verifyAuth(token);
    console.log("Session payload verified:", payload);
    return payload;
  } catch (err: any) {
    console.error("Session verification failed:", err.message);
    return null;
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'Admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    let updateData: any = {};
    try {
      const body = await req.json();
      const { name, email, password, role, status } = body;

      const existingUser = await db.user.findUnique({
        where: { id },
      });

      if (!existingUser) {
        return NextResponse.json({ error: "Staff member not found" }, { status: 404 });
      }

      if (name) updateData.name = name;
      if (email) updateData.email = email;
      if (role) updateData.role = role;
      if (status) updateData.status = status;
      if (password) {
        updateData.password = await bcrypt.hash(password, 10);
      }

      console.log("Updating user:", id, "with data:", { ...updateData, password: updateData.password ? "[REDACTED]" : undefined });

      const user = await db.user.update({
        where: { id },
        data: updateData,
      });

      const { password: _, ...userWithoutPassword } = user;
      return NextResponse.json(userWithoutPassword);
    } catch (error: any) {
      console.error("Update Staff Error Detail:", {
        message: error.message,
        code: error.code,
        meta: error.meta,
        id,
        updateData
      });
      return NextResponse.json({ 
        error: "Failed to update staff",
        details: error.message 
      }, { status: 500 });
    }
  } catch (error) {
    console.error("Critical PUT error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'Admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    console.log("Attempting to delete user with ID:", id);

    // Prevent self-deletion
    if (id === session.id) {
      return NextResponse.json({ error: 'You cannot delete your own account' }, { status: 400 });
    }

    const result = await db.user.deleteMany({
      where: { id },
    });

    if (result.count === 0) {
      console.warn(`User deletion failed: Record with ID ${id} not found.`);
      return NextResponse.json({ error: 'Staff member not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete Staff Error:", error);
    return NextResponse.json({ error: "Failed to delete staff" }, { status: 500 });
  }
}
