import type { ReactNode } from "react";

export default function BrowserFrame({
  url,
  className,
  children,
}: {
  url: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`relative ${className ?? ""}`}>
      <div
        aria-hidden
        className="absolute -inset-6 rounded-[40px] bg-indigo-400/20 opacity-70 blur-[70px]"
      />
      <div className="relative overflow-hidden rounded-2xl bg-white shadow-[0_50px_100px_-40px_rgba(15,23,42,0.3)] ring-1 ring-slate-200">
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 z-10 h-px bg-gradient-to-r from-transparent via-indigo-400/60 to-transparent"
        />
        <div className="flex items-center gap-2 border-b border-slate-200/80 bg-slate-50/80 px-4 py-3">
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]"></span>
          <span className="h-3 w-3 rounded-full bg-[#febc2e]"></span>
          <span className="h-3 w-3 rounded-full bg-[#28c840]"></span>
          <div className="mx-4 flex h-6 flex-1 items-center rounded-lg bg-slate-100 px-3 ring-1 ring-slate-200/70">
            <span className="truncate font-mono text-[10px] text-slate-400">{url}</span>
          </div>
        </div>
        <div className="relative aspect-[16/10] overflow-hidden bg-white">{children}</div>
      </div>
    </div>
  );
}
