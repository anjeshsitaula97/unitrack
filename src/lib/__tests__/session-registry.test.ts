import { describe, it, expect, vi, beforeEach } from "vitest";

const baseDb = vi.hoisted(() => ({
  user: { findUnique: vi.fn(), update: vi.fn() },
  student: { findUnique: vi.fn(), update: vi.fn() },
}));

vi.mock("../base-db", () => ({ baseDb }));

import {
  startSession,
  endSession,
  isSessionCurrent,
  getActiveSessionId,
  invalidateSessionCache,
} from "../session-registry";

/**
 * Single-session enforcement.
 *
 * Only one session per account may be active: signing in again must lock the
 * previous one out, signing out must stop the discarded token from being
 * replayed, and a token issued before the feature existed (no session id) must
 * never be accepted.
 */

const resetAll = () => {
  baseDb.user.findUnique.mockReset().mockResolvedValue(null);
  baseDb.user.update.mockReset().mockResolvedValue({});
  baseDb.student.findUnique.mockReset().mockResolvedValue(null);
  baseDb.student.update.mockReset().mockResolvedValue({});
  invalidateSessionCache();
};

beforeEach(resetAll);

describe("session registry", () => {
  it("startSession stores a fresh id and returns it", async () => {
    const sid = await startSession({
      subject: "user",
      accountId: 7,
      ip: "10.0.0.1",
      userAgent: "Mozilla/5.0",
    });

    expect(typeof sid).toBe("string");
    expect(sid.length).toBeGreaterThan(0);
    expect(baseDb.user.update).toHaveBeenCalledWith({
      where: { id: 7 },
      data: expect.objectContaining({
        activeSessionId: sid,
        activeSessionIp: "10.0.0.1",
        activeSessionUserAgent: "Mozilla/5.0",
      }),
    });
  });

  it("truncates an over-long user agent so it fits the column", async () => {
    await startSession({
      subject: "user",
      accountId: 7,
      userAgent: "x".repeat(500),
    });

    const data = baseDb.user.update.mock.calls[0][0].data;
    expect(data.activeSessionUserAgent).toHaveLength(191);
  });

  it("a second login replaces the stored id, so the first session is revoked", async () => {
    const first = await startSession({ subject: "user", accountId: 7 });
    const second = await startSession({ subject: "user", accountId: 7 });

    expect(second).not.toBe(first);

    baseDb.user.findUnique.mockResolvedValue({ activeSessionId: second });
    invalidateSessionCache();

    expect(await isSessionCurrent("user", 7, second)).toBe(true);
    expect(await isSessionCurrent("user", 7, first)).toBe(false);
  });

  it("rejects a token that carries no session id", async () => {
    baseDb.user.findUnique.mockResolvedValue({ activeSessionId: "abc" });
    invalidateSessionCache();

    expect(await isSessionCurrent("user", 7, undefined)).toBe(false);
    expect(await isSessionCurrent("user", 7, null)).toBe(false);
    expect(await isSessionCurrent("user", 7, "")).toBe(false);
  });

  it("rejects every token when the account has no stored session", async () => {
    baseDb.user.findUnique.mockResolvedValue({ activeSessionId: null });
    invalidateSessionCache();

    expect(await isSessionCurrent("user", 7, "abc")).toBe(false);
  });

  it("denies the session when the lookup fails", async () => {
    baseDb.user.findUnique.mockRejectedValue(new Error("db down"));
    invalidateSessionCache();

    expect(await isSessionCurrent("user", 7, "abc")).toBe(false);
  });

  it("endSession rotates the stored id so the discarded token cannot be replayed", async () => {
    const old = await startSession({ subject: "user", accountId: 7 });
    await endSession("user", 7);

    const rotated = baseDb.user.update.mock.calls[1][0].data.activeSessionId;
    expect(rotated).not.toBe(old);

    baseDb.user.findUnique.mockResolvedValue({ activeSessionId: rotated });
    invalidateSessionCache();

    expect(await isSessionCurrent("user", 7, old)).toBe(false);
    expect(await isSessionCurrent("user", 7, rotated)).toBe(true);
  });

  it("keeps student sessions on their own row", async () => {
    const sid = await startSession({ subject: "student", accountId: 3 });
    expect(baseDb.student.update).toHaveBeenCalledWith({
      where: { id: 3 },
      data: expect.objectContaining({ activeSessionId: sid }),
    });
    expect(baseDb.user.update).not.toHaveBeenCalled();
  });

  it("caches the stored id for a short while and can be invalidated", async () => {
    baseDb.user.findUnique.mockResolvedValue({ activeSessionId: "one" });

    expect(await getActiveSessionId("user", 7)).toBe("one");
    expect(await getActiveSessionId("user", 7)).toBe("one");
    expect(baseDb.user.findUnique).toHaveBeenCalledTimes(1);

    invalidateSessionCache("user", 7);
    expect(await getActiveSessionId("user", 7)).toBe("one");
    expect(baseDb.user.findUnique).toHaveBeenCalledTimes(2);
  });
});
