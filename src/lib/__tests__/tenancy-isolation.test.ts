/**
 * Tenancy isolation tests — extended coverage for the consultancy-scoping system.
 *
 * The guardrails that UNSCOPED_MODELS contains only the intended models are
 * already locked in hardening.test.ts. These additional tests verify the
 * behavioural contract of the consultancy context itself:
 *
 *   1. runWithConsultancy correctly isolates context across async calls
 *   2. getConsultancyId returns the expected id within each scope
 *   3. A null id (platform scope) is correctly returned
 *   4. No context (undefined) is correctly returned outside any scope
 *   5. Nested runWithConsultancy calls maintain correct inner/outer ids
 */

import { describe, it, expect } from "vitest";
import {
  runWithConsultancy,
  getConsultancyId,
  getConsultancyContext,
  UNSCOPED_MODELS,
} from "../consultancy";

describe("runWithConsultancy — context isolation", () => {
  it("returns undefined when called outside any consultancy context", () => {
    // There is no active context in a fresh test; the result must be undefined,
    // not null (which would mean "platform scope" was explicitly set).
    expect(getConsultancyId()).toBeUndefined();
    expect(getConsultancyContext()).toBeUndefined();
  });

  it("exposes the correct consultancyId inside a runWithConsultancy call", () => {
    runWithConsultancy({ consultancyId: 7 }, () => {
      expect(getConsultancyId()).toBe(7);
    });
  });

  it("exposes null consultancyId for platform scope", () => {
    runWithConsultancy({ consultancyId: null, isSuperAdmin: true }, () => {
      expect(getConsultancyId()).toBeNull();
      expect(getConsultancyContext()?.isSuperAdmin).toBe(true);
    });
  });

  it("does not leak context outside the callback", () => {
    runWithConsultancy({ consultancyId: 99 }, () => {
      expect(getConsultancyId()).toBe(99);
    });
    // After the callback completes the context should no longer be visible in
    // the *outer* scope. This relies on AsyncLocalStorage semantics.
    // Note: outside the `run()` callback the ALS reverts to whatever was active
    // before — in a test suite that is undefined (no context set).
    expect(getConsultancyId()).toBeUndefined();
  });

  it("isolates concurrent async consultancy contexts", async () => {
    // Two overlapping async operations must each see only their own id — this
    // would fail if we used enterWith() for both (shared mutation) instead of
    // run() (isolated sub-contexts).
    const results: (number | null | undefined)[] = [];

    await Promise.all([
      new Promise<void>((resolve) =>
        runWithConsultancy({ consultancyId: 1 }, async () => {
          await new Promise((r) => setTimeout(r, 5));
          results.push(getConsultancyId());
          resolve();
        })
      ),
      new Promise<void>((resolve) =>
        runWithConsultancy({ consultancyId: 2 }, async () => {
          await new Promise((r) => setTimeout(r, 2));
          results.push(getConsultancyId());
          resolve();
        })
      ),
    ]);

    // Both contexts must have been seen, neither should have bled into the other.
    expect(results).toContain(1);
    expect(results).toContain(2);
    expect(results).toHaveLength(2);
  });

  it("nested runWithConsultancy resolves the inner id inside and reverts outside", () => {
    runWithConsultancy({ consultancyId: 10 }, () => {
      expect(getConsultancyId()).toBe(10);

      runWithConsultancy({ consultancyId: 20 }, () => {
        // Inner scope takes over.
        expect(getConsultancyId()).toBe(20);
      });

      // Back in the outer run() callback — the inner run() should not have
      // mutated the outer context.
      // Note: AsyncLocalStorage.run() creates a child context; the outer store
      // is restored after the inner run() completes.
      expect(getConsultancyId()).toBe(10);
    });
  });
});

describe("UNSCOPED_MODELS integrity", () => {
  // Re-asserts the canonical set so any accidental widening in consultancy.ts
  // is caught even if the hardening.test.ts file is moved or renamed.
  it("contains exactly the four expected platform-level models", () => {
    const expected = ["CheckoutOrder", "Consultancy", "PasswordResetToken", "RateLimitLog"];
    expect([...UNSCOPED_MODELS].sort()).toEqual(expected.sort());
  });

  it("Student is not unscoped (tenant data must stay filtered)", () => {
    expect(UNSCOPED_MODELS.has("Student")).toBe(false);
  });

  it("Lead is not unscoped", () => {
    expect(UNSCOPED_MODELS.has("Lead")).toBe(false);
  });

  it("Application is not unscoped", () => {
    expect(UNSCOPED_MODELS.has("Application")).toBe(false);
  });

  it("Payment is not unscoped", () => {
    expect(UNSCOPED_MODELS.has("Payment")).toBe(false);
  });

  it("User is not unscoped", () => {
    expect(UNSCOPED_MODELS.has("User")).toBe(false);
  });

  it("File is not unscoped", () => {
    expect(UNSCOPED_MODELS.has("File")).toBe(false);
  });
});
