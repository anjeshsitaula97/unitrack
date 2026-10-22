import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({
  page,
  perPage,
  total,
  totalPages,
  onPrev,
  onNext,
  noun,
  padding = "px-5",
}: {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
  noun?: string;
  padding?: string;
}) {
  return (
    <div className={`${padding} py-3 border-t border-slate-100 flex items-center justify-between`}>
      <p className="text-xs text-slate-500">
        Showing {(page - 1) * perPage + 1} to {Math.min(page * perPage, total)} of {total}
        {noun ? ` ${noun}` : ""}
      </p>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onPrev}
          disabled={page === 1}
          className="p-1.5 rounded border border-slate-200 disabled:opacity-50"
          aria-label="Previous page"
        >
          <ChevronLeft size={14} />
        </button>
        <span className="text-xs font-bold px-3">
          Page {page} of {totalPages || 1}
        </span>
        <button
          type="button"
          onClick={onNext}
          disabled={page === totalPages || totalPages === 0}
          className="p-1.5 rounded border border-slate-200 disabled:opacity-50"
          aria-label="Next page"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
