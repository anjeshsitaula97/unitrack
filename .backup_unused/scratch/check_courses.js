const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.course.count();
  console.log(`Course count: ${count}`);
  const courses = await prisma.course.findMany({ select: { name: true } });
  console.log('Courses:', courses);
  process.exit(0);
}

main();
