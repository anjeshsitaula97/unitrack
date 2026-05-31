import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const id = 'cmoeiuj1o00009vbj4sh2qzbp';
  try {
    const user = await prisma.user.update({
      where: { id },
      data: { name: 'Admin User Updated' }
    });
    console.log('Update successful:', user.id);
  } catch (err: any) {
    console.error('Update failed:', err.message);
  }
}

main().finally(() => prisma.$disconnect());
