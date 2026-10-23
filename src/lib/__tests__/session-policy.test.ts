import { describe, it, expect, vi, beforeEach } from "vitest";

const baseDb = vi.hoisted(() => ({
  systemSettings: { findFirst: vi.fn() },
}));

vi.mock("../base-db", () => ({ baseDb }));

import {
  clampIdleTimeoutMinutes,
  getSessionIdleTimeoutMinutes,
  isSessionOtpTakeoverEnabled,
  getSessionEndNotice,
  invalidateSessionPolicyCache,
  DEFAULT_SESSION_IDLE_TIMEOUT_MINUTES,
  DEFAULT_SESSION_OTP_TAKEOVER_ENABLED,
  MIN_SESSION_IDLE_TIMEOUT_MINUTES,
  MAX_SESSION_IDLE_TIMEOUT_MINUTES,
  ALREADY_LOGGED_IN_ERROR,
  IDLE_LOGOUT_MESSAGE,
  IDLE_LOGOUT_REASON,
  REPLACED_LOGOUT_MESSAGE,
  REPLACED_LOGOUT_REASON,
} from "../session-policy";

/**
 * The platform idle policy: one value that decides both when a session is
 * dropped for inactivity and when an account counts as still signed in
 * somewhere else. Alongside it sits the switch that decides whether an account
 * owner may cut that wait short with an emailed code.
 */

beforeEach(() => {
  baseDb.systemSettings.findFirst.mockReset().mockResolvedValue(null);
  invalidateSessionPolicyCache();
});

describe("session policy", () => {
  it("clamps to the allowed range instead of trusting the stored value", () => {
    expect(clampIdleTimeoutMinutes(30)).toBe(30);
    expect(clampIdleTimeoutMinutes(0)).toBe(MIN_SESSION_IDLE_TIMEOUT_MINUTES);
    expect(clampIdleTimeoutMinutes(-5)).toBe(MIN_SESSION_IDLE_TIMEOUT_MINUTES);
    expect(clampIdleTimeoutMinutes(10_000)).toBe(MAX_SESSION_IDLE_TIMEOUT_MINUTES);
    expect(clampIdleTimeoutMinutes(7.4)).toBe(7);
    expect(clampIdleTimeoutMinutes("abc")).toBe(DEFAULT_SESSION_IDLE_TIMEOUT_MINUTES);
    expect(clampIdleTimeoutMinutes(null)).toBe(DEFAULT_SESSION_IDLE_TIMEOUT_MINUTES);
  });

  it("reads the platform row, never a consultancy's own row", async () => {
    await getSessionIdleTimeoutMinutes();
    expect(baseDb.systemSettings.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { consultancyId: null } })
    );
  });

  it("falls back to the built-in default when the row or column is missing", async () => {
    baseDb.systemSettings.findFirst.mockResolvedValue(null);
    expect(await getSessionIdleTimeoutMinutes()).toBe(DEFAULT_SESSION_IDLE_TIMEOUT_MINUTES);

    invalidateSessionPolicyCache();
    baseDb.systemSettings.findFirst.mockResolvedValue({ sessionIdleTimeoutMinutes: null });
    expect(await getSessionIdleTimeoutMinutes()).toBe(DEFAULT_SESSION_IDLE_TIMEOUT_MINUTES);
  });

  it("keeps enforcing a timeout when the policy cannot be read", async () => {
    // Failing open (never expiring a session) would leave an account "logged in
    // elsewhere" forever, so an unreadable policy must still yield a window.
    baseDb.systemSettings.findFirst.mockRejectedValue(new Error("db down"));
    expect(await getSessionIdleTimeoutMinutes()).toBe(DEFAULT_SESSION_IDLE_TIMEOUT_MINUTES);

    invalidateSessionPolicyCache();
    baseDb.systemSettings.findFirst.mockImplementation(() => {
      throw new Error("sync failure");
    });
    expect(await getSessionIdleTimeoutMinutes()).toBe(DEFAULT_SESSION_IDLE_TIMEOUT_MINUTES);
  });

  it("caches the value so a burst of session checks reads the database once", async () => {
    baseDb.systemSettings.findFirst.mockResolvedValue({ sessionIdleTimeoutMinutes: 25 });
    expect(await getSessionIdleTimeoutMinutes()).toBe(25);
    expect(await getSessionIdleTimeoutMinutes()).toBe(25);
    expect(baseDb.systemSettings.findFirst).toHaveBeenCalledTimes(1);

    // Saving the setting invalidates the cache, so a new value applies at once.
    invalidateSessionPolicyCache();
    baseDb.systemSettings.findFirst.mockResolvedValue({ sessionIdleTimeoutMinutes: 5 });
    expect(await getSessionIdleTimeoutMinutes()).toBe(5);
  });

  it("uses the exact wording requested for a blocked sign-in", () => {
    expect(ALREADY_LOGGED_IN_ERROR).toBe(
      "The user is already logged in at another location. Please logout from the location before logging in to the system."
    );
  });
});

