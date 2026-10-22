"use client";

import React from "react";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Course pagination with a compact page-number window.
 */
export default function CoursesPagination({
  page,
  totalPages,
  perPage,
  total,
  onPageChange,
  onPerPageChange,
}: {
  page: number;
  totalPages: number;
  perPage: number;
  total: number;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="card px-5 py-4 border-none shadow-sm flex flex-wrap items-center justify-between gap-4 bg-white/50 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Show
        </span>
        <div className="relative">
          <select
            aria-label="Courses per page"
            className="pl-3 pr-8 py-1.5 bg-white border border-slate-100 rounded-lg text-xs font-black text-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 appearance-none cursor-pointer"
            value={perPage}
            onChange={(e) => onPerPageChange(Number(e.target.value))}
          >
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
          </select>
          <ChevronDown
            size={12}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
        </div>
        <span className="text-xs font-bold text-slate-400">
          of <strong className="text-slate-700 font-black">{total}</strong> courses
        </span>
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          aria-label="Previous page"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className="size-8 rounded-xl flex items-center justify-center border border-slate-100 text-slate-400 hover:bg-white hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed transition"
        >
          <ChevronLeft size={16} />
        </button>

        <div className="flex items-center gap-1 mx-1">
          {(() => {
            const result = [];
            const allPages = Array.from({ length: totalPages }, (_, i) => i + 1);
            let lastPushed = 0;
            for (const p of allPages) {
              if (p === 1 || p === totalPages || Math.abs(p - page) <= 1) {
                const showEllipsis = result.length > 0 && p - lastPushed > 1;
                result.push(
                  <React.Fragment key={`page-${p}`}>
                    {showEllipsis && (
                      <span className="px-2 text-slate-300 text-xs font-black">...</span>
                    )}
                    <button
                      type="button"
                      onClick={() => onPageChange(p)}
                      className={`size-8 rounded-xl text-xs font-black transition ${
                        page === p
                          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-110"
                          : "text-slate-400 hover:bg-white hover:text-slate-600"
                      }`}
                    >
                      {p}
                    </button>
                  </React.Fragment>
                );
                lastPushed = p;
              }
            }
            return result;
          })()}
        </div>

        <button
          type="button"
          aria-label="Next page"
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className="size-8 rounded-xl flex items-center justify-center border border-slate-100 text-slate-400 hover:bg-white hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed transition"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
