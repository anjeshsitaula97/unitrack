import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
async function run() {
  console.log({
    universities: await db.university.count(),
    courses: await db.course.count(),
    users: await db.user.count(),
    leads: await db.lead.count(),
    roles: await db.role.count(),
  });
}
run()
  .catch(console.error)
  .finally(() => db.$disconnect());
