import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const universities = await prisma.university.findMany({
    take: 5,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      address: true,
      shortName: true
    }
  });
  console.log(JSON.stringify(universities, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
