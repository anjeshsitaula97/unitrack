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

export const verifyAuth = async (token: string): Promise<SessionPayload> => {
  try {
    const verified = await jwtVerify(token, new TextEncoder().encode(getJwtSecretKey()));
    return verified.payload as unknown as SessionPayload;
  } catch (_err) {
    throw new Error("Your token has expired.");
  }
};

export const signToken = async (payload: { id: number; email: string; role: string }) => {
  const token = await new SignJWT({ ...payload, subject: "user" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(new TextEncoder().encode(getJwtSecretKey()));

  return token;
};

export const signStudentToken = async (payload: { id: number; email: string }) => {
  const token = await new SignJWT({ ...payload, role: "Student", subject: "student" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(new TextEncoder().encode(getJwtSecretKey()));

  return token;
};
