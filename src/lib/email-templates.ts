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

/** Renders a two-column details table for application lifecycle emails. */
function detailRows(rows: [string, string][]): string {
  return `<table style="width:100%;border-collapse:collapse;margin:12px 0;border:1px solid #eef2f7;border-radius:8px;overflow:hidden;">
      ${rows
        .map(
          ([label, value]) => `<tr>
        <td style="padding:8px 12px;background:#f8fafc;color:#64748b;font-size:12px;width:38%;font-family:Arial,Helvetica,sans-serif;">${label}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eef2f7;color:#0f172a;font-size:13px;font-weight:bold;font-family:Arial,Helvetica,sans-serif;">${value}</td>
      </tr>`
        )
        .join("")}
    </table>`;
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
  {
    key: "application-submitted",
    name: "Application Submitted",
    description:
      "Confirms to the student that their application was submitted, with the university, course and start date.",
    trigger: "Automatically when an application is created",
    autoSend: true,
    placeholders: [
      "studentName",
      "studentEmail",
      "universityName",
      "universityCountry",
      "courseName",
      "courseStartDate",
      "courseIntake",
      "applicationStatus",
      "actorName",
      "appName",
      "date",
    ],
    subject: "Application submitted: {{courseName}} at {{universityName}}",
    body: shell(`      <p style="margin:0 0 16px;color:#0f172a;font-size:15px;">Dear {{studentName}},</p>
      <p style="margin:0 0 16px;color:#334155;font-size:14px;line-height:1.6;">
        Great news — your application has been submitted successfully. Here are the details:
      </p>
      ${detailRows([
        ["University", "{{universityName}}"],
        ["Course", "{{courseName}}"],
        ["Course start date", "{{courseStartDate}}"],
        ["Intake", "{{courseIntake}}"],
        ["Status", "{{applicationStatus}}"],
      ])}
      <p style="margin:0 0 16px;color:#334155;font-size:14px;line-height:1.6;">
        Your counselor will keep you updated as the university reviews your application. If any of
        the details above look incorrect, please contact your counselor as soon as possible.
      </p>
      <p style="margin:0;color:#334155;font-size:14px;line-height:1.6;">
        Best regards,<br />The {{appName}} team
      </p>`),
  },
  {
    key: "application-status-updated",
    name: "Application Status Updated",
    description: "Notifies the student whenever the status of their application changes.",
    trigger: "Automatically when an application status changes",
    autoSend: true,
    placeholders: [
      "studentName",
      "studentEmail",
      "universityName",
      "courseName",
      "courseStartDate",
      "previousStatus",
      "newStatus",
      "appName",
      "date",
    ],
    subject: "Application update: {{newStatus}}",
    body: shell(`      <p style="margin:0 0 16px;color:#0f172a;font-size:15px;">Dear {{studentName}},</p>
      <p style="margin:0 0 16px;color:#334155;font-size:14px;line-height:1.6;">
        The status of your application has been updated. Here are the details:
      </p>
      ${detailRows([
        ["University", "{{universityName}}"],
        ["Course", "{{courseName}}"],
        ["Course start date", "{{courseStartDate}}"],
        ["Previous status", "{{previousStatus}}"],
        ["New status", "{{newStatus}}"],
      ])}
      <p style="margin:0;color:#334155;font-size:14px;line-height:1.6;">
        Please contact your counselor if you have any questions about this update.
      </p>`),
  },
  {
    key: "application-approved",
    name: "Application Approved (Offer Received)",
    description:
      "Congratulates the student when their application is approved or an offer arrives.",
    trigger: "Automatically when the application status becomes Approved",
    autoSend: true,
    placeholders: [
      "studentName",
      "studentEmail",
      "universityName",
      "courseName",
      "courseStartDate",
      "applicationStatus",
      "actorName",
      "appName",
      "date",
    ],
    subject: "Offer received for {{courseName}} at {{universityName}}",
    body: shell(`      <p style="margin:0 0 16px;color:#0f172a;font-size:15px;">Dear {{studentName}},</p>
      <p style="margin:0 0 16px;color:#334155;font-size:14px;line-height:1.6;">
        Congratulations! We are delighted to let you know that your application has been approved.
      </p>
      ${detailRows([
        ["University", "{{universityName}}"],
        ["Course", "{{courseName}}"],
        ["Course start date", "{{courseStartDate}}"],
        ["Status", "{{applicationStatus}}"],
      ])}
      <p style="margin:0 0 16px;color:#334155;font-size:14px;line-height:1.6;">
        Your counselor will guide you through the next steps, including accepting your offer,
        paying any deposit and preparing your documents.
      </p>
      <p style="margin:0;color:#334155;font-size:14px;line-height:1.6;">
        Best regards,<br />The {{appName}} team
      </p>`),
  },
  {
    key: "application-rejected",
    name: "Application Rejected",
    description: "Informs the student when their application is rejected or declined.",
    trigger: "Automatically when the application status becomes Rejected",
    autoSend: true,
    placeholders: [
      "studentName",
      "studentEmail",
      "universityName",
      "courseName",
      "applicationStatus",
      "appName",
      "date",
    ],
    subject: "Update on your application to {{universityName}}",
    body: shell(`      <p style="margin:0 0 16px;color:#0f172a;font-size:15px;">Dear {{studentName}},</p>
      <p style="margin:0 0 16px;color:#334155;font-size:14px;line-height:1.6;">
        Thank you for your interest in {{courseName}} at {{universityName}}. After careful review,
        we regret to inform you that this application has not been successful.
      </p>
      <p style="margin:0 0 16px;color:#334155;font-size:14px;line-height:1.6;">
        This outcome does not close the door to your study plans. Your counselor can help you
        explore alternative courses and universities that match your profile.
      </p>
      <p style="margin:0;color:#334155;font-size:14px;line-height:1.6;">
        Please reach out to your counselor if you would like to discuss your options.
      </p>`),
  },
  {
    key: "interview-scheduled",
    name: "Interview Scheduled",
    description: "Tells the student that an interview has been scheduled for their application.",
    trigger: "Automatically when the application status becomes Interview Scheduled",
    autoSend: true,
    placeholders: [
      "studentName",
      "studentEmail",
      "universityName",
      "courseName",
      "applicationStatus",
      "actorName",
      "appName",
      "date",
    ],
    subject: "Interview scheduled for {{courseName}} at {{universityName}}",
    body: shell(`      <p style="margin:0 0 16px;color:#0f172a;font-size:15px;">Dear {{studentName}},</p>
      <p style="margin:0 0 16px;color:#334155;font-size:14px;line-height:1.6;">
        An interview has been scheduled for your application to {{courseName}} at
        {{universityName}}.
      </p>
      ${detailRows([
        ["University", "{{universityName}}"],
        ["Course", "{{courseName}}"],
        ["Status", "{{applicationStatus}}"],
      ])}
      <p style="margin:0 0 16px;color:#334155;font-size:14px;line-height:1.6;">
        Your counselor will share the exact date, time and mode of the interview. Please prepare
        any documents requested and make sure you are available at the agreed time.
      </p>
      <p style="margin:0;color:#334155;font-size:14px;line-height:1.6;">
        Contact your counselor if you have not received the interview details.
      </p>`),
  },
  {
    key: "interview-result",
    name: "Interview Result",
    description: "Notifies the student that their interview result is available.",
    trigger: "Automatically when the application status becomes Interview Result",
    autoSend: true,
    placeholders: [
      "studentName",
      "studentEmail",
      "universityName",
      "courseName",
      "applicationStatus",
      "appName",
      "date",
    ],
    subject: "Interview result for {{courseName}} at {{universityName}}",
    body: shell(`      <p style="margin:0 0 16px;color:#0f172a;font-size:15px;">Dear {{studentName}},</p>
      <p style="margin:0 0 16px;color:#334155;font-size:14px;line-height:1.6;">
        The result of your interview for {{courseName}} at {{universityName}} has been released.
      </p>
      ${detailRows([
        ["University", "{{universityName}}"],
        ["Course", "{{courseName}}"],
        ["Status", "{{applicationStatus}}"],
      ])}
      <p style="margin:0 0 16px;color:#334155;font-size:14px;line-height:1.6;">
        Your counselor has the full outcome and will explain what it means for your application
        and the next steps available to you.
      </p>
      <p style="margin:0;color:#334155;font-size:14px;line-height:1.6;">
        Please contact your counselor if you have any questions.
      </p>`),
  },
  {
    key: "admission-test-scheduled",
    name: "Admission Test Scheduled",
    description: "Tells the student that an admission test has been scheduled.",
    trigger: "Automatically when the application status becomes Admission Test Scheduled",
    autoSend: true,
    placeholders: [
      "studentName",
      "studentEmail",
      "universityName",
      "courseName",
      "applicationStatus",
      "actorName",
      "appName",
      "date",
    ],
    subject: "Admission test scheduled for {{courseName}} at {{universityName}}",
    body: shell(`      <p style="margin:0 0 16px;color:#0f172a;font-size:15px;">Dear {{studentName}},</p>
      <p style="margin:0 0 16px;color:#334155;font-size:14px;line-height:1.6;">
        An admission test has been scheduled for your application to {{courseName}} at
        {{universityName}}.
      </p>
      ${detailRows([
        ["University", "{{universityName}}"],
        ["Course", "{{courseName}}"],
        ["Status", "{{applicationStatus}}"],
      ])}
      <p style="margin:0 0 16px;color:#334155;font-size:14px;line-height:1.6;">
        Your counselor will share the exact date, time, venue or online link for the test. Please
        review the course requirements and prepare accordingly.
      </p>
      <p style="margin:0;color:#334155;font-size:14px;line-height:1.6;">
        Contact your counselor if you have not received the test details.
      </p>`),
  },
  {
    key: "admission-test-result",
    name: "Admission Test Result",
    description: "Notifies the student that their admission test result is available.",
    trigger: "Automatically when the application status becomes Admission Test Result",
    autoSend: true,
    placeholders: [
      "studentName",
      "studentEmail",
      "universityName",
      "courseName",
      "applicationStatus",
      "appName",
      "date",
    ],
    subject: "Admission test result for {{courseName}} at {{universityName}}",
    body: shell(`      <p style="margin:0 0 16px;color:#0f172a;font-size:15px;">Dear {{studentName}},</p>
      <p style="margin:0 0 16px;color:#334155;font-size:14px;line-height:1.6;">
        The result of your admission test for {{courseName}} at {{universityName}} has been
        released.
      </p>
      ${detailRows([
        ["University", "{{universityName}}"],
        ["Course", "{{courseName}}"],
        ["Status", "{{applicationStatus}}"],
      ])}
      <p style="margin:0 0 16px;color:#334155;font-size:14px;line-height:1.6;">
        Your counselor has the full outcome and will explain what it means for your application
        and the next steps available to you.
      </p>
      <p style="margin:0;color:#334155;font-size:14px;line-height:1.6;">
        Please contact your counselor if you have any questions.
      </p>`),
  },
  {
    key: "documents-requested",
    name: "Documents Requested",
    description: "Asks the student to provide additional documents for their application.",
    trigger: "Manual — send from the emails page when documents are missing",
    autoSend: false,
    placeholders: [
      "studentName",
      "studentEmail",
      "universityName",
      "courseName",
      "documentList",
      "appName",
      "date",
    ],
    subject: "Additional documents needed for your application",
    body: shell(`      <p style="margin:0 0 16px;color:#0f172a;font-size:15px;">Dear {{studentName}},</p>
      <p style="margin:0 0 16px;color:#334155;font-size:14px;line-height:1.6;">
        To continue processing your application for {{courseName}} at {{universityName}}, we need
        the following documents from you:
      </p>
      <p style="margin:0 0 16px;color:#0f172a;font-size:14px;line-height:1.6;font-weight:bold;">
        {{documentList}}
      </p>
      <p style="margin:0;color:#334155;font-size:14px;line-height:1.6;">
        Please send them to your counselor as soon as possible so your application is not delayed.
      </p>`),
  },
];

