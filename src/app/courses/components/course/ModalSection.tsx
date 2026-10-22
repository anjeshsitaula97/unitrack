"use client";

import type React from "react";

export default function ModalSection({
  icon,
  title,
  count,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <span className="size-6 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
          {icon}
        </span>
        <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-widest">{title}</h4>
        {typeof count === "number" && count > 0 && (
          <span className="ml-auto text-[10px] font-black text-slate-400 bg-slate-100 rounded-full px-2 py-0.5">
            {count}
          </span>
        )}
      </div>
      {children}
    </section>
  );
}
