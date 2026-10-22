import React from "react";
import { Check, Clock, FileText } from "lucide-react";
import type { SectionKey } from "./types";

export const sectionMeta: Record<
  SectionKey,
  { wrap: string; iconWrap: string; icon: React.ReactNode }
> = {
  Pending: {
    wrap: "bg-amber-50/30 border-amber-200",
    iconWrap: "bg-amber-100 text-amber-700",
    icon: <Clock size={20} className="text-amber-600" />,
  },
  Approved: {
    wrap: "bg-emerald-50/30 border-emerald-200",
    iconWrap: "bg-emerald-100 text-emerald-700",
    icon: <Check size={20} className="text-emerald-600" />,
  },
  Rejected: {
    wrap: "bg-red-50/30 border-red-200",
    iconWrap: "bg-red-100 text-red-700",
    icon: <FileText size={20} className="text-red-600" />,
  },
  "In Review": {
    wrap: "bg-blue-50/30 border-blue-200",
    iconWrap: "bg-blue-100 text-blue-700",
    icon: <Clock size={20} className="text-blue-600" />,
  },
};
