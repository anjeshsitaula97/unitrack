"use client";

import PartnerCard from "./PartnerCard";
import type { PartnersGridProps } from "./types";

export default function PartnersGrid({ partners, universityCountByPartner }: PartnersGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {partners.length === 0 ? (
        <div className="col-span-full card p-12 text-center text-slate-400 text-sm italic">
          No partner companies found.
        </div>
      ) : (
        partners.map((partner) => (
          <PartnerCard
            key={partner.id}
            partner={partner}
            universityCount={universityCountByPartner[partner.id] || 0}
          />
        ))
      )}
    </div>
  );
}
