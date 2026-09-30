import ExcelJS from "exceljs";

export type SpreadsheetRow = Record<string, unknown>;

const XLSX_MIME = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

/**
 * Builds an XLSX file from data rows, or from a lone array of strings treated
 * as a header-only template. Returns a Blob suitable for a response body on
 * the server or an object URL download in the browser.
 */
export async function buildXlsx(
  sheetName: string,
  rows: (SpreadsheetRow | string[])[],
  columnWidths?: number[]
): Promise<Blob> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "UniTrack";
  const sheet = workbook.addWorksheet(sheetName);

  const headerOnly =
    rows.length === 1 &&
    Array.isArray(rows[0]) &&
    (rows[0] as unknown[]).every((cell) => typeof cell === "string");

  if (headerOnly) {
    sheet.addRow(rows[0] as string[]);
  } else {
    const dataRows = rows as SpreadsheetRow[];
    const headers: string[] = [];
    dataRows.forEach((row) => {
      Object.keys(row).forEach((key) => {
        if (!headers.includes(key)) headers.push(key);
      });
    });
    sheet.columns = headers.map((header) => ({ header, key: header }));
    dataRows.forEach((row) => sheet.addRow(row));
  }

  sheet.getRow(1).font = { bold: true };

  const widths = columnWidths ?? measureWidths(sheet);
  widths.forEach((width, i) => {
    if (sheet.getColumn(i + 1)) sheet.getColumn(i + 1).width = width;
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const bytes =
    buffer instanceof ArrayBuffer
      ? buffer
      : new Uint8Array(buffer as unknown as Uint8Array).slice().buffer;

  return new Blob([bytes], { type: XLSX_MIME });
}

function measureWidths(sheet: ExcelJS.Worksheet): number[] {
  const widths: number[] = [];
  sheet.eachRow({ includeEmpty: false }, (row) => {
    row.eachCell({ includeEmpty: false }, (cell, col) => {
      const length = String(cell.text ?? "").length + 2;
      widths[col - 1] = Math.max(widths[col - 1] ?? 10, Math.min(length, 60));
    });
  });
  return widths.length ? widths : [22];
}

/** Triggers a browser download for a generated spreadsheet. */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
