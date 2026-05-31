import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Get some IDs
  const universities = await prisma.university.findMany({ take: 2 });
  const courses = await prisma.course.findMany({ take: 2 });

  for (const u of universities) {
    await prisma.university.update({
      where: { id: u.id },
      data: { isFeatured: true },
    });
    console.log(`Featured university: ${u.name}`);
  }

  for (const c of courses) {
    await prisma.course.update({
      where: { id: c.id },
      data: { isFeatured: true },
    });
    console.log(`Featured course: ${c.name}`);
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
