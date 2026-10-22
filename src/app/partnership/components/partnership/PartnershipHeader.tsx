"use client";

import { Plus } from "lucide-react";
import type { PartnershipHeaderProps } from "./types";

export default function PartnershipHeader({
  partnerCount,
  partneredUniversityCount,
  showAddPartner,
  onToggleAddPartner,
}: PartnershipHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 mb-1">Partnership</h1>
        <p className="text-sm text-slate-400">
          {partnerCount.toLocaleString()} partner companies ·{" "}
          {partneredUniversityCount.toLocaleString()} partnered universities
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button type="button" onClick={onToggleAddPartner} className="btn-primary">
          <Plus size={15} />
          {showAddPartner ? "Cancel" : "Add Partner"}
        </button>
      </div>
    </div>
  );
}
