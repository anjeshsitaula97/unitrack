"use client";

import React, { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Building2, Check, ChevronDown, Globe2 } from "lucide-react";
import { api } from "@/lib/fetch-client";

interface Consultancy {
  id: number;
  code: string;
  name: string;
  status: string;
}

interface Props {
  role?: string | null;
}

const COOKIE_NAME = "active_consultancy";

function readSelected(): string {
  if (typeof document === "undefined") return "all";
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : "all";
}

function writeSelected(value: string) {
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(value)}; path=/; max-age=${60 * 60 * 24 * 365}`;
}

const emptySubscribe = () => () => {};

export default function ConsultancySwitcher({ role }: Props) {
  const isSuperAdmin = (role || "").trim().toLowerCase() === "super admin";
  const [open, setOpen] = useState(false);
  const selected = useSyncExternalStore(emptySubscribe, readSelected, () => "all");
  const [consultancies, setConsultancies] = useState<Consultancy[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isSuperAdmin) return;
    let cancelled = false;
    api
      .get<Consultancy[]>("/api/consultancies", { showError: false })
      .then((data) => {
        if (!cancelled && Array.isArray(data)) setConsultancies(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [isSuperAdmin]);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  if (!isSuperAdmin) return null;

  const current =
    selected === "all" ? null : consultancies.find((c) => String(c.id) === selected) || null;

  const choose = (value: string) => {
    writeSelected(value);
    setOpen(false);
    // Full reload so every server-rendered surface re-scopes to the selection.
    window.location.reload();
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-label="Switch consultancy"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
      >
        {current ? <Building2 size={13} /> : <Globe2 size={13} />}
        <span className="max-w-[140px] truncate">
          {current ? `${current.code} — ${current.name}` : "All Consultancies"}
        </span>
        <ChevronDown
          size={13}
          className={open ? "rotate-180 transition-transform" : "transition-transform"}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl border border-slate-200 shadow-lg z-50 py-1 max-h-96 overflow-y-auto">
          <button
            type="button"
            onClick={() => choose("all")}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            <Globe2 size={14} className="text-indigo-500" />
            <span className="flex-1 text-left">All Consultancies</span>
            {selected === "all" && <Check size={14} className="text-indigo-600" />}
          </button>
          <div className="border-t border-slate-100 my-1" />
          {consultancies.length === 0 && (
            <p className="px-4 py-3 text-xs text-slate-400">No consultancies yet.</p>
          )}
          {consultancies.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => choose(String(c.id))}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              <Building2 size={14} className="text-slate-400" />
              <span className="flex-1 text-left truncate">
                <span className="text-slate-400">{c.code}</span> — {c.name}
              </span>
              {selected === String(c.id) && <Check size={14} className="text-indigo-600" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
