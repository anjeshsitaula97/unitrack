"use client";

import { Building2, DollarSign, Handshake, Users } from "lucide-react";
import StatsStrip from "@/components/StatsStrip";
import type { PartnershipStatsProps } from "./types";

export default function PartnershipStats({
  partnerCount,
  partneredUniversityCount,
  studentCount,
  totalAmount,
}: PartnershipStatsProps) {
  const stats = [
    {
      id: "pt-total-partners",
      label: "Total Partners",
      value: partnerCount.toLocaleString(),
      icon: <Handshake size={14} />,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      id: "pt-partnered",
      label: "Partnered Universities",
      value: partneredUniversityCount.toLocaleString(),
      icon: <Building2 size={14} />,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      id: "pt-students",
      label: "Students via Partners",
      value: studentCount.toLocaleString(),
      icon: <Users size={14} />,
      color: "text-violet-600",
      bg: "bg-violet-50",
    },
    {
      id: "pt-amount",
      label: "Partnership Value",
      value: `$${totalAmount.toLocaleString()}`,
      icon: <DollarSign size={14} />,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  return <StatsStrip stats={stats} />;
}
