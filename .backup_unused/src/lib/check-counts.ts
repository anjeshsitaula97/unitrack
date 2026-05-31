import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const uCount = await prisma.university.count();
  const cCount = await prisma.course.count();
  console.log(`Universities: ${uCount}, Courses: ${cCount}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
