"use client";

import { entityFields } from "./reportConfig";
import type { EntitySelectorProps } from "./types";

export default function EntitySelector({ entity, onSelect }: EntitySelectorProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-4">
      <span className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
        Entity
      </span>
      <div className="flex flex-wrap gap-1">
        {Object.keys(entityFields).map((e) => (
          <button
            type="button"
            key={e}
            onClick={() => onSelect(e)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${entity === e ? "bg-indigo-600 text-white" : "bg-slate-50 text-slate-600"}`}
          >
            {e}
          </button>
        ))}
      </div>
    </div>
  );
}
