import { NextResponse } from "next/server";
import { z } from "zod";
import { logError } from "@/lib/logger";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { logActivity } from "@/lib/activity";
import { getSession, checkPermission } from "@/lib/api-utils";
import { parseJson, zodResponse, emailField } from "@/lib/validate";

const createStaffSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  email: emailField,
  password: z.string().min(8, "Password must be at least 8 characters").max(200),
  role: z.string().trim().max(60).optional().default("Viewer"),
});

export async function GET() {
  try {
    const session = await getSession();
    const deniedGET = checkPermission(session, "admin:access");
    if (deniedGET) return deniedGET;
    if (!session || !["Admin", "Super Admin"].includes(session.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const users = await db.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    logError("Fetch Staff Error:", error);
    return NextResponse.json({ error: "Failed to fetch staff" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    const deniedPOST = checkPermission(session, "admin:access");
    if (deniedPOST) return deniedPOST;
    if (!session || !["Admin", "Super Admin"].includes(session.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const parsed = await parseJson(req, createStaffSchema);
    if (!parsed.ok) return zodResponse(parsed.error);

    const { name, email, password, role } = parsed.data;

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || "Viewer",
      },
    });

    await logActivity({
      actorName: session.name || "System",
      userId: session.id,
      action: "invited new staff",
      target: user.name,
      targetBy: role || "Viewer",
    });

    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    logError("Create Staff Error:", error);
    if ((error as { code?: string }).code === "P2002") {
      return NextResponse.json({ error: "A user with this email already exists" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create staff" }, { status: 500 });
  }
}
