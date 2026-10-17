import nodemailer from "nodemailer";
import { db } from "./db";
import { logError } from "./logger";
import { createNotification } from "./notifications";
import { normalizeRecipients } from "./email-recipients";
import { logActivity, type ChangeDetail } from "./activity";

/**
 * A built-in template the app can send without any configuration. Rows in the
 * `EmailTemplate` table override the `subject`/`body`; a missing row (or one an
 * admin disabled) falls back to the definition here, so an automated email can
 * never disappear because someone cleared the settings.
 */
export interface EmailTemplateDefinition {
  key: string;
  name: string;
  description: string;
  /** Human-readable explanation of when the system sends this automatically. */
  trigger: string;
  /** Whether a code path sends this template without human action. */
  autoSend: boolean;
  placeholders: string[];
  subject: string;
  body: string;
}

const SHELL_HEADER = (appName = "{{appName}}") => `
    <div style="background:#4f46e5;padding:20px 28px;">
      <h1 style="margin:0;color:#ffffff;font-size:18px;font-family:Arial,Helvetica,sans-serif;">${appName}</h1>
    </div>`;

const SHELL_FOOTER = `
    <div style="padding:16px 28px;background:#f8fafc;border-top:1px solid #e2e8f0;">
      <p style="margin:0;color:#94a3b8;font-size:12px;font-family:Arial,Helvetica,sans-serif;">
        Sent by {{appName}} on {{date}}.
      </p>
    </div>`;

function shell(inner: string): string {
  return `<div style="font-family:Arial,Helvetica,sans-serif;background:#f1f5f9;padding:24px;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
${SHELL_HEADER()}
    <div style="padding:28px;">
${inner}
    </div>
${SHELL_FOOTER}
  </div>
</div>`;
}

export const EMAIL_TEMPLATE_CATALOG: EmailTemplateDefinition[] = [
  {
    key: "student-updated",
    name: "Student Record Updated",
    description: "Sent to the student whenever their record is changed by staff.",
    trigger: "Automatically when a student's details are saved",
    autoSend: true,
    placeholders: ["studentName", "studentEmail", "changes", "actorName", "appName", "date"],
    subject: "Your student record has been updated",
    body: shell(`      <p style="margin:0 0 16px;color:#0f172a;font-size:15px;">Dear {{studentName}},</p>
      <p style="margin:0 0 16px;color:#334155;font-size:14px;line-height:1.6;">
        Your student record has been updated. Here is a summary of the changes:
      </p>
      {{changes}}
      <p style="margin:16px 0 0;color:#334155;font-size:14px;line-height:1.6;">
        If any of these details are incorrect, please contact your counselor.
      </p>`),
  },
  {
    key: "student-created",
    name: "Student Welcome",
    description: "Sent to the student when their record is first created.",
    trigger: "Automatically when a student is created",
    autoSend: true,
    placeholders: ["studentName", "studentEmail", "actorName", "appName", "date"],
    subject: "Welcome to {{appName}}",
    body: shell(`      <p style="margin:0 0 16px;color:#0f172a;font-size:15px;">Dear {{studentName}},</p>
      <p style="margin:0 0 16px;color:#334155;font-size:14px;line-height:1.6;">
        A student profile has been created for you at {{appName}}. Your counselor will reach out
        with the next steps in your application journey.
      </p>
      <p style="margin:0;color:#334155;font-size:14px;line-height:1.6;">
        If you did not expect this message, please contact your counselor.
      </p>`),
  },
];

export function getTemplateDefinition(key: string): EmailTemplateDefinition | undefined {
  return EMAIL_TEMPLATE_CATALOG.find((t) => t.key === key);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Replaces `{{name}}` tokens with the matching value. Every value is HTML
 * escaped unless its key is listed in `rawKeys` (used for pre-rendered HTML
 * such as the change table, which must not be escaped). Unfilled tokens are
 * removed so a raw `{{...}}` never leaks into an email.
 */
export function renderTemplate(
  template: string,
  vars: Record<string, string | undefined>,
  rawKeys: string[] = []
): string {
  const raw = new Set(rawKeys);
  return template
    .replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_match, name: string) => {
      const value = vars[name];
      if (value === undefined) return "";
      return raw.has(name) ? value : escapeHtml(value);
    })
    .replace(/\{\{\s*[\w.]+\s*\}\}/g, "");
}

