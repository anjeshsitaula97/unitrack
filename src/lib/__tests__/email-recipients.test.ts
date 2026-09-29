import { describe, it, expect } from "vitest";
import { normalizeRecipients } from "../email-recipients";

describe("normalizeRecipients", () => {
  it("passes a plain string through", () => {
    expect(normalizeRecipients("a@b.com")).toEqual(["a@b.com"]);
  });

  it("keeps a flat list", () => {
    expect(normalizeRecipients(["a@b.com", "c@d.com"])).toEqual(["a@b.com", "c@d.com"]);
  });

  it("trims and drops blanks", () => {
    expect(normalizeRecipients(["  a@b.com ", "", "   ", "c@d.com"])).toEqual([
      "a@b.com",
      "c@d.com",
    ]);
  });

  it("de-duplicates", () => {
    expect(normalizeRecipients(["a@b.com", "a@b.com"])).toEqual(["a@b.com"]);
  });

  it("flattens shallow nesting", () => {
    expect(normalizeRecipients([["a@b.com", "c@d.com"], "e@f.com"])).toEqual([
      "a@b.com",
      "c@d.com",
      "e@f.com",
    ]);
  });

  it("survives deeply nested arrays without stack exhaustion", () => {
    let nested: unknown = "victim@example.test";
    for (let i = 0; i < 5000; i++) nested = [nested];
    expect(() => normalizeRecipients(nested)).not.toThrow();
    expect(normalizeRecipients(nested)).toEqual([]);
  });

  it("ignores non-string entries", () => {
    expect(normalizeRecipients([123, null, { a: 1 }, "a@b.com"])).toEqual(["a@b.com"]);
  });

  it("caps the recipient count", () => {
    const many = Array.from({ length: 500 }, (_, i) => `user${i}@example.com`);
    expect(normalizeRecipients(many).length).toBeLessThanOrEqual(100);
  });

  it("handles cyclic arrays", () => {
    const cyclic: unknown[] = ["a@b.com"];
    cyclic.push(cyclic);
    expect(() => normalizeRecipients(cyclic)).not.toThrow();
  });
});
