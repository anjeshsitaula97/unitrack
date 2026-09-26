const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const email = "admin@unitrack.com";
  const password = "admin";
  const roleName = "Super Admin";

  console.log(`Checking for user: ${email}...`);
  
  const role = await prisma.role.findUnique({
    where: { name: roleName },
  });

  if (!role) {
    console.error(`Error: Role '${roleName}' not found. Please run role seeding first.`);
    process.exit(1);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
    },
    create: {
      email,
      password: hashedPassword,
      role: role.name,
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
