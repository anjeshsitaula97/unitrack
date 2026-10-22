import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";
import type { VisaChecklist } from "./types";
import { parseDescriptions } from "./utils";

export function generateChecklistPdf(
  checklists: VisaChecklist[],
  country: string,
  visaType: string
): Blob {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const pageW = doc.internal.pageSize.getWidth();
  const centerX = pageW / 2;

  // --- Consulate emblem (shield shape) ---
  const emblemY = 22;
  doc.setDrawColor(79, 70, 229);
  doc.setFillColor(79, 70, 229);
  // Shield outline
  doc.lines(
    [
      [0, 6],
      [-5, 0],
      [-3, -2],
      [0, -12],
      [3, -2],
      [5, 0],
      [3, 2],
      [0, 12],
      [-3, 2],
    ],
    centerX - 5,
    emblemY - 6,
    [1, 1],
    "F"
  );
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(country.charAt(0).toUpperCase(), centerX, emblemY + 1.5, { align: "center" });

  // --- Visa Type heading ---
  doc.setTextColor(31, 41, 55);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(visaType, centerX, 48, { align: "center" });

  // --- Subtitle ---
  doc.setTextColor(79, 70, 229);
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("Document Checklist", centerX, 57, { align: "center" });

  // --- Decorative line ---
  doc.setDrawColor(79, 70, 229);
  doc.setLineWidth(0.5);
  doc.line(centerX - 20, 62, centerX + 20, 62);

  // --- Paragraph break / introductory text ---
  doc.setTextColor(107, 114, 128);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(
    "Below is the complete list of documents required for the above visa type.",
    centerX,
    74,
    { align: "center" }
  );

  // --- Two-column table: Document | Requirements ---
  const bodyRows = checklists.map((item) => {
    const descs = parseDescriptions(item.description);
    return [item.title, descs.length > 0 ? descs.map((d) => `• ${d}`).join("\n") : "—"];
  });

  autoTable(doc, {
    startY: 82,
    head: [["Document", "Requirements"]],
    body: bodyRows,
    headStyles: {
      fillColor: [79, 70, 229],
      textColor: 255,
      fontStyle: "bold",
      fontSize: 10,
      halign: "center",
    },
    bodyStyles: { fontSize: 9, textColor: [55, 65, 81] },
    alternateRowStyles: { fillColor: [245, 247, 250] },
    columnStyles: {
      0: { cellWidth: 52, cellPadding: 4, fontStyle: "bold" },
      1: { cellWidth: "auto", cellPadding: 4 },
    },
    margin: { left: 14, right: 14 },
    didDrawPage: (_data) => {
      const pageCount = doc.getNumberOfPages();
      doc.setFontSize(8);
      doc.setTextColor(156, 163, 175);
      doc.setFont("helvetica", "normal");
      doc.text(`Page ${pageCount}`, pageW / 2, 292, { align: "center" });
      doc.text("UniTrack — Visa Document Checklist", pageW / 2, 284, { align: "center" });
    },
  });

  return doc.output("blob");
}
