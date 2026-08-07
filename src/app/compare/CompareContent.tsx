"use client";

import React, { useState, useEffect } from "react";
import { Search, Building2, BookOpen, Plus, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface CompareItem {
  id: string;
  name: string;
  _count?: { courses?: number };
  courses?: number;
  university?: { name: string } | string | null;
  [key: string]: unknown;
}

function getFieldValue(item: CompareItem, field: string) {
  if (field === "courses") return item._count?.courses || item.courses || 0;
  if (field === "university") {
    const u = item.university;
    return u && typeof u === "object" ? u.name : u || "-";
  }
  const v = item[field];
  return typeof v === "string" || typeof v === "number" ? v : "-";
}

export default function CompareContent() {
  const [type, setType] = useState<"universities" | "courses">("universities");
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<CompareItem[]>([]);
  const [selected, setSelected] = useState<CompareItem[]>([]);
  const [compareData, setCompareData] = useState<CompareItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (search.length < 2) return;
    const timer = setTimeout(async () => {
      const endpoint = type === "universities" ? "/api/universities" : "/api/courses";
      const res = await fetch(`${endpoint}?search=${encodeURIComponent(search)}&perPage=10`);
      const data = await res.json();
      setResults(data?.data || []);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, type]);

  const displayResults = search.length < 2 ? [] : results;

  const addToCompare = (item: CompareItem) => {
    if (selected.length >= 4) {
      toast.error("Maximum 4 items to compare");
      return;
    }
    if (selected.find((s) => s.id === item.id)) return;
    setSelected([...selected, item]);
    setSearch("");
    setResults([]);
  };

  const removeFromCompare = (id: string) => {
    setSelected(selected.filter((s) => s.id !== id));
    setCompareData([]);
  };

  const handleCompare = async () => {
    if (selected.length < 2) {
      toast.error("Select at least 2 items to compare");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/comparison", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, ids: selected.map((s) => s.id) }),
      });
      if (res.ok) setCompareData(await res.json());
    } catch {
      toast.error("Comparison failed");
    } finally {
      setLoading(false);
    }
  };

  const fields =
    type === "universities"
      ? ["name", "country", "city", "type", "ranking", "founded", "status", "courses"]
      : [
          "name",
          "university",
          "level",
          "faculty",
          "degreeType",
          "duration",
          "credits",
          "tuitionFee",
          "language",
          "mode",
        ];

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
          Compare
        </h1>
      </div>

      <div className="flex gap-2 mb-6">
        {["universities", "courses"].map((t) => (
          <button
            type="button"
            key={t}
            onClick={() => {
              setType(t as "universities" | "courses");
              setSelected([]);
              setCompareData([]);
            }}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all capitalize flex items-center gap-1.5 ${type === t ? "bg-indigo-600 text-white shadow-lg" : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"}`}
          >
            {t === "universities" ? <Building2 size={16} /> : <BookOpen size={16} />} {t}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6 mb-6">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${type} to compare...`}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-sm focus:ring-2 focus:ring-indigo-500"
          />
          {displayResults.length > 0 && (
            <div className="absolute top-full mt-1 left-0 right-0 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-10 max-h-48 overflow-y-auto">
              {displayResults.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => addToCompare(item)}
                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center justify-between"
                >
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {item.name}
                  </span>
                  <Plus size={14} className="text-indigo-500" />
                </button>
              ))}
            </div>
          )}
        </div>

        {selected.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {selected.map((item) => (
              <span
                key={item.id}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 rounded-lg text-sm font-medium"
              >
                {item.name}
                <button type="button" onClick={() => removeFromCompare(item.id)}>
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={handleCompare}
          disabled={selected.length < 2 || loading}
          className="btn-primary disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" size={16} /> : null}
          Compare {selected.length} {type}
        </button>
      </div>

      {compareData.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-700">
                <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 w-40">
                  Field
                </th>
                {compareData.map((item) => (
                  <th
                    key={item.id}
                    className="px-4 py-3 text-left font-bold text-slate-800 dark:text-white min-w-[180px]"
                  >
                    {item.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {fields.map((field) => (
                <tr key={field} className="border-b border-slate-50 dark:border-slate-700/50">
                  <td className="px-4 py-2.5 text-xs font-semibold text-slate-500 capitalize">
                    {field.replace(/([A-Z])/g, " $1")}
                  </td>
                  {compareData.map((item) => (
                    <td
                      key={item.id}
                      className="px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300"
                    >
                      {getFieldValue(item, field)?.toString() || "-"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
