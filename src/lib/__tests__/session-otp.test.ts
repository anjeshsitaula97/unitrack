import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

/**
 * In-memory stand-in for `SessionOtpToken`.
 *
 * The rules worth testing here — one live code per address, a 30-second resend
 * gap, five guesses, two-minute expiry, single use — are all about how rows move
 * over time, so the fake keeps real rows and lets the tests move the clock.
 */
/** Either "this address" or "everything that has run out", as the library uses it. */
type OtpWhere = {
  subject?: string;
  email?: string;
  expiresAt?: { lt: Date };
};

/** The stored columns a test reads back, so assertions name the schema. */
type StoredRow = {
  subject: string;
  email: string;
  tokenHash: string;
  attempts: number;
  expiresAt: Date;
  createdAt: Date;
};

const state = vi.hoisted(() => ({
  rows: [] as Array<Record<string, unknown>>,
  nextId: 1,
}));

vi.mock("../base-db", () => ({
  baseDb: {
    sessionOtpToken: {
      findFirst: vi.fn(async ({ where }: { where: { subject: string; email: string } }) => {
        const matches = state.rows.filter(
          (r) => r.subject === where.subject && r.email === where.email
        );
        return matches.length ? matches[matches.length - 1] : null;
      }),
      create: vi.fn(async ({ data }: { data: Record<string, unknown> }) => {
        const row = { id: state.nextId++, attempts: 0, createdAt: new Date(), ...data };
        state.rows.push(row);
        return row;
      }),
      update: vi.fn(
        async ({ where, data }: { where: { id: number }; data: Record<string, unknown> }) => {
          const row = state.rows.find((r) => r.id === where.id);
          if (row) Object.assign(row, data);
          return row;
        }
      ),
      deleteMany: vi.fn(async ({ where }: { where: OtpWhere }) => {
        const before = state.rows.length;
        state.rows = state.rows.filter((r) => {
          if (where.subject !== undefined && r.subject !== where.subject) return true;
          if (where.email !== undefined && r.email !== where.email) return true;
          const lt = where.expiresAt?.lt;
          if (lt) return new Date(r.expiresAt as Date).getTime() >= lt.getTime();
          return false;
        });
        return { count: before - state.rows.length };
      }),
    },
  },
}));

// The switch that gates the whole feature, and the fixed refusal wording.
const policy = vi.hoisted(() => ({ takeoverEnabled: true }));
vi.mock("../session-policy", () => ({
  ALREADY_LOGGED_IN_ERROR:
    "The user is already logged in at another location. Please logout from the location before logging in to the system.",
  isSessionOtpTakeoverEnabled: () => Promise.resolve(policy.takeoverEnabled),
}));

import {
  issueSessionOtp,
  verifySessionOtp,
  consumeSessionOtps,
  maskEmail,
  sessionBlockedPayload,
  SESSION_OTP_TTL_MS,
  SESSION_OTP_MAX_ATTEMPTS,
  SESSION_OTP_RESEND_COOLDOWN_MS,
} from "../session-otp";

/**
 * Ownership codes for reclaiming a session that is stuck at another location.
 *
 * The code is the difference between "somebody knows this password" and
 * "somebody owns this account", so the properties that matter are that it is
 * short-lived, single-use, guess-capped, stored as a digest and never able to
 * become anything else — which is why it lives in its own table instead of the
 * password-reset one.
 */

const NOW = new Date("2026-10-24T10:00:00.000Z");

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
  state.rows = [];
  state.nextId = 1;
  policy.takeoverEnabled = true;
});

afterEach(() => {
  vi.useRealTimers();
});

const issue = (email = "staff@example.com") => issueSessionOtp({ subject: "user", email });

