"use client";

import type { MainTab } from "./types";

export default function ApplicationTabs({
  mainTab,
  notesCount,
  onSelect,
}: {
  mainTab: MainTab;
  notesCount: number;
  onSelect: (tab: MainTab) => void;
}) {
  return (
    <div className="border-b border-slate-200 mb-6 flex gap-8 overflow-x-auto">
      {(
        [
          "Requirements",
          "Student records",
          "Workflow",
          "Notes",
          "Commission",
          "Settings",
        ] as MainTab[]
      ).map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => onSelect(tab)}
          className={`pb-3 border-b-2 text-sm whitespace-nowrap transition-colors ${
            mainTab === tab
              ? "border-[#1d4ed8] text-[#1d4ed8] font-bold"
              : "border-transparent text-slate-500 hover:text-slate-700 font-medium"
          }`}
        >
          {tab === "Notes" ? `Notes (${notesCount})` : tab}
        </button>
      ))}
    </div>
  );
}
