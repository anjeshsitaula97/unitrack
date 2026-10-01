import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { z } from "zod";
import { createNotification } from "@/lib/notifications";
import { getSession, apiError, checkPermission } from "@/lib/api-utils";
import { logActivity, getActorName } from "@/lib/activity";
import { logError } from "@/lib/logger";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { validateCsrfHeaders } from "@/lib/csrf";
import { normalizeRecipients } from "@/lib/email-recipients";

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
  // Opt-in: when omitted the invite is created without emailing anything.
  sendCredentialsEmail: z.boolean().optional(),
  avatar: z.string().optional(),
});

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export async function GET() {
  try {
    const session = await getSession();
    const deniedGET = checkPermission(session, "admin:access");
    if (deniedGET) return deniedGET;
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
  } catch (_error) {
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // CSRF protection for state-changing operations
    const csrf = validateCsrfHeaders(req);
    if (!csrf.valid) {
      return NextResponse.json({ error: csrf.error }, { status: 403 });
    }

    const session = await getSession();
    const deniedPOST = checkPermission(session, "admin:access");
    if (deniedPOST) return deniedPOST;
    if (!session || !["Admin", "Super Admin"].includes(session.role as string))
      return apiError("Unauthorized", 401);

    // Rate limit user creation
    const rl = await checkRateLimit(`create-user:${getClientIp(req)}`, 10, 60000);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

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

    // The invite form's role list comes from the Role table, so validate against
    // it. Previously a hardcoded list was used and any other role silently fell
    // back to "Viewer", handing out the wrong access level without any error.
    const knownRoles = await db.role.findMany({ select: { name: true } });
    const validRoles = Array.from(
      new Set([
        ...knownRoles.map((r) => r.name),
        "Super Admin",
        "Admin",
        "B2B Partner",
        "Student",
        "Viewer",
        "Editor",
      ])
    );
    const requestedRole = (data.role || "Viewer").trim();
    const resolvedRole = validRoles.find((r) => r.toLowerCase() === requestedRole.toLowerCase());
    if (!resolvedRole) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }
    if (resolvedRole === "Super Admin" && session.role !== "Super Admin") {
      return NextResponse.json(
        { error: "Only a Super Admin can invite another Super Admin" },
        { status: 403 }
      );
    }

    const newUser = await db.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: resolvedRole,
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

    // Emailing the login details is best-effort. The user row already exists at
    // this point, so a mail outage must not fail the invite; instead the outcome
    // is reported back so the admin can share the password manually.
    const credentialsEmail = {
      attempted: false,
      sent: false,
      error: undefined as string | undefined,
    };

    if (data.sendCredentialsEmail === true) {
      credentialsEmail.attempted = true;
      try {
        const settings = await db.emailSetting.findFirst({
          where: { isActive: true },
          orderBy: { createdAt: "desc" },
        });

        if (!settings) {
          credentialsEmail.error = "No active email settings are configured.";
        } else {
          const transporter = nodemailer.createTransport({
            host: settings.smtpHost,
            port: settings.smtpPort,
            secure: settings.smtpEncryption === "SSL",
            auth: { user: settings.smtpUser, pass: settings.smtpPass },
          });

          const role = newUser.role || "Viewer";
          const safeName = escapeHtml(data.name);
          const safeEmail = escapeHtml(data.email);
          const safePassword = escapeHtml(passwordToHash);

          await transporter.sendMail({
            from: `"${settings.fromName}" <${settings.fromEmail}>`,
            to: normalizeRecipients(data.email),
            subject: "Your UniTrack login details",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #191c1e;">Welcome to UniTrack</h2>
                <p>Hello ${safeName},</p>
                <p>An account has been created for you. Use the details below to sign in.</p>
                <table style="width: 100%; border-collapse: collapse; margin: 24px 0; font-size: 14px;">
                  <tr>
                    <td style="padding: 10px; border: 1px solid #e5e7eb; background: #f9fafb; width: 120px;">Email</td>
                    <td style="padding: 10px; border: 1px solid #e5e7eb;">${safeEmail}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px; border: 1px solid #e5e7eb; background: #f9fafb;">Password</td>
                    <td style="padding: 10px; border: 1px solid #e5e7eb; font-family: monospace;">${safePassword}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px; border: 1px solid #e5e7eb; background: #f9fafb;">Role</td>
                    <td style="padding: 10px; border: 1px solid #e5e7eb;">${escapeHtml(role)}</td>
                  </tr>
                </table>
                <p style="color: #666; font-size: 13px;">Please change this password after your first sign in.</p>
                <p style="color: #666; font-size: 13px;">If you were not expecting this email you can safely ignore it.</p>
              </div>
            `,
          });
          credentialsEmail.sent = true;
        }
      } catch (emailError) {
        // Context avoids the word "credentials" so the logger does not redact it.
        logError("Send invite mail", emailError);
        credentialsEmail.error = "Could not send the email. Check your SMTP settings.";
      }
    }

    await createNotification({
      title: "User Added",
      message: `User "${data.name}" has been added with role ${data.role || "Viewer"}.`,
      type: "Success",
    });

    await logActivity({
      actorName: await getActorName(session?.id),
      userId: session?.id,
      action: "added a user",
      target: newUser.name,
    });

    return NextResponse.json(
      {
        user: newUser,
        // Only show generated password and API key once upon creation
        generatedPassword: generatedPassword || null,
        apiKey: apiKeyRaw ? { token: apiKeyRaw, name: `${data.name}'s Auto-key` } : null,
        credentialsEmail,
        // Security note: These values are only returned once. Store them securely.
      },
      { status: 201 }
    );
  } catch (error) {
    logError("Create User", error);
    return NextResponse.json({ error: "Failed to create user/invite" }, { status: 400 });
  }
}
