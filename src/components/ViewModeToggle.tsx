"use client";

import { Columns3, LayoutGrid, Table } from "lucide-react";

export type ViewMode = "grid" | "table" | "kanban";

const options = [
  { mode: "grid" as const, Icon: LayoutGrid, title: "Grid view" },
  { mode: "table" as const, Icon: Table, title: "Table view" },
  { mode: "kanban" as const, Icon: Columns3, title: "Kanban view" },
];

export default function ViewModeToggle({
  value,
  onChange,
}: {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
}) {
  return (
    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
      {options.map(({ mode, Icon, title }) => (
        <button
          key={mode}
          type="button"
          onClick={() => onChange(mode)}
          className={`p-2 rounded-lg transition ${value === mode ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
          title={title}
        >
          <Icon size={16} />
        </button>
      ))}
    </div>
  );
}
