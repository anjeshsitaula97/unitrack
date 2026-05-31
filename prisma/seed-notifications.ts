import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();

const INITIAL_NOTIFICATIONS = [
  {
    title: 'System Update Successful',
    message: 'The system has been updated to version 2.4.0. Check the changelog for new features.',
    type: 'Success',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
  },
  {
    title: 'Security Alert',
    message: 'A new login was detected from a new device in London, UK.',
    type: 'Warning',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hrs ago
  },
  {
    title: 'Database Backup',
    message: 'Daily scheduled backup completed successfully. Total size: 450MB.',
    type: 'Info',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
  }
];

async function run() {
  console.log('Seeding notifications...');
  await Promise.all(INITIAL_NOTIFICATIONS.map(n => db.notification.create({ data: n })));
  console.log('Notifications seeded.');
}

run().catch(console.error).finally(() => db.$disconnect());
