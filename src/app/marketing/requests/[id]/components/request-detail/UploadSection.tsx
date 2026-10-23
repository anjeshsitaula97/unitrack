"use client";

import { FileText, Image as ImageIcon, Loader2, Upload, Video, XCircle } from "lucide-react";
import { formatFileSize } from "./formatters";
import type { UploadSectionProps } from "./types";

export default function UploadSection({
  uploading,
  dragActive,
  selectedFile,
  materialDescription,
  isFinal,
  setDragActive,
  setSelectedFile,
  setMaterialDescription,
  setIsFinal,
  handleUpload,
}: UploadSectionProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
        <Upload size={20} className="text-indigo-600" />
        Upload Completed Work
      </h2>

      {/* Drag & drop area */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          const file = e.dataTransfer.files[0];
          if (file) setSelectedFile(file);
        }}
        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors ${
          dragActive ? "border-indigo-500 bg-indigo-50" : "border-slate-300 hover:border-indigo-400"
        }`}
      >
        <input
          type="file"
          id="material-upload"
          aria-label="Upload material file"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) setSelectedFile(file);
          }}
        />
        {selectedFile ? (
          <div className="flex items-center justify-center gap-4">
            <div className="p-3 bg-indigo-100 rounded-lg text-indigo-600">
              {selectedFile.type.startsWith("image/") ? (
                <ImageIcon size={24} />
              ) : selectedFile.type.startsWith("video/") ? (
                <Video size={24} />
              ) : (
                <FileText size={24} />
              )}
            </div>
            <div className="text-left">
              <p className="font-medium text-slate-900">{selectedFile.name}</p>
              <p className="text-sm text-slate-500">{formatFileSize(selectedFile.size)}</p>
            </div>
            <button
              aria-label="Remove selected file"
              onClick={() => setSelectedFile(null)}
              className="p-2 text-slate-400 hover:text-red-600"
            >
              <XCircle size={20} />
            </button>
          </div>
        ) : (
          <>
            <Upload size={32} className="text-slate-400 mx-auto mb-3" />
            <p className="text-slate-600 font-medium mb-1">Drag and drop your file here, or</p>
            <button
              onClick={() => document.getElementById("material-upload")?.click()}
              className="text-indigo-600 font-medium hover:underline"
            >
              browse files
            </button>
            <p className="mt-2 text-xs text-slate-400">
              Images (PNG, JPG, SVG), Videos (MP4, MOV), Documents (PDF, PSD)
            </p>
          </>
        )}
      </div>

      {/* Upload options */}
      <div className="mt-4 space-y-3">
        <input
          aria-label="Add a description (optional)"
          type="text"
          value={materialDescription}
          onChange={(e) => setMaterialDescription(e.target.value)}
          placeholder="Add a description (optional)"
          className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
        />
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={isFinal}
            onChange={(e) => setIsFinal(e.target.checked)}
            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          Mark as final version
        </label>
        <button
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {uploading ? (
            <>
              <Loader2 className="animate-spin" size={16} /> Uploading...
            </>
          ) : (
            <>
              <Upload size={16} /> Upload Material
            </>
          )}
        </button>
      </div>
    </div>
  );
}
