"use client";

import { CheckCircle, Download, FileText, Trash2 } from "lucide-react";
import { formatFileSize } from "./formatters";
import type { DeliveredMaterialsProps } from "./types";

export default function DeliveredMaterials({
  materials,
  onDownload,
  onDelete,
}: DeliveredMaterialsProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
        <CheckCircle size={20} className="text-green-500" />
        Delivered Materials ({materials.length})
      </h2>

      {materials.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-slate-400">No materials uploaded yet. Upload the first file above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {materials.map((material) => (
            <div
              key={material.id}
              className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden"
            >
              {/* Preview */}
              <div className="aspect-video bg-slate-200 flex items-center justify-center">
                {material.fileType === "image" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={material.fileUrl}
                    alt={material.fileName}
                    className="w-full h-full object-contain"
                  />
                ) : material.fileType === "video" ? (
                  <video src={material.fileUrl} controls className="w-full h-full object-contain" />
                ) : (
                  <FileText size={48} className="text-slate-400" />
                )}
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {material.fileName}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatFileSize(material.fileSize)} • {material.uploader.name}
                    </p>
                    {material.description && (
                      <p className="text-xs text-slate-600 mt-1 break-words">
                        {material.description}
                      </p>
                    )}
                    {material.isFinal && (
                      <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
                        <CheckCircle size={10} /> Final version
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <button
                    aria-label="Download material"
                    onClick={() => onDownload(material.fileUrl, material.fileName)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-700 transition-colors"
                  >
                    <Download size={14} /> Download
                  </button>
                  <button
                    type="button"
                    aria-label="Delete material"
                    onClick={() => onDelete(material.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
