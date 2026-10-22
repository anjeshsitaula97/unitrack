"use client";

import { Download, X } from "lucide-react";
import type { VisaWorkflowController } from "./useVisaWorkflow";

export default function PdfPreviewModal({
  workflow,
  pdfPreviewUrl,
}: {
  workflow: VisaWorkflowController;
  pdfPreviewUrl: string;
}) {
  const { country, visaType, closePdfPreview } = workflow;

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
      <button
        aria-label="Close PDF preview"
        type="button"
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
        onClick={closePdfPreview}
      />
      <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden animate-slide-up flex flex-col">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-lg font-black text-slate-800">Checklist Preview</h2>
            <p className="text-xs text-slate-500">
              {country} — {visaType}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={pdfPreviewUrl}
              download={`${country.replace(/\s+/g, "_")}_${visaType.replace(/\s+/g, "_")}_Checklist.pdf`}
              className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-[color,background-color,border-color,box-shadow,transform,opacity] flex items-center gap-2 text-sm"
            >
              <Download size={15} /> Download
            </a>
            <button
              aria-label="Close PDF preview"
              type="button"
              onClick={closePdfPreview}
              className="p-2.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-[color,background-color,border-color,box-shadow,transform,opacity]"
            >
              <X size={18} />
            </button>
          </div>
        </div>
        <div className="flex-1 min-h-0">
          <iframe
            src={pdfPreviewUrl}
            className="w-full h-full min-h-[70vh]"
            title="Checklist PDF Preview"
            sandbox="allow-scripts allow-popups allow-forms"
          />
        </div>
      </div>
    </div>
  );
}
