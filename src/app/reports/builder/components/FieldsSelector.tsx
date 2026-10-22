"use client";

import { entityFields } from "./reportConfig";
import type { FieldsSelectorProps } from "./types";

export default function FieldsSelector({ entity, selectedFields, onToggle }: FieldsSelectorProps) {
  const selectedFieldSet = new Set(selectedFields);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          Fields
        </span>
        <span className="text-[10px] text-slate-400">{selectedFields.length} selected</span>
      </div>
      <div className="space-y-0.5 max-h-48 overflow-y-auto">
        {entityFields[entity].map((field) => (
          <label key={field} className="flex items-center gap-2 py-1 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedFieldSet.has(field)}
              onChange={() => onToggle(field)}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-xs text-slate-600">{field}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
