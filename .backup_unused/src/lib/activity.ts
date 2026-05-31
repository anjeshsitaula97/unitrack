import { db } from './db';
import { createNotification } from './notifications';

export async function logActivity(data: {
  actorName: string;
  userId?: string;
  action: string;
  target: string;
  targetBy?: string;
  actorInitials?: string;
  actorColor?: string;
}) {
  try {
    const actorInitials = data.actorInitials || 
      data.actorName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    
    const actorColor = data.actorColor || 
      ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'][Math.floor(Math.random() * 5)];

    await db.activityLog.create({
      data: {
        actorName: data.actorName,
        userId: data.userId,
        actorInitials,
        actorColor,
        action: data.action,
        target: data.target,
        targetBy: data.targetBy,
      },
    });

    // Automatically create notifications for important actions
    if (data.action.includes('created') || data.action.includes('invited') || data.action.includes('deleted')) {
      await createNotification({
        title: data.action.charAt(0).toUpperCase() + data.action.slice(1),
        message: `${data.actorName} ${data.action} ${data.target}`,
        type: data.action.includes('deleted') ? 'Warning' : 'Success'
      });
    }
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
}
