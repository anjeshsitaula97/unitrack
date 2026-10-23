import bcrypt from "bcryptjs";
import { baseDb } from "./base-db";
import { isSuperAdminRole } from "./permission-catalog";

/**
 * The credential half of a sign-in, shared by every door that opens one.
 *
 * The password form, the Super Admin console form and the email-code relogin all
 * have to answer the same question — is this really this account — and they must
 * answer it the same way. When that logic is copied, the copy is the one people
 * find: a relogin path that skips the "account is suspended" check, or a console
 * path that forgets the student table. One function keeps the refusals identical
 * wherever they come from.
 *
 * Deliberately does *not* look at sessions: whether the account is already live
 * elsewhere is a different question, asked by a different layer.
 */

/** Which front door the attempt came through. */
export type LoginPortal = "super-admin" | "student" | undefined;

export interface StaffPrincipal {
  subject: "user";
  id: number;
  email: string;
  /** `String` on both account rows, never null, so the audit trail has a name. */
  name: string;
  role: string;
  consultancyId: number | null;
  isFirstLogin: boolean;
}

export interface StudentPrincipal {
  subject: "student";
  id: number;
  email: string;
  name: string;
  consultancyId: number | null;
}

export type LoginPrincipal = StaffPrincipal | StudentPrincipal;

export type CredentialResult =
  | { ok: true; principal: LoginPrincipal }
  /** `status`/`error` are exactly what the caller should return, unchanged. */
  | { ok: false; status: number; error: string };

const GENERIC_FAILURE = "Invalid email or password.";

function toStaff(user: {
  id: number;
  email: string;
  name: string;
  role: string;
  consultancyId?: number | null;
  isFirstLogin?: boolean | null;
}): StaffPrincipal {
  return {
    subject: "user",
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    consultancyId: user.consultancyId ?? null,
    isFirstLogin: user.isFirstLogin ?? false,
  };
}

/**
 * Checks an email + password pair against the table that owns it and returns the
 * account, or the refusal the caller should hand back. A wrong password and an
 * unknown address answer identically, so the form cannot be used to list accounts.
 */
export async function verifyLoginCredentials(params: {
  email: string;
  password: string;
  portal?: LoginPortal;
}): Promise<CredentialResult> {
  const email = String(params.email || "")
    .trim()
    .toLowerCase();

  if (params.portal === "student") {
    const student = await baseDb.student.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, studentPassword: true, consultancyId: true },
    });

    if (!student || !student.studentPassword) {
      return { ok: false, status: 401, error: "Invalid credentials" };
    }

    const valid = await bcrypt.compare(params.password, student.studentPassword);
    if (!valid) return { ok: false, status: 401, error: "Invalid credentials" };

    return {
      ok: true,
      principal: {
        subject: "student",
        id: student.id,
        email: student.email,
        name: student.name,
        consultancyId: student.consultancyId ?? null,
      },
    };
  }

  const user = await baseDb.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      password: true,
      status: true,
      consultancyId: true,
      isFirstLogin: true,
    },
  });

  if (!user || !user.password) {
    return { ok: false, status: 401, error: GENERIC_FAILURE };
  }

  const matches = await bcrypt.compare(params.password, user.password);
  if (!matches) return { ok: false, status: 401, error: GENERIC_FAILURE };

  // A correct password is not enough — disabled, suspended or still-pending
  // accounts must not receive a session.
  if (user.status && user.status.toLowerCase() !== "active") {
    return {
      ok: false,
      status: 403,
      error: "Your account is not active. Please contact an administrator.",
    };
  }

  // The dedicated Super Admin portal only admits Super Administrators.
  if (params.portal === "super-admin" && !isSuperAdminRole(user.role)) {
    return { ok: false, status: 403, error: "This portal is for Super Administrators only." };
  }

  return { ok: true, principal: toStaff(user) };
}
