const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const leads = await prisma.lead.findMany();
  const universities = await prisma.university.findMany();
  const courses = await prisma.course.findMany();
  const partners = await prisma.partner.findMany();
  console.log({ leads, universities, courses, partners });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
