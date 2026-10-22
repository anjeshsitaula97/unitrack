import { db } from "./db";
import { isSuperAdminRole } from "./permission-catalog";
import type { SessionPayload } from "./session";

/**
 * Room membership checks for chat.
 *
 * Listing rooms was already filtered by membership, but reading or writing the
 * messages of a room was not: any principal with `chat:read` could pass any
 * `roomId` and read every message in it, including conversations they were
 * never invited to. Membership is now checked for both reads and writes.
 *
 * `Super Admin` owns the platform and keeps an unconditional bypass, matching
 * `checkPermission`, so platform-wide moderation still works.
 */
export async function isChatRoomMember(
  roomId: number,
  session: SessionPayload
): Promise<boolean> {
  if (!Number.isInteger(roomId)) return false;
  if (isSuperAdminRole(session.role)) return true;

  const room = await db.chatRoom.findFirst({
    where: { id: roomId, members: { some: { id: session.id } } },
    select: { id: true },
  });
  return Boolean(room);
}
