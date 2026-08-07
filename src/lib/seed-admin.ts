import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL || "admin@unitrack.local";
  const rawPassword = process.env.ADMIN_PASSWORD || crypto.randomBytes(16).toString("hex");

  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(rawPassword, salt);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      role: "Admin",
    },
    create: {
      email,
      name: process.env.ADMIN_NAME || "Admin",
      password: hashedPassword,
      role: "Admin",
    },
  });

  console.log("Seeded admin user:", admin.email);
  if (!process.env.ADMIN_PASSWORD) {
    console.log("Generated password (set ADMIN_PASSWORD env var to use custom):", rawPassword);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
