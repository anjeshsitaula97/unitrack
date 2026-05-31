import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    const result = await prisma.$executeRawUnsafe(
      "DELETE FROM User WHERE id NOT IN (SELECT id FROM (SELECT id, ROW_NUMBER() OVER (PARTITION BY email ORDER BY createdAt DESC) as rn FROM User) as t WHERE t.rn = 1)"
    );
    console.log(`Deleted ${result} duplicates.`);
  } catch (err) {
    console.error('Raw SQL failed:', err);
  }
}

main().finally(() => prisma.$disconnect());
