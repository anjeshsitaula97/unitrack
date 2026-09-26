import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "admin@unitrack.com";
  const password = "admin";

  console.log(`Checking for user: ${email}...`);

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      role: "Super Admin",
    },
    create: {
      email,
      password: hashedPassword,
      role: "Super Admin",
      name: "System Administrator",
      isFirstLogin: false,
    },
  });

  console.log(`Successfully set credentials for ${email}:`);
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
