const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const result = await prisma.$queryRawUnsafe('PRAGMA journal_mode=WAL;');
    console.log('WAL Mode enabled:', result);
  } catch (err) {
    console.error('Error enabling WAL mode:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
