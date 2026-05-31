import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const courses = await prisma.course.count();
  const leads = await prisma.lead.count();
  const students = await prisma.student.count();
  const partners = await prisma.partner.count();
  console.log({ courses, leads, students, partners });
  const allCourses = await prisma.course.findMany({ select: { id: true, name: true } });
  console.log('Courses:', allCourses);
}
main();
