"use client";

import { CheckCircle, Download, FileText, Image as ImageIcon, Upload, Video } from "lucide-react";
import { formatFileSize } from "./utils";
import type { MarketingMaterial } from "./types";

export default function RequestMaterials({
  materials,
  onDownload,
}: {
  materials: MarketingMaterial[];
  onDownload: (url: string, fileName: string) => void;
}) {
  return (
    <div className="mt-4 pt-4 border-t border-slate-200">
      <h4 className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
        <Upload size={16} /> Delivered Materials ({materials.length})
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {materials.map((material) => (
          <div
            key={material.id}
            className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3"
          >
            <div
              className={`p-2 rounded-lg ${
                material.fileType === "image"
                  ? "bg-emerald-100 text-emerald-600"
                  : material.fileType === "video"
                    ? "bg-purple-100 text-purple-600"
                    : "bg-slate-100 text-slate-600"
              }`}
            >
              {material.fileType === "image" && <ImageIcon size={18} />}
              {material.fileType === "video" && <Video size={18} />}
              {material.fileType === "document" && <FileText size={18} />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">{material.fileName}</p>
              <p className="text-xs text-slate-500">
                {formatFileSize(material.fileSize)} • {material.uploader.name}
              </p>
              {material.isFinal && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
                  <CheckCircle size={10} /> Final
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => onDownload(material.fileUrl, material.fileName)}
                className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                title="Download"
              >
                <Download size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
