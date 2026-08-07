import { db } from "./db";

export async function createNotification(data: {
  userId?: string | number | null;
  title: string;
  message: string;
  type?: "Info" | "Success" | "Warning" | "Error";
}) {
  try {
    await db.notification.create({
      data: {
        userId: data.userId != null && data.userId !== "" ? String(data.userId) : null,
        title: data.title,
        message: data.message,
        type: data.type || "Info",
      },
    });
  } catch (error) {
    console.error("Failed to create notification:", error);
  }
}

async function createNotificationForAll(data: {
  title: string;
  message: string;
  type?: "Info" | "Success" | "Warning" | "Error";
}) {
  try {
    await db.notification.create({
      data: {
        userId: null,
        title: data.title,
        message: data.message,
        type: data.type || "Info",
      },
    });
  } catch (error) {
    console.error("Failed to create global notification:", error);
  }
}
