"use client";

import { Plus, X } from "lucide-react";
import { entityFields, filterOperators } from "./reportConfig";
import type { FiltersPanelProps } from "./types";

export default function FiltersPanel({
  entity,
  filters,
  onAdd,
  onRemove,
  onUpdate,
}: FiltersPanelProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          Filters
        </span>
        <button
          type="button"
          onClick={onAdd}
          className="text-indigo-600 text-xs font-semibold flex items-center gap-1"
        >
          <Plus size={12} /> Add
        </button>
      </div>
      <div className="space-y-2">
        {filters.map((f) => (
          <div key={f.id} className="flex gap-1 items-center">
            <button
              type="button"
              onClick={() => onRemove(f.id)}
              aria-label="Remove filter"
              className="text-red-400"
            >
              <X size={12} />
            </button>
            <select
              aria-label="Filter field"
              value={f.field}
              onChange={(e) => onUpdate(f.id, "field", e.target.value)}
              className="flex-1 text-[10px] px-1.5 py-1 bg-slate-50 border border-slate-200 rounded"
            >
              {entityFields[entity].map((fld) => (
                <option key={fld} value={fld}>
                  {fld}
                </option>
              ))}
            </select>
            <select
              aria-label="Filter operator"
              value={f.op}
              onChange={(e) => onUpdate(f.id, "op", e.target.value)}
              className="w-16 text-[10px] px-1 py-1 bg-slate-50 border border-slate-200 rounded"
            >
              {filterOperators.map((op) => (
                <option key={op} value={op}>
                  {op}
                </option>
              ))}
            </select>
            <input
              type="text"
              aria-label="Filter value"
              value={f.value}
              onChange={(e) => onUpdate(f.id, "value", e.target.value)}
              className="flex-1 text-[10px] px-1.5 py-1 bg-slate-50 border border-slate-200 rounded"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
