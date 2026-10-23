"use client";

import { useEffect, useRef, useState } from "react";
import { MonitorSmartphone } from "lucide-react";
import { toast } from "sonner";

const MODE_OPTIONS = [
  { value: "Online", label: "Online" },
  { value: "In-person", label: "In-person" },
  { value: "Hybrid", label: "Hybrid" },
] as const;

/**
 * Default delivery mode preselected on the Add Course form. Stored on the
 * SystemSettings row via /api/settings/academics.
 */
export default function CourseDefaultModeCard() {
  const [mode, setMode] = useState("Online");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const busyRef = useRef(false);

  useEffect(() => {
    const ac = new AbortController();
    fetch("/api/settings/academics", { signal: ac.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (typeof data?.defaultCourseMode === "string") setMode(data.defaultCourseMode);
        setIsLoading(false);
      })
      .catch(() => {
        if (!ac.signal.aborted) {
          setIsLoading(false);
          toast.error("Failed to load course defaults");
        }
      });
    return () => ac.abort();
  }, []);

  const handleSave = async () => {
    if (busyRef.current) return;
    busyRef.current = true;
    setIsSaving(true);
    try {
      const res = await fetch("/api/settings/academics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ defaultCourseMode: mode }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "Failed to save course defaults");
        return;
      }
      toast.success(`New courses will now default to "${mode}"`);
    } catch (_err) {
      toast.error("Error saving course defaults");
    } finally {
      busyRef.current = false;
      setIsSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="bg-indigo-50 p-2.5 rounded-xl text-indigo-600">
          <MonitorSmartphone size={18} />
        </span>
        <div>
          <h3 className="text-sm font-bold text-slate-700">Default Course Delivery Mode</h3>
          <p className="text-xs text-slate-400">
            Preselected automatically whenever a new course is added.
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <select
          value={mode}
          disabled={isLoading || isSaving}
          onChange={(e) => setMode(e.target.value)}
          aria-label="Default course delivery mode"
          className="w-full sm:w-56 px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-300 cursor-pointer disabled:opacity-60"
        >
          {MODE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={handleSave}
          disabled={isLoading || isSaving}
          className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-60"
        >
          {isSaving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}
