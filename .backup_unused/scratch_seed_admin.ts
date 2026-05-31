import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('admin', 10);
  await prisma.user.upsert({
    where: { email: 'admin@unitrack.com' },
    update: {
      password: hashedPassword,
      role: 'Admin',
      status: 'Active'
    },
    create: {
      name: 'Admin User',
      email: 'admin@unitrack.com',
      password: hashedPassword,
      role: 'Admin',
      status: 'Active',
      avatar: 'https://ui-avatars.com/api/?name=Admin+User'
    }
  });
  console.log('Admin user updated/created');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
