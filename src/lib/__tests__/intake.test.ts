import { describe, it, expect } from "vitest";
import { parseIntakes, serializeIntakes, formatIntakeLabel, getIntakeStatus } from "../intake";

/**
 * Intake parsing.
 *
 * The `intake` column has accumulated several historical shapes, and a bug
 * once persisted a corrupted "spread a string into an object" payload. These
 * tests pin the normalising behaviour so the UI never renders raw JSON.
 */

describe("parseIntakes", () => {
  it("returns an empty list for empty input", () => {
    expect(parseIntakes(null)).toEqual([]);
    expect(parseIntakes(undefined)).toEqual([]);
    expect(parseIntakes("")).toEqual([]);
    expect(parseIntakes("   ")).toEqual([]);
    expect(parseIntakes("[]")).toEqual([]);
  });

  it("parses the current array-of-objects format", () => {
    const raw = JSON.stringify([
      {
        name: "Spring 2026",
        openDate: "2026-01-01",
        deadline: "2026-03-01",
        startDate: "2026-04-01",
      },
      {
        name: "Autumn 2026",
        openDate: "2026-05-01",
        deadline: "2026-07-01",
        startDate: "2026-08-01",
      },
    ]);

    expect(parseIntakes(raw)).toEqual([
      {
        name: "Spring 2026",
        openDate: "2026-01-01",
        deadline: "2026-03-01",
        startDate: "2026-04-01",
      },
      {
        name: "Autumn 2026",
        openDate: "2026-05-01",
        deadline: "2026-07-01",
        startDate: "2026-08-01",
      },
    ]);
  });

  it("parses a legacy array of plain names", () => {
    expect(parseIntakes('["Spring 2026","Autumn 2026"]')).toEqual([
      { name: "Spring 2026", openDate: "", deadline: "", startDate: "" },
      { name: "Autumn 2026", openDate: "", deadline: "", startDate: "" },
    ]);
  });

  it("parses a legacy single name", () => {
    expect(parseIntakes("Spring 2026")).toEqual([
      { name: "Spring 2026", openDate: "", deadline: "", startDate: "" },
    ]);
  });

  it("parses a legacy comma-separated list", () => {
    expect(parseIntakes("Spring 2026, Autumn 2026")).toEqual([
      { name: "Spring 2026", openDate: "", deadline: "", startDate: "" },
      { name: "Autumn 2026", openDate: "", deadline: "", startDate: "" },
    ]);
  });

  it("unwraps a double-encoded JSON string", () => {
    const inner = JSON.stringify([{ name: "Spring 2026", openDate: "", deadline: "" }]);
    const double = JSON.stringify(inner);

    expect(parseIntakes(double)).toEqual([
      { name: "Spring 2026", openDate: "", deadline: "", startDate: "" },
    ]);
  });

  it("discards the corrupted index-keyed payload instead of rendering it", () => {
    // What a string spread with {...value} and re-serialised looks like.
    const corrupted = JSON.stringify([
      { 0: "[", 1: "{", 2: String.fromCharCode(34), 3: "0" },
      { 0: "[", 1: "{", 2: String.fromCharCode(34), 3: "0" },
    ]);

    expect(parseIntakes(corrupted)).toEqual([]);
  });

  it("drops unusable entries but keeps the good ones", () => {
    const raw = JSON.stringify([
      { name: "Spring 2026", openDate: "", deadline: "" },
      null,
      42,
      { 0: "[", 1: "{" },
      { openDate: "2026-01-01", deadline: "2026-03-01" },
    ]);

    expect(parseIntakes(raw)).toEqual([
      { name: "Spring 2026", openDate: "", deadline: "", startDate: "" },
    ]);
  });

  it("never throws on malformed JSON", () => {
    expect(() => parseIntakes("[{not json")).not.toThrow();
    expect(parseIntakes("[{not json")).toEqual([]);
  });

  it("accepts an already-parsed array", () => {
    expect(parseIntakes([{ name: "Spring 2026" }])).toEqual([
      { name: "Spring 2026", openDate: "", deadline: "", startDate: "" },
    ]);
  });

  it("keeps an explicitly empty openDate empty instead of borrowing startDate", () => {
    expect(
      parseIntakes([{ name: "October 2027", startDate: "2026-10-01", openDate: "", deadline: "" }])
    ).toEqual([{ name: "October 2027", openDate: "", deadline: "", startDate: "2026-10-01" }]);
  });

  it("falls back to startDate when no openDate key exists", () => {
    expect(parseIntakes([{ name: "October 2027", startDate: "2026-10-01" }])).toEqual([
      { name: "October 2027", openDate: "2026-10-01", deadline: "", startDate: "2026-10-01" },
    ]);
  });
});

describe("serializeIntakes", () => {
  it("round-trips through parseIntakes", () => {
    const entries = [
      { name: "Spring 2026", openDate: "2026-01-01", deadline: "2026-03-01", startDate: "" },
    ];
    expect(parseIntakes(serializeIntakes(entries))).toEqual(entries);
  });

  it("normalises missing dates to empty strings", () => {
    const raw = serializeIntakes([{ name: "  Spring 2026  ", openDate: "", deadline: "" }]);
    expect(JSON.parse(raw)).toEqual([
      { name: "Spring 2026", openDate: "", deadline: "", startDate: "" },
    ]);
  });
});

describe("getIntakeStatus", () => {
  const now = new Date("2026-06-15");

  it("reports Upcoming before the open date", () => {
    expect(getIntakeStatus({ openDate: "2026-07-01", deadline: "2026-09-01" }, now)?.label).toBe(
      "Upcoming"
    );
  });

  it("reports Open between the open date and the deadline", () => {
    expect(getIntakeStatus({ openDate: "2026-05-01", deadline: "2026-07-01" }, now)?.label).toBe(
      "Open"
    );
  });

  it("reports Closed after the deadline", () => {
    expect(getIntakeStatus({ openDate: "2026-01-01", deadline: "2026-03-01" }, now)?.label).toBe(
      "Closed"
    );
  });

  it("returns null when the dates are missing", () => {
    expect(getIntakeStatus({ openDate: "", deadline: "" }, now)).toBeNull();
    expect(getIntakeStatus({ openDate: "nope", deadline: "nope" }, now)).toBeNull();
  });
});

describe("formatIntakeLabel", () => {
  it("shows TBA when there is nothing to show", () => {
    expect(formatIntakeLabel(null)).toBe("TBA");
    expect(formatIntakeLabel("[]")).toBe("TBA");
    expect(formatIntakeLabel(JSON.stringify([{ 0: "[", 1: "{" }]))).toBe("TBA");
  });

  it("shows the open intake with an (Open) suffix", () => {
    const raw = JSON.stringify([
      { name: "Spring 2026", openDate: "2026-01-01", deadline: "2026-03-01" },
      { name: "Autumn 2026", openDate: "2026-05-01", deadline: "2026-07-01" },
    ]);
    expect(formatIntakeLabel(raw, new Date("2026-06-15"))).toBe("Autumn 2026 (Open)");
  });

  it("shows the first intake plus a count when none is open", () => {
    const raw = JSON.stringify([
      { name: "Spring 2026", openDate: "2026-01-01", deadline: "2026-03-01" },
      { name: "Autumn 2026", openDate: "2026-05-01", deadline: "2026-07-01" },
    ]);
    expect(formatIntakeLabel(raw, new Date("2026-10-01"))).toBe("Spring 2026 (+1)");
  });

  it("shows a legacy name as-is", () => {
    expect(formatIntakeLabel("Spring 2026")).toBe("Spring 2026");
  });
});
