"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { MoreHorizontal, Loader2, PieChart as PieIcon } from "lucide-react";
import { safeJson } from "@/lib/fetch-client";

const FacultyDistributionPie = dynamic(() => import("./FacultyDistributionPie"), {
  ssr: false,
  loading: () => <div className="relative flex-shrink-0 w-[160px] h-[160px]" aria-hidden="true" />,
});

interface PieEntry {
  name: string;
  value: number;
  color: string;
}

export default function FacultyDistributionChart() {
  const [data, setData] = useState<PieEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    const ac = new AbortController();
    fetch("/api/dashboard/charts", { signal: ac.signal })
      .then(safeJson)
      .then((result) => {
        setData(result.facultyDistribution || []);
        setLoading(false);
      })
      .catch((err) => {
        if (err?.name !== "AbortError") {
          console.error("Faculty Chart Error:", err);
          setLoading(false);
        }
      });
    return () => ac.abort();
  }, []);

  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="card p-5 h-[320px] relative">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
          <Loader2 className="animate-spin text-indigo-500" size={24} />
        </div>
      )}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-slate-800 text-sm">Faculty Distribution</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Distribution across {total.toLocaleString()} courses
          </p>
        </div>
        <button
          type="button"
          className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition duration-150"
          aria-label="MoreHorizontal"
        >
          {" "}
          <MoreHorizontal size={16} />
        </button>
      </div>

      {data.length > 0 ? (
        <div className="flex items-center gap-4">
          <FacultyDistributionPie
            data={data}
            total={total}
            activeIndex={activeIndex}
            onHover={setActiveIndex}
            onLeave={() => setActiveIndex(null)}
          />
          <div className="flex-1 space-y-1.5 max-h-[220px] overflow-y-auto pr-2 scrollbar-thin">
            {data.slice(0, 7).map((cat, i) => (
              <div
                key={cat.name}
                className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                onMouseEnter={() => setActiveIndex(i)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                <div
                  className="size-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="text-xs text-slate-600 flex-1 truncate">{cat.name}</span>
                <span className="text-xs font-semibold text-slate-700 font-tabular">
                  {((cat.value / total) * 100).toFixed(0)}%
                </span>
              </div>
            ))}
            {data.length > 7 && (
              <div className="text-[10px] text-slate-400 text-center mt-2">
                +{data.length - 7} more faculties
              </div>
            )}
          </div>
        </div>
      ) : (
        !loading && (
          <div className="flex flex-col items-center justify-center h-[200px] text-slate-300">
            <PieIcon size={32} strokeWidth={1.5} className="mb-2" />
            <p className="text-xs">No faculty data available</p>
          </div>
        )
      )}
    </div>
  );
}
