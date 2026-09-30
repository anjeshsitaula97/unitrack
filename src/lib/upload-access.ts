import { db } from "./db";
import type { SessionPayload } from "./session";

/**
 * Authorisation for stored uploads.
 *
 * Upload filenames are random UUIDs, which is obscurity rather than access
 * control: any authenticated user who learned a URL could read it. Every stored
 * file is therefore resolved back to the record that owns it, and the requester
 * is checked against that record. Files that belong to no record are refused, so
 * a leaked or guessed URL no longer grants access on its own.
 */

const STAFF_ROLES = ["Super Admin", "Admin", "Staff"];
const ADMIN_ROLES = ["Super Admin", "Admin"];

type Verdict = "allow" | "deny";

const isStaff = (session: SessionPayload) => STAFF_ROLES.includes(session.role);
const isAdmin = (session: SessionPayload) => ADMIN_ROLES.includes(session.role);

/** Normalise stored values ("/uploads/x/y.png") to the path the route resolves. */
const toStoredPath = (value: string | null | undefined): string | null => {
  if (!value) return null;
  const cleaned = value
    .split("?")[0]
    .replace(/^\/+/, "")
    .replace(/^uploads\//, "");
  return cleaned.length > 0 ? cleaned : null;
};

const owns = (value: string | null | undefined, relativePath: string) =>
  toStoredPath(value) === relativePath;

/**
 * Branding and other non-sensitive assets are rendered across many pages for
 * every signed-in role, including Viewer, so any valid session may read them.
 */
async function isSharedAsset(relativePath: string): Promise<boolean> {
  const [university, branch, avatar, resource] = await Promise.all([
    db.university.findFirst({ where: { logo: relativePath }, select: { id: true } }),
    db.branch.findFirst({ where: { logo: relativePath }, select: { id: true } }),
    db.user.findFirst({ where: { avatar: relativePath }, select: { id: true } }),
    db.learningResource.findFirst({ where: { url: relativePath }, select: { id: true } }),
  ]);
  return Boolean(university || branch || avatar || resource);
}

export async function authorizeUploadAccess(
  relativePath: string,
  session: SessionPayload | null,
  studentSession: SessionPayload | null
): Promise<Verdict> {
  if (!session && !studentSession) return "deny";

  // A student may only read documents attached to their own record.
  if (studentSession) {
    const docs = await db.studentDocument.findMany({
      where: { studentId: studentSession.id, url: { endsWith: relativePath } },
      select: { id: true },
    });
    return docs.length > 0 ? "allow" : "deny";
  }

  if (!session || !isStaff(session)) {
    // Viewer and any other non-staff role: shared branding only.
    return (await isSharedAsset(relativePath)) ? "allow" : "deny";
  }

  // Staff session.
  const match = { endsWith: relativePath };
  const [fileItem, studentDoc, scanned, employeeDoc, material] = await Promise.all([
    db.fileItem.findFirst({ where: { url: match }, select: { userId: true, url: true } }),
    db.studentDocument.findFirst({ where: { url: match }, select: { url: true } }),
    db.scannedDocument.findFirst({ where: { url: match }, select: { userId: true, url: true } }),
    db.employeeDocument.findFirst({ where: { url: match }, select: { userId: true, url: true } }),
    db.marketingMaterial.findFirst({
      where: { fileUrl: match },
      select: { fileUrl: true },
    }),
  ]);

  // Private file-manager entries stay with the uploader unless the caller is an
  // admin, so one staff member cannot read another's private documents.
  if (fileItem && owns(fileItem.url, relativePath)) {
    return isAdmin(session) || fileItem.userId === session.id ? "allow" : "deny";
  }

  if (studentDoc && owns(studentDoc.url, relativePath)) return "allow";
  if (scanned && owns(scanned.url, relativePath)) {
    return isAdmin(session) || scanned.userId === session.id ? "allow" : "deny";
  }
  if (employeeDoc && owns(employeeDoc.url, relativePath)) {
    return isAdmin(session) || employeeDoc.userId === session.id ? "allow" : "deny";
  }

  if (material && owns(material.fileUrl, relativePath)) return "allow";
  if (await isSharedAsset(relativePath)) return "allow";

  // Nothing claims this file. Refuse rather than serve an orphan by URL.
  return "deny";
}
