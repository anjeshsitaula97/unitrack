"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Trash2,
  RotateCcw,
  Search,
  Loader2,
  AlertTriangle,
  Building2,
  BookOpen,
  Users,
  GraduationCap,
} from "lucide-react";
import { toast } from "sonner";

const typeIcons: Record<string, any> = {
  Student: GraduationCap,
  University: Building2,
  Course: BookOpen,
  Lead: Users,
};

export default function TrashContent() {
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("");
  const [search, setSearch] = useState("");
  const [restoring, setRestoring] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchTrash = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (typeFilter) params.set("type", typeFilter);
      if (search) params.set("search", search);
      const res = await fetch(`/api/trash?${params.toString()}`);
      const data = await res.json();
      setItems(data.items || []);
      setTotal(data.total || 0);
    } catch {
      toast.error("Failed to load trash");
    } finally {
      setLoading(false);
    }
  };

  const fetchTrashRef = useRef(fetchTrash);
  useEffect(() => {
    fetchTrashRef.current = fetchTrash;
    fetchTrashRef.current();
  }, [typeFilter]);

  const handleRestore = async (id: string) => {
    setRestoring(id);
    try {
      const res = await fetch("/api/trash/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        toast.success("Item restored");
        fetchTrash();
      } else {
        const err = await res.json();
        toast.error(err.error || "Restore failed");
      }
    } catch {
      toast.error("Restore failed");
    } finally {
      setRestoring(null);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
          Recycle Bin
        </h1>
        <span className="text-sm text-slate-400">{total} items</span>
      </div>

      <div className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchTrash()}
            placeholder="Search trash..."
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        {["", "Student", "University", "Course", "Lead"].map((t) => (
          <button
            type="button"
            key={t}
            onClick={() => setTypeFilter(t)}
            className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${typeFilter === t ? "bg-indigo-600 text-white" : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"}`}
          >
            {t || "All"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-20 flex items-center justify-center">
          <Loader2 className="animate-spin text-slate-400" size={32} />
        </div>
      ) : items.length === 0 ? (
        <div className="py-20 text-center">
          <Trash2 className="mx-auto text-slate-200 dark:text-slate-700 mb-3" size={48} />
          <p className="text-slate-500 font-medium">Trash is empty</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => {
            const Icon = typeIcons[item.entityType] || Trash2;
            const daysLeft = Math.max(
              0,
              Math.ceil((new Date(item.expiresAt).getTime() - now) / 86400000)
            );
            return (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-400">
                    <Icon size={20} />
                  </div>
                  <div>
                    <div className="font-medium text-slate-800 dark:text-white text-sm">
                      {item.entityName}
                    </div>
                    <div className="text-xs text-slate-400">
                      {item.entityType} &middot; Deleted{" "}
                      {new Date(item.deletedAt).toLocaleDateString()}
                    </div>
                    <div className="text-[10px] text-amber-500 font-semibold">
                      {daysLeft} days until permanent deletion
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRestore(item.id)}
                  disabled={restoring === item.id}
                  className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors flex items-center gap-1"
                >
                  {restoring === item.id ? (
                    <Loader2 className="animate-spin" size={12} />
                  ) : (
                    <RotateCcw size={12} />
                  )}
                  Restore
                </button>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
