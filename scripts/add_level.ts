import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
async function main() {
  await p.$executeRawUnsafe('ALTER TABLE `Qualification` ADD COLUMN `level` INT DEFAULT 0');
  console.log('done');
  await p.$disconnect();
}
main();