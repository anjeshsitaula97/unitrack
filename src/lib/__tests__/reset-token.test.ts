import { describe, it, expect } from "vitest";
import {
  createResetToken,
  hashResetToken,
  isResetTokenFormat,
  timingSafeEqualDigest,
} from "../reset-token";

describe("reset-token", () => {
  it("produces a 64-hex reset token", () => {
    const { token, hash } = createResetToken();
    expect(token).toMatch(/^[0-9a-f]{64}$/);
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it("never stores the token itself", () => {
    const { token, hash } = createResetToken();
    expect(hash).not.toBe(token);
    expect(hash).toBe(hashResetToken(token));
  });

  it("mints a different token every time", () => {
    expect(createResetToken().token).not.toBe(createResetToken().token);
  });

  it("is deterministic for the same input", () => {
    expect(hashResetToken("abc")).toBe(hashResetToken("abc"));
    expect(hashResetToken("abc")).not.toBe(hashResetToken("abd"));
  });

  it("rejects values that are not 64-hex reset tokens", () => {
    expect(isResetTokenFormat("a".repeat(64))).toBe(true);
    expect(isResetTokenFormat("A".repeat(64))).toBe(true);
    expect(isResetTokenFormat("123456")).toBe(false);
    expect(isResetTokenFormat("a".repeat(63))).toBe(false);
    expect(isResetTokenFormat("z".repeat(64))).toBe(false);
    expect(isResetTokenFormat(undefined)).toBe(false);
    expect(isResetTokenFormat(null)).toBe(false);
    expect(isResetTokenFormat(123)).toBe(false);
  });

  it("compares digests in constant time without throwing on length mismatch", () => {
    expect(timingSafeEqualDigest("abc", "abc")).toBe(true);
    expect(timingSafeEqualDigest("abc", "abd")).toBe(false);
    expect(timingSafeEqualDigest("abc", "abcd")).toBe(false);
    expect(timingSafeEqualDigest("", "")).toBe(true);
  });
});