describe("issuing a session code", () => {
  it("returns a 6-digit code that lasts two minutes and stores only its digest", async () => {
    const issued = await issue();
    expect(issued.ok).toBe(true);
    if (!issued.ok) return;

    expect(issued.otp).toMatch(/^\d{6}$/);
    expect(issued.ttlSeconds).toBe(SESSION_OTP_TTL_MS / 1000);
    expect(new Date(issued.expiresAt).getTime() - NOW.getTime()).toBe(SESSION_OTP_TTL_MS);

    expect(state.rows).toHaveLength(1);
    const row = state.rows[0] as StoredRow;
    // The plaintext never reaches the database.
    expect(row.tokenHash).not.toContain(issued.otp);
    expect(row.tokenHash).toMatch(/^[0-9a-f]{64}$/);
    expect(row.attempts).toBe(0);
    expect(row.subject).toBe("user");
  });

  it("normalises the address so a differently-cased lookup still finds the code", async () => {
    const issued = await issueSessionOtp({ subject: "user", email: " Staff@Example.COM " });
    expect(issued.ok).toBe(true);
    expect(state.rows[0].email).toBe("staff@example.com");

    const verified = await verifySessionOtp({
      subject: "user",
      email: "STAFF@example.com",
      otp: issued.ok ? issued.otp : "",
    });
    expect(verified.ok).toBe(true);
  });

  it("leaves only the newest code spendable", async () => {
    const first = await issue();
    vi.advanceTimersByTime(SESSION_OTP_RESEND_COOLDOWN_MS + 1000);
    const second = await issue();
    expect(second.ok).toBe(true);
    // One live code per address, otherwise two codes would be guessable at once.
    expect(state.rows).toHaveLength(1);

    const stale = await verifySessionOtp({
      subject: "user",
      email: "staff@example.com",
      otp: first.ok ? first.otp : "",
    });
    expect(stale.ok).toBe(false);
    if (!stale.ok) expect(stale.failure).toBe("INVALID");
  });

  it("refuses a second send inside the resend cooldown", async () => {
    await issue();
    const again = await issue();
    expect(again.ok).toBe(false);
    if (again.ok) return;
    expect(again.failure).toBe("RESEND_TOO_FAST");
    expect(again.error).toMatch(/\d+ second/);
    // Still exactly one row, and the cooldown did not overwrite it.
    expect(state.rows).toHaveLength(1);
  });
});