describe("email-code relogin switch", () => {
  it("is on by default, so a fresh install is not left without a way back in", async () => {
    baseDb.systemSettings.findFirst.mockResolvedValue(null);
    expect(await isSessionOtpTakeoverEnabled()).toBe(DEFAULT_SESSION_OTP_TAKEOVER_ENABLED);
    expect(await isSessionOtpTakeoverEnabled()).toBe(true);
  });

  it("reads the platform row, never a consultancy's own row", async () => {
    await isSessionOtpTakeoverEnabled();
    expect(baseDb.systemSettings.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { consultancyId: null } })
    );
  });

  it("honours a platform decision to switch it off", async () => {
    baseDb.systemSettings.findFirst.mockResolvedValue({ sessionOtpTakeoverEnabled: false });
    expect(await isSessionOtpTakeoverEnabled()).toBe(false);
  });

  it("treats a row that predates the column as on, not off", async () => {
    baseDb.systemSettings.findFirst.mockResolvedValue({ sessionOtpTakeoverEnabled: null });
    expect(await isSessionOtpTakeoverEnabled()).toBe(true);
  });

  it("keeps the built-in behaviour when the policy cannot be read", async () => {
    baseDb.systemSettings.findFirst.mockRejectedValue(new Error("db down"));
    expect(await isSessionOtpTakeoverEnabled()).toBe(DEFAULT_SESSION_OTP_TAKEOVER_ENABLED);
  });

  it("caches the flag and clears it together with the idle window", async () => {
    baseDb.systemSettings.findFirst.mockResolvedValue({ sessionOtpTakeoverEnabled: true });
    expect(await isSessionOtpTakeoverEnabled()).toBe(true);
    expect(await isSessionOtpTakeoverEnabled()).toBe(true);
    // Cached independently of the timeout, so the two reads do not stand in for
    // each other.
    expect(baseDb.systemSettings.findFirst).toHaveBeenCalledTimes(1);

    invalidateSessionPolicyCache();
    baseDb.systemSettings.findFirst.mockResolvedValue({ sessionOtpTakeoverEnabled: false });
    expect(await isSessionOtpTakeoverEnabled()).toBe(false);
  });
});

describe("sign-out notices", () => {
  it("tells an idle sign-out and a taken-over session apart", () => {
    expect(getSessionEndNotice(IDLE_LOGOUT_REASON)).toBe(IDLE_LOGOUT_MESSAGE);
    expect(getSessionEndNotice(REPLACED_LOGOUT_REASON)).toBe(REPLACED_LOGOUT_MESSAGE);
    expect(getSessionEndNotice("")).toBe("");
    expect(getSessionEndNotice(undefined)).toBe("");
    // An unrecognised flag must not invent a security event.
    expect(getSessionEndNotice("whatever")).toBe("");
  });
});
