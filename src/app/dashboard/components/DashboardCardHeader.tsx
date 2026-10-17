"use client";

import React from "react";
import { MoreHorizontal } from "lucide-react";

interface DashboardCardHeaderProps {
  title: string;
  subtitle: string;
}

export default function DashboardCardHeader({ title, subtitle }: DashboardCardHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div>
        <h3 className="font-semibold text-slate-800 text-sm">{title}</h3>
        <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
      </div>
      <button
        type="button"
        className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition duration-150"
        aria-label="More options"
      >
        {" "}
        <MoreHorizontal size={16} />
      </button>
    </div>
  );
}
