import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const INITIAL_ROLES = [
  { 
    name: 'Administrator', 
    description: 'Full access to all modules and settings.', 
    permissions: JSON.stringify(['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7']),
    color: 'text-rose-600 bg-rose-50 border-rose-200' 
  },
  { 
    name: 'Moderator', 
    description: 'Can manage courses and universities but cannot edit system settings.', 
    permissions: JSON.stringify(['p1', 'p2', 'p3', 'p6']),
    color: 'text-indigo-600 bg-indigo-50 border-indigo-200' 
  },
  { 
    name: 'Editor', 
    description: 'Can edit content but cannot approve or delete.', 
    permissions: JSON.stringify(['p1', 'p3']),
    color: 'text-emerald-600 bg-emerald-50 border-emerald-200' 
  },
  { 
    name: 'Viewer', 
    description: 'Read-only access to all modules.', 
    permissions: JSON.stringify(['p1']),
    color: 'text-slate-600 bg-slate-50 border-slate-200' 
  },
];

async function main() {
  console.log('Seeding roles...');
  await Promise.all(INITIAL_ROLES.map(role => 
    prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: role,
    })
  ));
  console.log('Roles seeded successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