/** Maps an application status name to the lifecycle template that should be sent. */
export function applicationEmailTemplateKey(status: string): string {
  const s = status.trim().toLowerCase();

  if (s.includes("interview")) {
    if (/(result|outcome|decision)/.test(s)) return "interview-result";
    if (/(schedul|date|invite|invitation)/.test(s)) return "interview-scheduled";
  }

  if (s.includes("admission") && s.includes("test")) {
    if (/(result|outcome|score|decision)/.test(s)) return "admission-test-result";
    if (/(schedul|date|invite|invitation)/.test(s)) return "admission-test-scheduled";
  }

  if (/(reject|declin)/.test(s)) return "application-rejected";
  if (/(approv|offer|accept)/.test(s)) return "application-approved";

  return "application-status-updated";
}

/** Formats a date for email bodies, falling back to "To be confirmed". */
export function formatTemplateDate(
  value: Date | string | null | undefined,
  fallback = "To be confirmed"
): string {
  if (!value) return fallback;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function getTemplateDefinition(key: string): EmailTemplateDefinition | undefined {
  return EMAIL_TEMPLATE_CATALOG.find((t) => t.key === key);
}

/**
 * Internal, catalog-less row that stores the global "email students after an
 * application status change" switch. It is deliberately not part of
 * `EMAIL_TEMPLATE_CATALOG`, so it never shows up in the template list.
 */
const AUTO_STATUS_EMAILS_KEY = "__auto_status_emails";

/** Whether automatic emails should be sent on application status changes. */
export async function getAutoStatusEmailsEnabled(): Promise<boolean> {
  try {
    const row = await db.emailTemplate.findFirst({ where: { key: AUTO_STATUS_EMAILS_KEY } });
    return row ? row.isEnabled : true;
  } catch (error) {
    logError("Load automatic status email setting", error);
    return true;
  }
}

/** Persists the global automatic status-email switch. */
export async function setAutoStatusEmailsEnabled(enabled: boolean): Promise<void> {
  const existing = await db.emailTemplate.findFirst({ where: { key: AUTO_STATUS_EMAILS_KEY } });
  if (existing) {
    await db.emailTemplate.update({ where: { id: existing.id }, data: { isEnabled: enabled } });
    return;
  }
  await db.emailTemplate.create({
    data: {
      key: AUTO_STATUS_EMAILS_KEY,
      name: "Automatic status emails",
      subject: "Internal setting",
      body: "Internal setting",
      isEnabled: enabled,
      isDefault: true,
    },
  });
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
  try {
    const existingRows = await db.emailTemplate.findMany({
      where: { key: { in: EMAIL_TEMPLATE_CATALOG.map((def) => def.key) } },
      select: { key: true },
    });
    const existingKeys = new Set(existingRows.map((row) => row.key));
    const missing = EMAIL_TEMPLATE_CATALOG.filter((def) => !existingKeys.has(def.key));

    await Promise.all(
      missing.map(async (def) => {
        try {
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
      })
    );
  } catch (error) {
    logError("Load email templates", error);
  }
}

export interface SendTemplatedEmailParams {
  key: string;
  to: string | string[];
  vars?: Record<string, string | undefined>;
  /** Variable names whose values are pre-rendered HTML and must not be escaped. */
  rawKeys?: string[];
  actorName?: string;
  /** Account id of the staff member who triggered the email (for the audit trail). */
  actorUserId?: number | null;
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
      userId: params.actorUserId ?? null,
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
