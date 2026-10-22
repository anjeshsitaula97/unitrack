/**
 * ONE-TIME LOCAL SETUP ONLY — DO NOT RUN IN PRODUCTION.
 *
 * This script creates/upserts an account with a known password and is blocked
 * unless explicitly enabled via ALLOW_INSECURE_SEED_ADMIN=true. It must never
 * run in production. Credentials are hardcoded for local dev only and should
 * be rotated immediately.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  if (process.env.ALLOW_INSECURE_SEED_ADMIN !== "true") {
    console.error(
      "Refusing to run: set ALLOW_INSECURE_SEED_ADMIN=true to execute this one-time setup script (local dev only)."
    );
    process.exit(1);
  }
  if (process.env.NODE_ENV === "production") {
    console.error("Refusing to run in production.");
    process.exit(1);
  }

  const email = "admin@gmail.com";
  const rawPassword = "admin";

  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(rawPassword, salt);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      role: "Admin",
      name: "Admin",
    },
    create: {
      email,
      name: "Admin",
      password: hashedPassword,
      role: "Admin",
    },
  });

  console.log("Seeded admin user:", admin.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
