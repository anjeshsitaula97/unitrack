const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  try {
    const roles = await prisma.role.count();
    const courses = await prisma.course.count();
    console.log(JSON.stringify({ roles, courses }));
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}
main();
