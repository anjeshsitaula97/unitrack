"use client";

import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Layers, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  DEFAULT_APPLICATION_STATUSES,
  getApplicationStatuses,
  type ApplicationStatus,
} from "@/lib/application-statuses";
import { loadStatuses } from "./settings-shared";
import SettingsHeader from "./SettingsHeader";

export default function ApplicationStatusesSettings() {
  const [appStatuses, setAppStatuses] = useState<ApplicationStatus[]>(DEFAULT_APPLICATION_STATUSES);
  const [isSavingStatuses, setIsSavingStatuses] = useState(false);
  const [newStatusName, setNewStatusName] = useState("");
  const [newStatusStage, setNewStatusStage] = useState("");

  useEffect(() => {
    const ac = new AbortController();
    loadStatuses(ac.signal)
      .then((statuses) => {
        if (statuses) setAppStatuses(statuses);
      })
      .catch(() => {});
    return () => ac.abort();
  }, []);

  const handleAddStatus = () => {
    const name = newStatusName.trim();
    const stage = newStatusStage.trim();
    if (!name) return;
    if (!stage) {
      toast.error("Enter a process stage for this status");
      return;
    }
    const exists = appStatuses.some((s) => s.name.toLowerCase() === name.toLowerCase());
    if (exists) {
      toast.error("A status with that name already exists");
      return;
    }
    setAppStatuses((prev) => [...prev, { name, stage }]);
    setNewStatusName("");
    setNewStatusStage("");
    toast.success("Status added — press Save to apply");
  };

  const handleMoveStatus = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= appStatuses.length) return;
    setAppStatuses((prev) => {
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const handleDeleteStatus = (index: number) => {
    setAppStatuses((prev) => prev.filter((_, i) => i !== index));
    toast.success("Status removed — press Save to apply");
  };

  const handleChangeStatusStage = (index: number, stage: string) => {
    setAppStatuses((prev) => prev.map((s, i) => (i === index ? { ...s, stage } : s)));
  };

  const handleSaveStatuses = async () => {
    if (appStatuses.length === 0) {
      toast.error("Add at least one status before saving");
      return;
    }
    setIsSavingStatuses(true);
    try {
      const res = await fetch("/api/settings/application-statuses", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statuses: appStatuses }),
      });
      if (res.ok) {
        const data = await res.json();
        setAppStatuses(getApplicationStatuses(JSON.stringify(data.statuses)));
        toast.success("Application statuses saved");
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "Failed to save application statuses");
      }
    } catch {
      toast.error("Error connecting to server");
    } finally {
      setIsSavingStatuses(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div className="flex items-center justify-between">
        <SettingsHeader
          icon={<Layers size={18} />}
          title="Application Statuses"
          description="Manage the status options available on applications and how each maps to the process tracker."
        />
        <button
          type="button"
          onClick={handleSaveStatuses}
          disabled={isSavingStatuses}
          className="btn-primary px-6 shadow-lg shadow-indigo-100 disabled:opacity-50"
        >
          {isSavingStatuses ? "Saving..." : "Save Statuses"}
        </button>
      </div>

      <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex gap-4">
        <div className="size-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0">
          <Layers size={20} />
        </div>
        <div>
          <h4 className="text-sm font-bold text-indigo-900">How it works</h4>
          <p className="text-xs text-indigo-700 mt-0.5 leading-relaxed">
            Each status maps to a process stage (1–5): Created, Application Started, Reviewed (By
            UniTrack), Submitted to School, Offer received. Applications whose status is changed
            will automatically reflect the mapped stage in their process tracker.
          </p>
        </div>
      </div>

      <div className="card p-5">
        <h4 className="text-sm font-bold text-slate-800 mb-3">Add status</h4>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            aria-label="Status name"
            placeholder="Status name (e.g. Conditional Offer)"
            value={newStatusName}
            onChange={(e) => setNewStatusName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddStatus()}
            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
          />
          <input
            type="text"
            aria-label="Process stage"
            placeholder="Process stage (e.g. Application Started)"
            value={newStatusStage}
            onChange={(e) => setNewStatusStage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddStatus()}
            className="w-full sm:w-64 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
          />
          <button
            type="button"
            onClick={handleAddStatus}
            disabled={!newStatusName.trim()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 inline-flex items-center gap-2"
          >
            <Plus size={16} />
            Add
          </button>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h4 className="text-sm font-bold text-slate-800">
            Statuses <span className="text-slate-400 font-semibold">({appStatuses.length})</span>
          </h4>
          <p className="text-[10px] text-slate-400 font-semibold">
            Order affects the Manage App dropdown
          </p>
        </div>
        {appStatuses.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500">No statuses defined yet.</div>
        ) : (
          <div className="divide-y divide-slate-50">
            {appStatuses.map((status, index) => (
              <div key={status.name} className="flex items-center gap-3 px-5 py-3">
                <div className="flex flex-col">
                  <button
                    type="button"
                    onClick={() => handleMoveStatus(index, -1)}
                    disabled={index === 0}
                    aria-label={`Move ${status.name} up`}
                    className="text-slate-400 hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveStatus(index, 1)}
                    disabled={index === appStatuses.length - 1}
                    aria-label={`Move ${status.name} down`}
                    className="text-slate-400 hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ArrowDown size={14} />
                  </button>
                </div>
                <div className="w-8 h-8 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                  {index + 1}
                </div>
                <span className="text-sm font-semibold text-slate-800 flex-1 min-w-0 truncate">
                  {status.name}
                </span>
                <input
                  type="text"
                  value={status.stage}
                  onChange={(e) => handleChangeStatusStage(index, e.target.value)}
                  placeholder="Stage"
                  aria-label={`Process stage for ${status.name}`}
                  className="w-44 px-2 py-1.5 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleDeleteStatus(index)}
                  aria-label={`Remove ${status.name}`}
                  title="Remove status"
                  className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
