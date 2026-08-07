"use client";

import React, { useState } from "react";
import { Zap, Play, Settings2, Trash2, Plus, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const MOCK_AUTOMATIONS = [
  {
    id: "auto-1",
    name: "New Enrollment Notification",
    description: "Send a Slack message when a student enrolls in a featured course.",
    status: "active",
    lastRun: "10 mins ago",
    runsToday: 24,
    type: "Notification",
  },
  {
    id: "auto-2",
    name: "Weekly Report Generator",
    description: "Automatically generate and email the weekly enrollment trend report.",
    status: "active",
    lastRun: "2 days ago",
    runsToday: 0,
    type: "Reporting",
  },
  {
    id: "auto-3",
    name: "Course Capacity Warning",
    description: "Alert admins when a course reaches 90% capacity.",
    status: "paused",
    lastRun: "1 hour ago",
    runsToday: 3,
    type: "Alert",
  },
  {
    id: "auto-4",
    name: "Auto-Sync University Data",
    description: "Sync data from external ranking providers every 24 hours.",
    status: "active",
    lastRun: "12 hours ago",
    runsToday: 1,
    type: "Data Sync",
  },
];

export default function AutomationsContent() {
  const [automations, setAutomations] = useState(MOCK_AUTOMATIONS);

  const toggleStatus = (id: string) => {
    setAutomations((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, status: a.status === "active" ? "paused" : "active" } : a
      )
    );
    const automation = automations.find((a) => a.id === id);
    toast.success(
      `${automation?.name} is now ${automation?.status === "active" ? "paused" : "active"}`
    );
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Zap className="text-indigo-500 fill-indigo-500" size={24} />
            Automations
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {automations.length.toLocaleString()} workflows currently configured
          </p>
        </div>
        <button
          type="button"
          onClick={() => toast.info("Workflow builder coming soon!")}
          className="btn-primary"
        >
          <Plus size={18} />
          Create Workflow
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="card p-4 flex flex-col items-center justify-center text-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
            Active Now
          </p>
          <p className="text-2xl font-bold text-indigo-600">3</p>
        </div>
        <div className="card p-4 flex flex-col items-center justify-center text-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
            Runs Today
          </p>
          <p className="text-2xl font-bold text-emerald-600">28</p>
        </div>
        <div className="card p-4 flex flex-col items-center justify-center text-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
            Success Rate
          </p>
          <p className="text-2xl font-bold text-slate-800">99.2%</p>
        </div>
        <div className="card p-4 flex flex-col items-center justify-center text-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
            Avg. Latency
          </p>
          <p className="text-2xl font-bold text-slate-800">142ms</p>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-tight">
            Active Workflows
          </h2>
          <span className="text-xs text-slate-400 font-medium">
            {automations.length} total rules configured
          </span>
        </div>
        <div className="divide-y divide-slate-100">
          {automations.map((a) => (
            <div
              key={a.id}
              className="p-6 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row items-start sm:items-center gap-6 group"
            >
              <div
                className={`size-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm ${a.status === "active" ? "bg-indigo-100 text-indigo-600 animate-pulse-subtle" : "bg-slate-100 text-slate-400"}`}
              >
                {a.type === "Notification" && <Zap size={20} />}
                {a.type === "Reporting" && <Clock size={20} />}
                {a.type === "Alert" && <AlertCircle size={20} />}
                {a.type === "Data Sync" && <CheckCircle2 size={20} />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-base font-bold text-slate-800 truncate uppercase tracking-tight">
                    {a.name}
                  </h3>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter ${a.status === "active" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-slate-100 text-slate-500 border border-slate-200"}`}
                  >
                    {a.status}
                  </span>
                </div>
                <p className="text-sm text-slate-500 font-medium line-clamp-1">{a.description}</p>
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                    <Clock size={12} />
                    Last run: {a.lastRun}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                    <Play size={12} />
                    Runs today: {a.runsToday}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={() => toggleStatus(a.id)}
                  className={`btn-secondary text-xs ${a.status === "active" ? "text-amber-600" : "text-emerald-600"}`}
                >
                  {a.status === "active" ? "Pause" : "Resume"}
                </button>
                <button
                  type="button"
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  aria-label="Settings2"
                >
                  {" "}
                  <Settings2 size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAutomations((prev) => prev.filter((item) => item.id !== a.id));
                    toast.error(`Deleted ${a.name} permanently.`);
                  }}
                  className="p-2 text-red-800 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6 bg-gradient-to-br from-indigo-500 to-violet-600 text-white border-0 shadow-lg relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-xl font-bold mb-2">Build Custom Workflows</h3>
            <p className="text-white/80 text-sm mb-6 max-w-sm">
              Connect triggers like user signups or new course listings to actions like emails,
              webhooks, or external database syncs.
            </p>
            <button
              type="button"
              className="px-4 py-2 bg-white text-indigo-600 rounded-xl text-sm font-bold hover:shadow-lg transition-all active:scale-95"
            >
              Open Builder
            </button>
          </div>
          <Zap className="absolute -bottom-6 -right-6 text-white/10" size={160} />
        </div>
        <div className="card p-6 border-slate-200 border-dashed bg-slate-50/50 flex flex-col items-center justify-center text-center">
          <div className="size-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
            <Plus size={24} />
          </div>
          <p className="text-slate-600 font-bold mb-1 uppercase tracking-tight">
            Need a pre-built template?
          </p>
          <p className="text-sm text-slate-400 max-w-xs mb-4 font-medium">
            Browse our library of pre-configured automations for common university management tasks.
          </p>
          <button
            type="button"
            className="text-sm font-bold text-indigo-600 hover:underline transition-all"
          >
            Explore Templates &rarr;
          </button>
        </div>
      </div>
    </div>
  );
}
