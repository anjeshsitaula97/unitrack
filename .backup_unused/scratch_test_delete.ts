import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const testUser = await prisma.user.create({
    data: {
      name: 'Test Delete',
      email: 'test-delete@unitrack.com',
      password: 'password',
      role: 'Viewer'
    }
  });
  console.log(`Created test user: ${testUser.id}`);

  const deleted = await prisma.user.delete({
    where: { id: testUser.id }
  });
  console.log(`Deleted test user: ${deleted.id}`);
}

main().finally(() => prisma.$disconnect());
