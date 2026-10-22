"use client";

import { BadgeDollarSign, Building2, FileText, Handshake, Users } from "lucide-react";

export default function PartnerDashboardKpis({
  partnerCount,
  partnerUniversityCount,
  totalReferred,
  totalApplications,
  commissionCount,
}: {
  partnerCount: number;
  partnerUniversityCount: number;
  totalReferred: number;
  totalApplications: number;
  commissionCount: number;
}) {
  const kpis = [
    {
      id: "partners",
      label: "Total Partners",
      value: partnerCount.toLocaleString(),
      icon: <Handshake size={16} />,
      color: "text-cyan-600",
      bg: "bg-cyan-50",
    },
    {
      id: "partner-universities",
      label: "Partner Universities",
      value: partnerUniversityCount.toLocaleString(),
      icon: <Building2 size={16} />,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      id: "students-referred",
      label: "Students Referred",
      value: totalReferred.toLocaleString(),
      icon: <Users size={16} />,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      id: "applications",
      label: "Total Applications",
      value: totalApplications.toLocaleString(),
      icon: <FileText size={16} />,
      color: "text-violet-600",
      bg: "bg-violet-50",
    },
    {
      id: "commissions",
      label: "Partner Commissions",
      value: commissionCount.toLocaleString(),
      icon: <BadgeDollarSign size={16} />,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
      {kpis.map((k) => (
        <div
          key={k.id}
          className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-3"
        >
          <div
            className={`size-10 rounded-xl ${k.bg} ${k.color} flex items-center justify-center flex-shrink-0`}
          >
            {k.icon}
          </div>
          <div className="min-w-0">
            <div className="text-xl font-bold text-slate-800 font-tabular">{k.value}</div>
            <div className="text-[11px] text-slate-400 font-medium truncate">{k.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