/** camelCase / snake_case field name to a readable label. */
function humanizeField(field: string): string {
  return field
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// Internal/presentational columns that would only add noise to a customer
// facing summary of what changed.
const HIDDEN_CHANGE_FIELDS = new Set([
  "photoUrl",
  "color",
  "initials",
  "statusColor",
  "lastActivity",
  "faceDescriptor",
  "faceEnrolledAt",
]);

const MAX_CHANGE_VALUE_LENGTH = 120;

function formatChangeValue(value: string): string {
  if (!value) return "\u2014";
  if (value.length > MAX_CHANGE_VALUE_LENGTH) return "Updated";
  return value;
}

/** Keeps only the meaningful, customer-facing subset of a change list. */
export function filterEmailChanges(changes: ChangeDetail[]): ChangeDetail[] {
  return changes.filter(
    (c) => !HIDDEN_CHANGE_FIELDS.has(c.field) && (c.from || c.to) && c.from !== c.to
  );
}

/**
 * Renders a change list as an inline-styled table (safe across email clients).
 * Returns an empty string when there is nothing meaningful to show.
 */
export function renderChangeList(changes: ChangeDetail[]): string {
  const meaningful = filterEmailChanges(changes);
  if (meaningful.length === 0) return "";

  const rows = meaningful
    .map((c) => {
      const field = escapeHtml(humanizeField(c.field));
      const from = escapeHtml(formatChangeValue(c.from));
      const to = escapeHtml(formatChangeValue(c.to));
      return `<tr>
        <td style="padding:8px 10px;border-bottom:1px solid #eef2f7;color:#0f172a;font-size:13px;font-family:Arial,Helvetica,sans-serif;">${field}</td>
        <td style="padding:8px 10px;border-bottom:1px solid #eef2f7;color:#94a3b8;font-size:13px;font-family:Arial,Helvetica,sans-serif;">${from}</td>
        <td style="padding:8px 10px;border-bottom:1px solid #eef2f7;color:#0f172a;font-size:13px;font-family:Arial,Helvetica,sans-serif;">${to}</td>
      </tr>`;
    })
    .join("");

  return `<table style="width:100%;border-collapse:collapse;margin:8px 0;border:1px solid #eef2f7;border-radius:8px;overflow:hidden;">
      <tr style="background:#f8fafc;">
        <th align="left" style="padding:8px 10px;color:#64748b;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;font-family:Arial,Helvetica,sans-serif;">Field</th>
        <th align="left" style="padding:8px 10px;color:#64748b;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;font-family:Arial,Helvetica,sans-serif;">Previous</th>
        <th align="left" style="padding:8px 10px;color:#64748b;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;font-family:Arial,Helvetica,sans-serif;">New</th>
      </tr>
      ${rows}
    </table>`;
}

/** Crude HTML to text for the plain-text alternative part of an email. */
function htmlToText(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

async function findTemplateRow(key: string) {
  try {
    return await db.emailTemplate.findFirst({ where: { key } });
  } catch (error) {
    logError("Load email template", error);
    return null;
  }
}

/**
 * Creates a row for every catalog template that has none yet. Safe to call on
 * every request: existing rows (including ones an admin edited) are left
 * untouched, and the compound unique index makes a concurrent double-insert a
 * no-op.
 */
export async function ensureEmailTemplates(): Promise<void> {
  for (const def of EMAIL_TEMPLATE_CATALOG) {
    try {
      const existing = await db.emailTemplate.findFirst({ where: { key: def.key } });
      if (existing) continue;
      await db.emailTemplate.create({
        data: {
          key: def.key,
          name: def.name,
          subject: def.subject,
          body: def.body,
          isEnabled: true,
          isDefault: true,
        },
      });
    } catch (error) {
      logError("Seed email template", error);
    }
  }
}

export interface SendTemplatedEmailParams {
  key: string;
  to: string | string[];
  vars?: Record<string, string | undefined>;
  /** Variable names whose values are pre-rendered HTML and must not be escaped. */
  rawKeys?: string[];
  actorName?: string;
  /** Skip sending entirely when the rendered change list would be empty. */
  requireNonEmptyKey?: string;
}

export interface SendTemplatedEmailResult {
  sent: boolean;
  reason?: "unknown-template" | "disabled" | "no-recipients" | "no-smtp" | "empty" | "error";
}

/**
 * Renders and sends a catalog template. Never throws: an automated email must
 * not fail the staff action that triggered it, so every failure is logged and
 * reported through the returned reason.
 */
export async function sendTemplatedEmail(
  params: SendTemplatedEmailParams
): Promise<SendTemplatedEmailResult> {
  try {
    const def = getTemplateDefinition(params.key);
    if (!def) return { sent: false, reason: "unknown-template" };

    const recipients = normalizeRecipients(params.to);
    if (recipients.length === 0) return { sent: false, reason: "no-recipients" };

    const row = await findTemplateRow(params.key);
    if (row && !row.isEnabled) return { sent: false, reason: "disabled" };

    const vars = { ...params.vars };
    if (params.requireNonEmptyKey && !vars[params.requireNonEmptyKey]) {
      return { sent: false, reason: "empty" };
    }

    const settings = await db.emailSetting.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    });
    if (!settings) return { sent: false, reason: "no-smtp" };

    const renderedVars: Record<string, string | undefined> = {
      appName: settings.fromName || "UniTrack",
      date: new Date().toLocaleString(),
      ...vars,
    };

    const subject = renderTemplate(row?.subject || def.subject, renderedVars);
    const html = renderTemplate(row?.body || def.body, renderedVars, params.rawKeys);
    const recipientLabel = recipients.join(", ");

    const transporter = nodemailer.createTransport({
      host: settings.smtpHost,
      port: settings.smtpPort,
      secure: settings.smtpEncryption === "SSL",
      auth: { user: settings.smtpUser, pass: settings.smtpPass },
    });

    await transporter.sendMail({
      from: `"${settings.fromName}" <${settings.fromEmail}>`,
      to: recipients,
      subject,
      html,
      text: htmlToText(html),
    });

    await logActivity({
      actorName: params.actorName || "System",
      action: "sent an email",
      target: `To: ${recipientLabel} - Subject: ${subject}`,
    });

    await createNotification({
      title: "Email Sent",
      message: `Email "${subject}" sent to ${recipientLabel}`,
      type: "Success",
    });

    return { sent: true };
  } catch (error) {
    logError("Send templated email", error);
    return { sent: false, reason: "error" };
  }
}
