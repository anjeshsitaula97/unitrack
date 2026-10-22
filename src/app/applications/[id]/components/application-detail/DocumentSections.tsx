"use client";

import DocumentSection from "./DocumentSection";
import type { GroupedDocs, SectionKey } from "./types";

export default function DocumentSections({
  visibleSections,
  grouped,
  openSections,
  onToggleSection,
  onSetDocStatus,
}: {
  visibleSections: SectionKey[];
  grouped: GroupedDocs;
  openSections: Record<string, boolean>;
  onToggleSection: (section: SectionKey) => void;
  onSetDocStatus: (docId: string, status: "Approved" | "Rejected") => void;
}) {
  return (
    <div className="space-y-4">
      {visibleSections.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-10 text-center text-sm text-slate-500">
          No documents found for this student yet.
        </div>
      )}
      {visibleSections.map((section) => (
        <DocumentSection
          key={section}
          section={section}
          items={grouped[section]}
          open={openSections[section]}
          onToggle={onToggleSection}
          onSetDocStatus={onSetDocStatus}
        />
      ))}
    </div>
  );
}
