import { NextRequest, NextResponse } from "next/server";
import { logError } from "@/lib/logger";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { getSession, apiError } from "@/lib/api-utils";
import { logActivity, getActorName } from "@/lib/activity";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || !["Admin", "Super Admin"].includes(session.role as string))
      return apiError("Unauthorized", 401);

    const { id } = await params;
    const numId = Number(id);

    const student = await db.student.findUnique({ where: { id: numId } });
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
    let password = "";
    for (let i = 0; i < 10; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await db.student.update({
      where: { id: numId },
      data: { studentPassword: hashedPassword },
    });

    const existingUser = await db.user.findUnique({ where: { email: student.email } });

    if (existingUser) {
      await db.user.update({
        where: { id: existingUser.id },
        data: { password: hashedPassword },
      });
    } else {
      await db.user.create({
        data: {
          name: student.name,
          email: student.email,
          password: hashedPassword,
          role: "Student",
          status: "Active",
          lastLogin: "Never",
        },
      });
    }

    await logActivity({
      actorName: await getActorName(session?.id),
      userId: session?.id,
      action: "created credentials",
      target: student.name,
    });

    return NextResponse.json({
      success: true,
      password,
      email: student.email,
      name: student.name,
    });
  } catch (error) {
    logError("Generate student credentials", error);
    return NextResponse.json({ error: "Failed to generate credentials" }, { status: 500 });
  }
}
