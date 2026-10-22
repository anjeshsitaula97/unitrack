import { BadgeDollarSign, Building2, GraduationCap, Scale } from "lucide-react";
import StatsStrip from "@/components/StatsStrip";

interface CommissionStatsProps {
  allCommissionedCount: number;
  commissionedCount: number;
  commissionedCoursesCount: number;
  totalFlatValue: number;
}

export default function CommissionStats({
  allCommissionedCount,
  commissionedCount,
  commissionedCoursesCount,
  totalFlatValue,
}: CommissionStatsProps) {
  const stats = [
    {
      id: "cm-configured",
      label: "Commissions Configured",
      value: allCommissionedCount.toLocaleString(),
      icon: <BadgeDollarSign size={14} />,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      id: "cm-universities",
      label: "Universities",
      value: commissionedCount.toLocaleString(),
      icon: <Building2 size={14} />,
      color: "text-violet-600",
      bg: "bg-violet-50",
    },
    {
      id: "cm-courses",
      label: "Courses",
      value: commissionedCoursesCount.toLocaleString(),
      icon: <GraduationCap size={14} />,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      id: "cm-flat",
      label: "Flat Commission Value",
      value: `$${totalFlatValue.toLocaleString()}`,
      icon: <Scale size={14} />,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  return <StatsStrip stats={stats} />;
}
