import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { verifyAuth, type SessionPayload } from "@/lib/session";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function formatTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) return `${diffDays}d ago`;
  if (diffHours > 0) return `${diffHours}h ago`;
  if (diffMins > 0) return `${diffMins}m ago`;
  return "just now";
}

export async function GET(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value ?? req.cookies.get("auth-token")?.value;
  if (!token) {
    return new Response("Unauthorized", { status: 401 });
  }

  let payload: SessionPayload;
  try {
    payload = await verifyAuth(token);
  } catch {
    return new Response("Unauthorized", { status: 401 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let lastCheck = new Date();

      const sendEvent = (data: unknown) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch {}
      };

      sendEvent({ type: "connected", message: "SSE connected" });

      const check = async () => {
        try {
          const [notifications, unreadCount] = await Promise.all([
            db.notification.findMany({
              where: {
                OR: [{ userId: String(payload.id) }, { userId: null }],
                createdAt: { gt: lastCheck },
              },
              orderBy: { createdAt: "desc" },
              take: 10,
            }),
            db.notification.count({
              where: {
                OR: [{ userId: String(payload.id) }, { userId: null }],
                read: false,
              },
            }),
          ]);

          if (notifications.length > 0) {
            const formatted = notifications.map((n) => ({
              ...n,
              time: formatTime(n.createdAt),
            }));
            sendEvent({ type: "notifications", notifications: formatted, unreadCount });
          } else {
            sendEvent({ type: "heartbeat", timestamp: new Date().toISOString(), unreadCount });
          }

          lastCheck = new Date();
        } catch {
          // silently continue
        }
      };

      // Initial check immediately
      await check();

      const interval = setInterval(check, 10000);

      req.signal.addEventListener("abort", () => {
        clearInterval(interval);
        try {
          controller.close();
        } catch {}
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
