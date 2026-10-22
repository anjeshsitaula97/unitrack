import { describe, it, expect, vi, beforeEach } from "vitest";

const db = vi.hoisted(() => ({
  chatRoom: { findFirst: vi.fn() },
}));

vi.mock("../db", () => ({ db }));

import { isChatRoomMember } from "../chat-access";

const staff = (id: number, role: string) => ({ id, email: "a@b.c", role }) as never;

beforeEach(() => {
  db.chatRoom.findFirst.mockReset().mockResolvedValue(null);
});

describe("isChatRoomMember", () => {
  it("denies a user who is not a member of the room", async () => {
    expect(await isChatRoomMember(5, staff(7, "Staff"))).toBe(false);
  });

  it("allows a member of the room", async () => {
    db.chatRoom.findFirst.mockResolvedValue({ id: 5 });
    expect(await isChatRoomMember(5, staff(7, "Staff"))).toBe(true);
  });

  it("scopes the lookup to the caller's own membership", async () => {
    db.chatRoom.findFirst.mockResolvedValue({ id: 5 });
    await isChatRoomMember(5, staff(7, "Staff"));
    expect(db.chatRoom.findFirst).toHaveBeenCalledWith({
      where: { id: 5, members: { some: { id: 7 } } },
      select: { id: true },
    });
  });

  it("lets a Super Admin into any room", async () => {
    expect(await isChatRoomMember(5, staff(1, "Super Admin"))).toBe(true);
    expect(db.chatRoom.findFirst).not.toHaveBeenCalled();
  });

  it("rejects a non-integer room id without querying", async () => {
    expect(await isChatRoomMember(Number.NaN, staff(7, "Staff"))).toBe(false);
    expect(await isChatRoomMember(1.5, staff(7, "Staff"))).toBe(false);
    expect(db.chatRoom.findFirst).not.toHaveBeenCalled();
  });
});
