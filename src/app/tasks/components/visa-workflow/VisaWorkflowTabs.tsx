"use client";

import { CheckCircle2, ListChecks, Building, FileText } from "lucide-react";
import type { VisaWorkflowTab } from "./types";

export default function VisaWorkflowTabs({
  activeTab,
  onChange,
}: {
  activeTab: VisaWorkflowTab;
  onChange: (tab: VisaWorkflowTab) => void;
}) {
  return (
    <div className="flex bg-slate-100/50 p-1.5 rounded-2xl w-fit">
      {[
        { id: "process", label: "Workflow Process", icon: <CheckCircle2 size={16} /> },
        { id: "checklists", label: "Digital Checklists", icon: <ListChecks size={16} /> },
        { id: "embassy", label: "Embassy Details", icon: <Building size={16} /> },
        { id: "tasks", label: "Task Board", icon: <FileText size={16} /> },
      ].map((tab) => (
        <button
          type="button"
          key={tab.id}
          onClick={() => onChange(tab.id as VisaWorkflowTab)}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium text-sm transition-[color,background-color,border-color,box-shadow,transform,opacity] ${
            activeTab === tab.id
              ? "bg-white text-indigo-600 shadow-sm font-semibold"
              : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
          }`}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </div>
  );
}
