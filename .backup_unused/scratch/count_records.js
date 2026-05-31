const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const courses = await prisma.course.count();
  const leads = await prisma.lead.count();
  const universities = await prisma.university.count();
  const partners = await prisma.partner.count();
  console.log({ courses, leads, universities, partners });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
