"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import DocumentCard from "./DocumentCard";
import { sectionMeta } from "./sectionMeta";
import type { SectionKey, StudentDoc } from "./types";

export default function DocumentSection({
  section,
  items,
  open,
  onToggle,
  onSetDocStatus,
}: {
  section: SectionKey;
  items: StudentDoc[];
  open: boolean;
  onToggle: (section: SectionKey) => void;
  onSetDocStatus: (docId: string, status: "Approved" | "Rejected") => void;
}) {
  const meta = sectionMeta[section];

  return (
    <div className={`border rounded-xl overflow-hidden ${meta.wrap}`}>
      <button
        type="button"
        onClick={() => onToggle(section)}
        className="w-full flex items-center justify-between p-4 hover:bg-white/40 transition-colors"
      >
        <div className="flex items-center gap-3">
          {meta.icon}
          <span className="font-bold text-slate-900">
            {section} ({items.length})
          </span>
        </div>
        {open ? (
          <ChevronUp size={20} className="text-slate-400" />
        ) : (
          <ChevronDown size={20} className="text-slate-400" />
        )}
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-3">
          {items.length === 0 ? (
            <p className="text-xs text-slate-500 px-1">No items in this category.</p>
          ) : (
            items.map((doc) => (
              <DocumentCard
                key={doc.id}
                doc={doc}
                section={section}
                iconWrap={meta.iconWrap}
                onSetDocStatus={onSetDocStatus}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
