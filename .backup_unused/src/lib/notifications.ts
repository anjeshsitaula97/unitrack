import { db } from './db';

export async function createNotification(data: {
  userId?: string;
  title: string;
  message: string;
  type?: 'Info' | 'Success' | 'Warning' | 'Error';
}) {
  try {
    await db.notification.create({
      data: {
        userId: data.userId,
        title: data.title,
        message: data.message,
        type: data.type || 'Info',
      },
    });
  } catch (error) {
    console.error('Failed to create notification:', error);
  }
}
