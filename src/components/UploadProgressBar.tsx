"use client";

import { formatBytes, type UploadProgress } from "@/lib/fetch-client";

export default function UploadProgressBar({
  fileName,
  progress,
}: {
  fileName?: string;
  progress: UploadProgress | null;
}) {
  if (!progress) return null;
  const total = progress.total || 0;
  const loaded = total > 0 ? Math.min(progress.loaded, total) : progress.loaded;
  const percent = total > 0 ? Math.min(100, Math.round((loaded / total) * 100)) : 0;

  return (
    <div className="w-full" role="status" aria-live="polite">
      {fileName && (
        <div className="mb-1.5 flex items-center justify-between gap-3">
          <span className="truncate text-xs font-medium text-slate-600">{fileName}</span>
          <span className="shrink-0 text-xs font-bold text-indigo-600">{percent}%</span>
        </div>
      )}
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-indigo-600 transition-[width] duration-200 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-400">
        <span>
          {formatBytes(loaded)} of {formatBytes(total)}
        </span>
        {!fileName && <span className="font-bold text-indigo-600">{percent}%</span>}
      </div>
    </div>
  );
}
