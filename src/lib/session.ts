import { jwtVerify, SignJWT } from "jose";

const getJwtSecretKey = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length === 0) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("The environment variable JWT_SECRET is not set.");
    } else {
      return "super-secret-default-key-for-dev";
    }
  }
  return secret;
};

export const verifyAuth = async (token: string) => {
  try {
    const verified = await jwtVerify(
      token,
      new TextEncoder().encode(getJwtSecretKey())
    );
    return verified.payload;
  } catch (err) {
    throw new Error("Your token has expired.");
  }
};

export const signToken = async (payload: { id: string; email: string; role: string }) => {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(new TextEncoder().encode(getJwtSecretKey()));

  return token;
};
