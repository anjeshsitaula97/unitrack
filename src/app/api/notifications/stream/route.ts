import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { verifyAuth, type SessionPayload } from "@/lib/session";
import { isSessionCurrent } from "@/lib/session-registry";

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

  // Only one session per account is allowed; a token superseded by a newer
  // login must not keep streaming notifications.
  if (!(await isSessionCurrent("user", payload.id, payload.sid))) {
    return new Response("Unauthorized", { status: 401 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (data: unknown) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch {}
      };

      sendEvent({ type: "connected", message: "SSE connected" });

      // Signature of the last list we pushed. Any change (new, deleted, cleared
      // or read toggled) produces a new signature, so removals in one tab/page
      // propagate to every other surface instead of only ever adding rows.
      let lastSignature = "";

      const check = async () => {
        try {
          const [notifications, unreadCount] = await Promise.all([
            db.notification.findMany({
              where: { OR: [{ userId: String(payload.id) }, { userId: null }] },
              orderBy: { createdAt: "desc" },
              take: 50,
            }),
            db.notification.count({
              where: {
                OR: [{ userId: String(payload.id) }, { userId: null }],
                read: false,
              },
            }),
          ]);

          const formatted = notifications.map((n) => ({
            ...n,
            time: formatTime(n.createdAt),
          }));

          const signature = `${formatted.length}:${formatted[0]?.id ?? "-"}:${unreadCount}`;

          if (signature !== lastSignature) {
            lastSignature = signature;
            sendEvent({ type: "notifications", notifications: formatted, unreadCount });
          } else {
            sendEvent({ type: "heartbeat", timestamp: new Date().toISOString(), unreadCount });
          }
        } catch {
          // silently continue
        }
      };

      // Initial check immediately
      await check();

      const interval = setInterval(check, 3000);

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
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
