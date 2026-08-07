import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { z } from "zod";
import { createNotification } from "@/lib/notifications";
import { getSession, apiError } from "@/lib/api-utils";
import { logActivity, getActorName } from "@/lib/activity";

const createUserSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .optional()
    .or(z.literal("")),
  role: z.string().optional(),
  autoGeneratePassword: z.boolean().optional(),
  generateApiKey: z.boolean().optional(),
  avatar: z.string().optional(),
});

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !["Admin", "Super Admin"].includes(session.role as string))
      return apiError("Unauthorized", 401);

    const users = await db.user.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        loginLogs: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !["Admin", "Super Admin"].includes(session.role as string))
      return apiError("Unauthorized", 401);

    const parsed = createUserSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }
    const data = parsed.data;
    let generatedPassword = "";
    let passwordToHash = data.password || "";

    if (data.autoGeneratePassword) {
      generatedPassword = crypto.randomBytes(8).toString("hex");
      passwordToHash = generatedPassword;
    }

    if (!passwordToHash) {
      return NextResponse.json({ error: "Password is required" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(passwordToHash, 12);

    const newUser = await (db.user as any).create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role:
          ["Super Admin", "Admin", "B2B Partner", "Student", "Viewer", "Editor"].find(
            (r) => r.toLowerCase() === (data.role || "viewer").toLowerCase()
          ) || "Viewer",
        status: "Pending",
        lastLogin: "Never",
        avatar: data.avatar || data.name.substring(0, 2).toUpperCase(),
      },
    });

    let apiKeyRaw = null;
    if (data.generateApiKey) {
      const raw = "uk_" + crypto.randomBytes(16).toString("hex");
      const hash = crypto.createHash("sha256").update(raw).digest("hex");
      await db.apiKey.create({
        data: {
          name: `${data.name}'s Auto-key`,
          tokenHash: hash,
        },
      });
      apiKeyRaw = raw;
    }

    await createNotification({
      title: "User Invited",
      message: `User "${data.name}" has been invited with role ${data.role || "Viewer"}.`,
      type: "Success",
    });

    await logActivity({
      actorName: await getActorName(session?.id),
      userId: session?.id,
      action: "invited a user",
      target: newUser.name,
    });

    return NextResponse.json(
      {
        user: newUser,
        generatedPassword: generatedPassword || null,
        apiKey: apiKeyRaw ? { token: apiKeyRaw, name: `${data.name}'s Auto-key` } : null,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create user/invite" }, { status: 400 });
  }
}
