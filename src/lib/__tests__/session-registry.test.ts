import { describe, it, expect, vi, beforeEach } from "vitest";

const baseDb = vi.hoisted(() => ({
  user: { findUnique: vi.fn(), update: vi.fn() },
  student: { findUnique: vi.fn(), update: vi.fn() },
}));

/**
 * The idle window is a policy read from the database, but the registry only ever
 * asks for it in milliseconds, so the tests fix the value and drive behaviour
 * through the stored timestamps.
 */
const policy = vi.hoisted(() => ({ timeoutMs: 15 * 60 * 1000 }));
vi.mock("../session-policy", () => ({
  getSessionIdleTimeoutMs: () => Promise.resolve(policy.timeoutMs),
}));

vi.mock("../base-db", () => ({ baseDb }));

import {
  startSession,
  endSession,
  touchSession,
  isSessionCurrent,
  getSessionCurrency,
  isSessionLiveElsewhere,
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
 *
 * A session also has to stop working once it has been idle for longer than the
 * configured window, because the same timestamp is what makes a sign-in from
 * elsewhere count as "already logged in" rather than "someone forgot to sign out".
 */

const resetAll = () => {
  baseDb.user.findUnique.mockReset().mockResolvedValue(null);
  baseDb.user.update.mockReset().mockResolvedValue({});
  baseDb.student.findUnique.mockReset().mockResolvedValue(null);
  baseDb.student.update.mockReset().mockResolvedValue({});
  policy.timeoutMs = 15 * 60 * 1000;
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

  it("stamps the activity time on login and drops it on logout", async () => {
    await startSession({ subject: "user", accountId: 7 });
    expect(baseDb.user.update.mock.calls[0][0].data.activeSessionLastSeenAt).toBeInstanceOf(Date);

    await endSession("user", 7);
    expect(baseDb.user.update.mock.calls[1][0].data.activeSessionLastSeenAt).toBeNull();
  });

  it("expires a session that has been idle for longer than the window", async () => {
    policy.timeoutMs = 15 * 60 * 1000;
    baseDb.user.findUnique.mockResolvedValue({
      activeSessionId: "abc",
      activeSessionLastSeenAt: new Date(Date.now() - 20 * 60 * 1000),
    });
    invalidateSessionCache();

    expect(await isSessionCurrent("user", 7, "abc")).toBe(false);

    baseDb.user.findUnique.mockResolvedValue({
      activeSessionId: "abc",
      activeSessionLastSeenAt: new Date(Date.now() - 5 * 60 * 1000),
    });
    invalidateSessionCache();

    expect(await isSessionCurrent("user", 7, "abc")).toBe(true);
  });

  it("never expires a session whose activity time is unknown", async () => {
    // Rows written before the stamp existed, and rows whose heartbeat write
    // failed, must not lock their owner out of the system.
    baseDb.user.findUnique.mockResolvedValue({
      activeSessionId: "abc",
      activeSessionLastSeenAt: null,
      activeSessionAt: null,
    });
    invalidateSessionCache();

    expect(await isSessionCurrent("user", 7, "abc")).toBe(true);
  });

  it("dates an untouched session from its login time", async () => {
    baseDb.user.findUnique.mockResolvedValue({
      activeSessionId: "abc",
      activeSessionLastSeenAt: null,
      activeSessionAt: new Date(Date.now() - 60 * 60 * 1000),
    });
    invalidateSessionCache();

    expect(await isSessionCurrent("user", 7, "abc")).toBe(false);
  });

  it("reports a fresh session as live elsewhere and a stale one as free", async () => {
    baseDb.user.findUnique.mockResolvedValue({
      activeSessionId: "abc",
      activeSessionLastSeenAt: new Date(Date.now() - 60 * 1000),
      activeSessionIp: "203.0.113.9",
      activeSessionUserAgent: "Mozilla/5.0",
    });
    invalidateSessionCache();

    const busy = await isSessionLiveElsewhere("user", 7);
    expect(busy.live).toBe(true);
    expect(busy.state?.ip).toBe("203.0.113.9");

    baseDb.user.findUnique.mockResolvedValue({
      activeSessionId: "abc",
      activeSessionLastSeenAt: new Date(Date.now() - 60 * 60 * 1000),
    });
    invalidateSessionCache();
    expect((await isSessionLiveElsewhere("user", 7)).live).toBe(false);

    // A signed-out account has no stamp at all, so it is never "busy".
    baseDb.user.findUnique.mockResolvedValue({ activeSessionId: "abc", activeSessionAt: null });
    invalidateSessionCache();
    expect((await isSessionLiveElsewhere("user", 7)).live).toBe(false);
  });

  it("refuses a second sign-in only while the other session is still current", async () => {
    // The two rules share one window: a login must never be refused over a
    // session the server has already expired.
    baseDb.user.findUnique.mockResolvedValue({
      activeSessionId: "abc",
      activeSessionLastSeenAt: new Date(Date.now() - 60 * 60 * 1000),
    });
    invalidateSessionCache();

    expect((await isSessionLiveElsewhere("user", 7)).live).toBe(false);
    expect(await isSessionCurrent("user", 7, "abc")).toBe(false);
  });

  it("throttles the heartbeat so browsing does not write once per request", async () => {
    await touchSession("user", 7);
    expect(baseDb.user.update).toHaveBeenCalledTimes(1);

    await touchSession("user", 7);
    expect(baseDb.user.update).toHaveBeenCalledTimes(1);

    await touchSession("user", 7, { force: true });
    expect(baseDb.user.update).toHaveBeenCalledTimes(2);
    expect(baseDb.user.update.mock.calls[1][0].data.activeSessionLastSeenAt).toBeInstanceOf(Date);
  });

  it("reads the policy back for students on their own row", async () => {
    baseDb.student.findUnique.mockResolvedValue({
      activeSessionId: "stu",
      activeSessionLastSeenAt: new Date(),
    });
    invalidateSessionCache();

    expect(await isSessionCurrent("student", 3, "stu")).toBe(true);
    expect((await isSessionLiveElsewhere("student", 3)).live).toBe(true);
    expect(baseDb.user.findUnique).not.toHaveBeenCalled();
  });

  it("says why a session was refused, not just that it was", async () => {
    // A taken-over session and an idle one both arrive as a 401, and only the
    // first of those is something the account holder should hear about.
    baseDb.user.findUnique.mockResolvedValue({
      activeSessionId: "new",
      activeSessionLastSeenAt: new Date(),
    });
    invalidateSessionCache();
    expect(await getSessionCurrency("user", 7, "old")).toEqual({
      current: false,
      reason: "superseded",
    });

    baseDb.user.findUnique.mockResolvedValue({
      activeSessionId: "abc",
      activeSessionLastSeenAt: new Date(Date.now() - 20 * 60 * 1000),
    });
    invalidateSessionCache();
    expect(await getSessionCurrency("user", 7, "abc")).toEqual({
      current: false,
      reason: "idle",
    });

    baseDb.user.findUnique.mockResolvedValue({
      activeSessionId: "abc",
      activeSessionLastSeenAt: new Date(),
    });
    invalidateSessionCache();
    expect(await getSessionCurrency("user", 7, "abc")).toEqual({
      current: true,
      reason: "ok",
    });

    expect(await getSessionCurrency("user", 7, undefined)).toEqual({
      current: false,
      reason: "missing",
    });

    baseDb.user.findUnique.mockResolvedValue({ activeSessionId: null });
    invalidateSessionCache();
    expect(await getSessionCurrency("user", 7, "abc")).toEqual({
      current: false,
      reason: "none",
    });
  });

  it("refuses to let a stale token end the session that replaced it", async () => {
    // The browser that lost its session still calls logout on its way out; that
    // must not sign out the location that took the account over.
    baseDb.user.findUnique.mockResolvedValue({ activeSessionId: "current" });
    invalidateSessionCache();
    baseDb.user.update.mockClear();

    await endSession("user", 7, "stale");
    expect(baseDb.user.update).not.toHaveBeenCalled();

    // The same call with the id that is actually current does rotate.
    await endSession("user", 7, "current");
    expect(baseDb.user.update).toHaveBeenCalledTimes(1);
  });
});
