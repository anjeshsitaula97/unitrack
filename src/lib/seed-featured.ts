import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const [universities, courses] = await Promise.all([
    prisma.university.findMany({ take: 2 }),
    prisma.course.findMany({ take: 2 }),
  ]);

  await Promise.all([
    ...universities.map((u) =>
      prisma.university
        .update({
          where: { id: u.id },
          data: { isFeatured: true },
        })
        .then(() => console.log(`Featured university: ${u.name}`))
    ),
    ...courses.map((c) =>
      prisma.course
        .update({
          where: { id: c.id },
          data: { isFeatured: true },
        })
        .then(() => console.log(`Featured course: ${c.name}`))
    ),
  ]);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
