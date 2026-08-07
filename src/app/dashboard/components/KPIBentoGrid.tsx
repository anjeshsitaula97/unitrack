"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Loader2, GripVertical, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import { KpiDefinition, AVAILABLE_KPIS } from "./kpi-data";
import { safeJson } from "@/lib/fetch-client";

const kpiMap = new Map(AVAILABLE_KPIS.map((k) => [k.id, k]));

interface KPICardProps {
  definition: KpiDefinition;
  stats: any;
  isDragging: boolean;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragOver: (e: React.DragEvent, id: string) => void;
  onDragEnd: (e: React.DragEvent) => void;
}

function KPICard({
  definition,
  stats,
  isDragging,
  onDragStart,
  onDragOver,
  onDragEnd,
}: KPICardProps) {
  const change = definition.changeFn(stats);

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, definition.id)}
      onDragOver={(e) => onDragOver(e, definition.id)}
      onDragEnd={onDragEnd}
      className={`card relative overflow-hidden p-5 hover:shadow-md transition-all duration-200 cursor-pointer group ${isDragging ? "opacity-50 ring-2 ring-indigo-400" : ""}`}
    >
      <div
        className={`absolute inset-0 bg-gradient-to-br ${definition.gradient} pointer-events-none`}
      />

      <div className="absolute top-3 right-12 text-slate-200 text-lg select-none pointer-events-none">
        ✦
      </div>
      <div className="absolute top-7 right-7 text-slate-100 text-sm select-none pointer-events-none">
        ✦
      </div>

      <div className="absolute top-3 right-3 flex items-center gap-1">
        <div
          className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 cursor-grab active:cursor-grabbing"
          style={{ cursor: "grab" }}
        >
          <GripVertical size={14} />
        </div>
        <button
          type="button"
          className="opacity-0 group-hover:opacity-100 px-2.5 py-1 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-600 hover:bg-white transition-all duration-150"
        >
          View details
        </button>
      </div>

      <div
        className={`size-9 rounded-xl flex items-center justify-center mb-4 ${
          change.type === "warning"
            ? "bg-amber-100 text-amber-600"
            : change.type === "negative"
              ? "bg-red-100 text-red-600"
              : "bg-indigo-100 text-indigo-600"
        }`}
      >
        {definition.icon}
      </div>

      <div className="font-tabular text-3xl font-bold text-slate-800 mb-1">
        {definition.valueFn(stats)}
      </div>
      <div className="text-sm font-medium text-slate-500 mb-3">{definition.title}</div>

      <div
        className={`flex items-center gap-1.5 text-xs font-semibold ${
          change.type === "positive"
            ? "text-emerald-600"
            : change.type === "negative"
              ? "text-red-600"
              : change.type === "warning"
                ? "text-amber-600"
                : "text-slate-500"
        }`}
      >
        {change.type === "positive" && <TrendingUp size={13} />}
        {change.type === "negative" && <TrendingDown size={13} />}
        {change.type === "warning" && <AlertTriangle size={13} />}
        {change.change}
      </div>

      {definition.subtitleFn && (
        <div className="text-[11px] text-slate-400 mt-0.5">{definition.subtitleFn(stats)}</div>
      )}
    </div>
  );
}

interface Props {
  visibleKpis: string[];
  onKpiChange: (kpis: string[]) => void;
}

export default function KPIBentoGrid({ visibleKpis, onKpiChange }: Props) {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dragId, setDragId] = useState<string | null>(null);

  useEffect(() => {
    const ac = new AbortController();
    fetch("/api/dashboard/stats", { signal: ac.signal })
      .then(safeJson)
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch((err) => {
        if (err?.name !== "AbortError") {
          console.error("Failed to fetch stats:", err);
          setLoading(false);
        }
      });
    return () => ac.abort();
  }, []);

  const handleDragStart = useCallback((e: React.DragEvent, id: string) => {
    e.dataTransfer.effectAllowed = "move";
    setDragId(id);
  }, []);

  const handleDragOver = useCallback(
    (e: React.DragEvent, id: string) => {
      e.preventDefault();
      if (!dragId || dragId === id) return;
      const idx = visibleKpis.indexOf(dragId);
      const toIdx = visibleKpis.indexOf(id);
      if (idx === -1 || toIdx === -1) return;
      const next = [...visibleKpis];
      next.splice(idx, 1);
      next.splice(toIdx, 0, dragId);
      onKpiChange(next);
    },
    [dragId, visibleKpis, onKpiChange]
  );

  const handleDragEnd = useCallback(() => {
    setDragId(null);
  }, []);

  const orderedKpis = visibleKpis.filter((id) => kpiMap.has(id));
  const cards = orderedKpis.map((id) => ({ id, def: kpiMap.get(id)! }));

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-5 gap-4 mb-6">
        {[...Array(Math.max(visibleKpis.length, 3))].map((_, i) => (
          <div
            key={`skeleton-${i}`}
            className="card h-40 flex items-center justify-center bg-slate-50 animate-pulse"
          >
            <Loader2 className="animate-spin text-slate-200" size={24} />
          </div>
        ))}
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-slate-400 text-sm gap-2">
        <TrendingUp size={18} /> No KPIs selected. Use Customize to add KPIs.
      </div>
    );
  }

  const cols =
    cards.length <= 3
      ? `sm:grid-cols-${cards.length}`
      : "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-5";

  return (
    <div
      className={`grid grid-cols-1 ${cards.length <= 2 ? "md:grid-cols-2" : cards.length <= 3 ? "md:grid-cols-3" : "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-5"} gap-4 mb-6`}
    >
      {cards.map(({ id, def }) => (
        <KPICard
          key={id}
          definition={def}
          stats={stats}
          isDragging={dragId === id}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        />
      ))}
    </div>
  );
}