describe("verifying a session code", () => {
  it("accepts the right code and spends it", async () => {
    const issued = await issue();
    if (!issued.ok) throw new Error("issue failed");

    const verified = await verifySessionOtp({
      subject: "user",
      email: "staff@example.com",
      otp: issued.otp,
    });
    expect(verified.ok).toBe(true);
    expect(state.rows).toHaveLength(0);

    // Replaying the same request cannot log anybody in twice.
    const replay = await verifySessionOtp({
      subject: "user",
      email: "staff@example.com",
      otp: issued.otp,
    });
    expect(replay.ok).toBe(false);
    if (!replay.ok) expect(replay.failure).toBe("NOT_FOUND");
  });

  it("counts each wrong guess down and never past the cap", async () => {
    const issued = await issue();
    if (!issued.ok) throw new Error("issue failed");
    const wrong = issued.otp === "100000" ? "100001" : "100000";

    for (let attempt = 1; attempt <= SESSION_OTP_MAX_ATTEMPTS; attempt++) {
      const result = await verifySessionOtp({
        subject: "user",
        email: "staff@example.com",
        otp: wrong,
      });
      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.failure).toBe("INVALID");
      expect(result.attemptsLeft).toBe(SESSION_OTP_MAX_ATTEMPTS - attempt);
    }

    // The code is dead now, and it takes its row with it.
    const locked = await verifySessionOtp({
      subject: "user",
      email: "staff@example.com",
      otp: issued.otp,
    });
    expect(locked.ok).toBe(false);
    if (!locked.ok) expect(locked.failure).toBe("TOO_MANY_ATTEMPTS");
    expect(state.rows).toHaveLength(0);
  });

  it("rejects an expired code and clears it", async () => {
    const issued = await issue();
    if (!issued.ok) throw new Error("issue failed");
    vi.advanceTimersByTime(SESSION_OTP_TTL_MS + 1000);

    const result = await verifySessionOtp({
      subject: "user",
      email: "staff@example.com",
      otp: issued.otp,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.failure).toBe("EXPIRED");
    expect(state.rows).toHaveLength(0);
  });

  it("has nothing to verify for an address that never asked", async () => {
    const result = await verifySessionOtp({
      subject: "student",
      email: "student@example.com",
      otp: "123456",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.failure).toBe("NOT_FOUND");
  });

  it("keeps a student code and a staff code apart", async () => {
    const issued = await issueSessionOtp({ subject: "student", email: "same@example.com" });
    if (!issued.ok) throw new Error("issue failed");

    const asStaff = await verifySessionOtp({
      subject: "user",
      email: "same@example.com",
      otp: issued.otp,
    });
    expect(asStaff.ok).toBe(false);
    if (!asStaff.ok) expect(asStaff.failure).toBe("NOT_FOUND");

    const asStudent = await verifySessionOtp({
      subject: "student",
      email: "same@example.com",
      otp: issued.otp,
    });
    expect(asStudent.ok).toBe(true);
  });
});

describe("consumeSessionOtps", () => {
  it("drops only this subject and address", async () => {
    await issueSessionOtp({ subject: "user", email: "staff@example.com" });
    await issueSessionOtp({ subject: "student", email: "student@example.com" });

    await consumeSessionOtps("user", " STAFF@example.com ");
    expect(state.rows).toHaveLength(1);
    expect((state.rows[0] as StoredRow).subject).toBe("student");
  });
});

describe("maskEmail", () => {
  it("keeps the domain and hides the rest of the address", () => {
    const masked = maskEmail("avencil@Example.com");
    expect(masked.startsWith("a")).toBe(true);
    expect(masked.endsWith("@Example.com")).toBe(true);
    expect(masked).not.toContain("vencil");
  });

  it("still masks a local part too short to hide much", () => {
    expect(maskEmail("a@b.com")).toBe("a•••@b.com");
  });

  it("returns an empty string for nothing and degrades for a malformed address", () => {
    expect(maskEmail("")).toBe("");
    expect(maskEmail("nosuchaddress")).toBe("n•••");
  });
});

describe("sessionBlockedPayload", () => {
  const otherSession = {
    activeSessionId: "sid-1",
    lastSeenAt: NOW.getTime(),
    ip: "10.0.0.9",
    userAgent: "Mozilla/5.0 (Windows NT 10.0)",
  };

  it("refuses with the fixed wording and offers the code route", async () => {
    const payload = await sessionBlockedPayload("staff@example.com", otherSession);
    expect(payload.code).toBe("SESSION_ACTIVE_ELSEWHERE");
    expect(payload.error).toBe(
      "The user is already logged in at another location. Please logout from the location before logging in to the system."
    );
    expect(payload.session).toEqual({
      ip: "10.0.0.9",
      userAgent: "Mozilla/5.0 (Windows NT 10.0)",
      lastSeenAt: NOW.getTime(),
    });
    expect(payload.relogin).toEqual({
      otpEnabled: true,
      maskedEmail: maskEmail("staff@example.com"),
      otpSeconds: SESSION_OTP_TTL_MS / 1000,
      maxAttempts: SESSION_OTP_MAX_ATTEMPTS,
      resendSeconds: SESSION_OTP_RESEND_COOLDOWN_MS / 1000,
    });
  });

  it("offers nothing when the platform has switched codes off", async () => {
    policy.takeoverEnabled = false;
    const payload = await sessionBlockedPayload("staff@example.com", otherSession);
    expect(payload.relogin.otpEnabled).toBe(false);
    // No address echoed for a route that does not exist.
    expect(payload.relogin.maskedEmail).toBe("");
    // The refusal itself is unchanged: switching the relief off must not make
    // the rule look like it went away.
    expect(payload.error).toContain("already logged in at another location");
  });

  it("copes with an account whose session has no recorded location", async () => {
    const payload = await sessionBlockedPayload("staff@example.com", null);
    expect(payload.session).toEqual({ ip: null, userAgent: null, lastSeenAt: null });
  });
});
