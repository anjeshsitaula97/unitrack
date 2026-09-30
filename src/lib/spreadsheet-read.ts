import { Readable } from "node:stream";

import ExcelJS from "exceljs";

import type { SpreadsheetRow } from "@/lib/spreadsheet";

function normalizeCell(value: unknown): string | number | boolean | null {
  if (value === null || value === undefined) return null;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === "object") {
    // Rich text and formula cells arrive as objects; flatten to plain text.
    const candidate = value as {
      text?: string;
      result?: unknown;
      richText?: { text: string }[];
    };
    if (Array.isArray(candidate.richText)) {
      return candidate.richText.map((part) => part.text).join("");
    }
    if (candidate.result !== undefined) return normalizeCell(candidate.result);
    if (typeof candidate.text === "string") return candidate.text;
    return String(value);
  }
  return value as string | number | boolean;
}

/**
 * Reads the first worksheet of an XLSX or CSV file into plain objects keyed by
 * the header row. `maxRows` is enforced while iterating, so an oversized file
 * is rejected without materializing every row first.
 *
 * Server-only: the CSV reader needs a Node stream, which cannot be bundled for
 * the browser.
 */
export async function readSpreadsheetRows(
  input: ArrayBuffer | Buffer,
  filename: string,
  maxRows: number
): Promise<SpreadsheetRow[]> {
  const workbook = new ExcelJS.Workbook();
  const bytes = Buffer.isBuffer(input)
    ? new Uint8Array(input).slice().buffer
    : (input as ArrayBuffer);

  if (/\.csv$/i.test(filename)) {
    // The CSV reader only accepts a stream, so wrap the buffer in one.
    await (
      workbook.csv as unknown as {
        read: (stream: Readable) => Promise<unknown>;
      }
    ).read(Readable.from(Buffer.from(bytes)));
  } else {
    // Only plain values are needed, so skip validation payloads entirely.
    await workbook.xlsx.load(bytes as ArrayBuffer, {
      ignoreNodes: ["dataValidations"],
    });
  }

  const sheet = workbook.worksheets[0];
  if (!sheet) return [];

  const rows: SpreadsheetRow[] = [];
  const header: string[] = [];
  let headerRead = false;

  sheet.eachRow({ includeEmpty: false }, (row) => {
    if (rows.length > maxRows) return;

    // ExcelJS indexes `values` from 1; drop the empty leading slot.
    const cells = (row.values as unknown[]).slice(1).map(normalizeCell);

    if (!headerRead) {
      cells.forEach((cell, i) => {
        header[i] = cell === null || cell === "" ? `column${i + 1}` : String(cell);
      });
      headerRead = true;
      return;
    }

    const record: SpreadsheetRow = {};
    cells.forEach((cell, i) => {
      if (i < header.length) record[header[i]] = cell;
    });
    rows.push(record);
  });

  return rows;
}
