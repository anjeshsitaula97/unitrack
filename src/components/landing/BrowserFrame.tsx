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
        className="absolute -inset-6 bg-indigo-600/15 blur-[70px] rounded-[40px] opacity-70"
      />
      <div className="relative rounded-2xl overflow-hidden bg-[#0b0d17] ring-1 ring-white/10 shadow-[0_50px_100px_-40px_rgba(0,0,0,0.95)]">
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400/60 to-transparent z-10"
        />
        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.07] bg-white/[0.03]">
          <span className="w-3 h-3 rounded-full bg-[#ff5f57]"></span>
          <span className="w-3 h-3 rounded-full bg-[#febc2e]"></span>
          <span className="w-3 h-3 rounded-full bg-[#28c840]"></span>
          <div className="flex-1 mx-4 h-6 rounded-lg bg-white/[0.06] ring-1 ring-white/5 flex items-center px-3">
            <span className="text-[10px] font-mono text-slate-500 truncate">{url}</span>
          </div>
        </div>
        <div className="relative aspect-[16/10] overflow-hidden">{children}</div>
      </div>
    </div>
  );
}
