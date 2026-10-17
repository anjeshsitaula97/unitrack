"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import { safeJson } from "@/lib/fetch-client";
import DashboardCardHeader from "./DashboardCardHeader";

const TrendAreaChart = dynamic(() => import("./TrendAreaChart"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <Loader2 className="animate-spin text-indigo-500" size={24} />
    </div>
  ),
});

interface TrendEntry {
  name: string;
  courses: number;
}

export default function EnrollmentTrendChart() {
  const [data, setData] = useState<TrendEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ac = new AbortController();
    fetch("/api/dashboard/charts", { signal: ac.signal })
      .then(safeJson)
      .then((result) => {
        setData(result.coursesTrend || []);
        setLoading(false);
      })
      .catch((err) => {
        if (err?.name !== "AbortError") {
          console.error("Trend Chart Error:", err);
          setLoading(false);
        }
      });
    return () => ac.abort();
  }, []);

  return (
    <div className="card p-5 h-[320px] relative">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
          <Loader2 className="animate-spin text-indigo-500" size={24} />
        </div>
      )}
      <DashboardCardHeader title="System Activity" subtitle="Courses added trend" />

      <div className="h-[220px]">
        <TrendAreaChart data={data} />
      </div>
    </div>
  );
}
