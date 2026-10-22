"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, Globe2, Megaphone, X } from "lucide-react";

interface NewsItem {
  id: number;
  title: string;
  body: string;
  audience: "all" | "consultancy";
  consultancyId: number | null;
  publishedAt: string | null;
  createdAt: string;
  author: { name: string; email: string } | null;
}

function formatDate(value: string | null): string {
  if (!value) return "";
  return new Date(value).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Login popup listing the newest unread news. Visibility and the "show on
 * login" switch are enforced server-side by /api/news/popup; closing marks the
 * shown posts as read so they do not reappear on the next login.
 */
export default function NewsPopup() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [active, setActive] = useState(false);

  const markRead = useCallback(async (ids: number[]) => {
    if (ids.length === 0) return;
    try {
      await fetch("/api/news/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
    } catch {
      /* non-blocking */
    }
  }, []);

  useEffect(() => {
    const ac = new AbortController();
    const timer = setTimeout(() => {
      fetch("/api/news/popup", { signal: ac.signal })
        .then(async (res) => {
          if (!res.ok) throw new Error(`Failed to load news: ${res.status}`);
          return res.json();
        })
        .then((data) => {
          const list = Array.isArray(data?.items) ? data.items : [];
          if (list.length > 0) {
            setItems(list);
            setActive(true);
          }
        })
        .catch(() => {});
    }, 1200);
    return () => {
      ac.abort();
      clearTimeout(timer);
    };
  }, []);

  const close = useCallback(() => {
    setActive(false);
    markRead(items.map((i) => i.id));
  }, [items, markRead]);

  if (!active || items.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[85] flex items-start justify-center bg-black/40 p-4 pt-20">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
        <div className="flex items-center justify-between px-5 py-4 bg-indigo-600">
          <div className="flex items-center gap-2 text-white">
            <Megaphone size={18} />
            <h2 className="font-bold">
              {items.length === 1 ? "You have a new message" : `What's new (${items.length})`}
            </h2>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Close news"
            className="size-8 rounded-lg flex items-center justify-center text-white/80 hover:bg-white/10"
          >
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto divide-y divide-slate-100">
          {items.map((item) => (
            <div key={item.id} className="p-5">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h3 className="font-bold text-slate-800">{item.title}</h3>
                {item.audience === "all" && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-[9px] font-black uppercase tracking-widest">
                    <Globe2 size={10} /> All consultancies
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mb-2">
                {item.author?.name || "System"} · {formatDate(item.publishedAt || item.createdAt)}
              </p>
              <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">
                {item.body}
              </p>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between gap-3 px-5 py-4 border-t border-slate-100 bg-slate-50">
          <Link
            href="/news"
            onClick={close}
            className="text-sm font-semibold text-indigo-600 hover:underline inline-flex items-center gap-1"
          >
            View all news <ChevronRight size={14} />
          </Link>
          <button type="button" onClick={close} className="btn-primary flex items-center gap-2">
            Mark as read
          </button>
        </div>
      </div>
    </div>
  );
}
