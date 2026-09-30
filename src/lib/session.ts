import { jwtVerify, SignJWT } from "jose";

const getJwtSecretKey = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length === 0) {
    throw new Error("The environment variable JWT_SECRET is not set.");
  }
  return secret;
};

export interface SessionPayload {
  id: number;
  email: string;
  role: string;
  name?: string;
  subject?: "user" | "student";
  [key: string]: unknown;
}

export const ADMIN_ROLES = ["Super Admin", "Admin"] as const;
export const STAFF_ROLES = ["Super Admin", "Admin", "Staff"] as const;

// Pin the algorithm so a token can never be presented with "none" or swapped to
// an asymmetric algorithm that would treat the shared secret as a public key.
const ALLOWED_ALGORITHMS = ["HS256"] as const;
const TOKEN_ISSUER = "unitrack";
const TOKEN_AUDIENCE = "unitrack-session";

// A token is only a claim. The role and account state are re-read from the
// database by getSession, so a demoted, disabled or deleted user cannot keep
// acting on a role baked into a still-unexpired token.
const isValidStaffPayload = (
  payload: Record<string, unknown>
): payload is unknown & SessionPayload => {
  if (typeof payload.id !== "number" || !Number.isInteger(payload.id) || payload.id <= 0) {
    return false;
  }
  if (typeof payload.email !== "string" || payload.email.length === 0) return false;
  if (typeof payload.role !== "string" || payload.role.length === 0) return false;
  return true;
};

const isValidStudentPayload = (payload: Record<string, unknown>): boolean =>
  isValidStaffPayload(payload) && payload.subject === "student";

export const verifyAuth = async (token: string): Promise<SessionPayload> => {
  try {
    const verified = await jwtVerify(token, new TextEncoder().encode(getJwtSecretKey()), {
      algorithms: [...ALLOWED_ALGORITHMS],
      issuer: TOKEN_ISSUER,
      audience: TOKEN_AUDIENCE,
    });

    const payload = verified.payload as Record<string, unknown>;
    if (payload.subject === "student") {
      if (!isValidStudentPayload(payload)) throw new Error("Malformed student token.");
    } else if (!isValidStaffPayload(payload)) {
      throw new Error("Malformed session token.");
    }

    return payload as unknown as SessionPayload;
  } catch (_err) {
    throw new Error("Your token has expired.");
  }
};

export const signToken = async (payload: { id: number; email: string; role: string }) => {
  const token = await new SignJWT({ ...payload, subject: "user" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(TOKEN_ISSUER)
    .setAudience(TOKEN_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime("12h")
    .sign(new TextEncoder().encode(getJwtSecretKey()));

  return token;
};

export const signStudentToken = async (payload: { id: number; email: string }) => {
  const token = await new SignJWT({ ...payload, role: "Student", subject: "student" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(TOKEN_ISSUER)
    .setAudience(TOKEN_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime("12h")
    .sign(new TextEncoder().encode(getJwtSecretKey()));

  return token;
};
