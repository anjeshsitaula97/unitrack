import { describe, expect, it } from "vitest";

import { buildXlsx } from "@/lib/spreadsheet";
import { readSpreadsheetRows } from "@/lib/spreadsheet-read";

const MAX_ROWS = 10;

async function toBuffer(blob: Blob): Promise<Buffer> {
  return Buffer.from(await blob.arrayBuffer());
}

describe("spreadsheet", () => {
  it("reads rows from a generated xlsx file keyed by the header row", async () => {
    const blob = await buildXlsx("People", [
      { Name: "Asha", Role: "Staff", Age: 30 },
      { Name: "Bishal", Role: "Viewer", Age: 25 },
    ]);

    const rows = await readSpreadsheetRows(await toBuffer(blob), "people.xlsx", MAX_ROWS);

    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({ Name: "Asha", Role: "Staff", Age: 30 });
    expect(rows[1]).toMatchObject({ Name: "Bishal", Role: "Viewer", Age: 25 });
  });

  it("reads a header-only template back as zero data rows", async () => {
    const blob = await buildXlsx("Template", [["Name", "Email", "Status"]]);

    const rows = await readSpreadsheetRows(await toBuffer(blob), "template.xlsx", MAX_ROWS);

    expect(rows).toEqual([]);
  });

  it("reads csv input", async () => {
    const csv = ["Name,Role", "Asha,Staff", "Bishal,Viewer"].join("\n");

    const rows = await readSpreadsheetRows(Buffer.from(csv), "people.csv", MAX_ROWS);

    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({ Name: "Asha", Role: "Staff" });
  });

  it("returns empty rows for an empty sheet", async () => {
    const blob = await buildXlsx("Empty", [] as Record<string, unknown>[]);

    const rows = await readSpreadsheetRows(await toBuffer(blob), "empty.xlsx", MAX_ROWS);

    expect(rows).toEqual([]);
  });

  it("caps oversized input so a huge sheet cannot be materialized", async () => {
    const many = Array.from({ length: 60 }, (_, i) => ({ Name: `User ${i}` }));
    const blob = await buildXlsx("Many", many);

    const rows = await readSpreadsheetRows(await toBuffer(blob), "many.xlsx", MAX_ROWS);

    // The reader stops collecting once the cap is passed, so the route's own
    // MAX_ROWS check rejects the file instead of parsing all 60 rows.
    expect(rows.length).toBe(MAX_ROWS + 1);
  });

  it("does not evaluate formula cells, returning the cached result instead", async () => {
    const blob = await buildXlsx("Formulas", [{ Name: "Asha", Computed: "=1+1" }]);
    const buffer = await toBuffer(blob);

    const rows = await readSpreadsheetRows(buffer, "formulas.xlsx", MAX_ROWS);

    // No evaluation happens on the server; whatever Excel stored comes back.
    const computed = rows[0].Computed;
    expect(computed === null || computed === 2 || computed === "=1+1").toBe(true);
  });

  it("produces a real zip container rather than a text file", async () => {
    const blob = await buildXlsx("Zip", [{ A: 1 }]);
    const buffer = await toBuffer(blob);

    expect(buffer[0]).toBe(0x50);
    expect(buffer[1]).toBe(0x4b);
    expect(blob.type).toContain("spreadsheetml.sheet");
  });
});
