"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Globe2, Loader2, Newspaper, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { toast } from "sonner";

interface NewsItem {
  id: number;
  title: string;
  body: string;
  audience: "all" | "consultancy";
  isPublished: boolean;
  publishedAt: string | null;
  consultancyId: number | null;
  author: { name: string; email: string } | null;
  isRead?: boolean;
  createdAt: string;
}

interface ConsultancyOption {
  id: number;
  name: string;
  code: string;
}

interface NewsForm {
  title: string;
  body: string;
  audience: "all" | "consultancy";
  consultancyId: string;
  isPublished: boolean;
}

const EMPTY_FORM: NewsForm = {
  title: "",
  body: "",
  audience: "consultancy",
  consultancyId: "",
  isPublished: true,
};

function formatDate(value: string | null): string {
  if (!value) return "Not published";
  return new Date(value).toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function NewsContent() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [consultancies, setConsultancies] = useState<ConsultancyOption[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<NewsItem | null>(null);
  const [form, setForm] = useState<NewsForm>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  const isSuperAdmin = role.trim().toLowerCase() === "super admin";
  const canPost = isSuperAdmin || role.trim().toLowerCase() === "admin";

  const fetchNews = useCallback(
    async (signal?: AbortSignal) => {
      const params = new URLSearchParams({ page: String(page), perPage: "10" });
      if (search.trim()) params.set("search", search.trim());
      const res = await fetch(`/api/news?${params.toString()}`, { signal });
      if (!res.ok) throw new Error("failed");
      return res.json();
    },
    [page, search]
  );

  useEffect(() => {
    const ac = new AbortController();
    fetchNews(ac.signal)
      .then((data) => {
        setItems(Array.isArray(data?.data) ? data.data : []);
        setTotalPages(data?.totalPages || 1);
        setTotal(data?.total || 0);
      })
      .catch((err) => {
        if (err?.name !== "AbortError") toast.error("Failed to load news");
      })
      .finally(() => setLoading(false));
    return () => ac.abort();
  }, [fetchNews]);

  useEffect(() => {
    const ac = new AbortController();
    fetch("/api/auth/me", { signal: ac.signal })
      .then((res) => res.json())
      .then((data) => setRole(data?.role || ""))
      .catch(() => {});
    return () => ac.abort();
  }, []);

  useEffect(() => {
    if (!isSuperAdmin) return;
    const ac = new AbortController();
    fetch("/api/consultancies", { signal: ac.signal })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setConsultancies(data);
      })
      .catch(() => {});
    return () => ac.abort();
  }, [isSuperAdmin]);

  const refresh = () => {
    fetchNews()
      .then((data) => {
        setItems(Array.isArray(data?.data) ? data.data : []);
        setTotalPages(data?.totalPages || 1);
        setTotal(data?.total || 0);
      })
      .catch(() => toast.error("Failed to load news"));
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY_FORM, audience: isSuperAdmin ? "all" : "consultancy" });
    setShowModal(true);
  };

  const openEdit = (item: NewsItem) => {
    setEditing(item);
    setForm({
      title: item.title,
      body: item.body,
      audience: item.audience,
      consultancyId: item.consultancyId ? String(item.consultancyId) : "",
      isPublished: item.isPublished,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (!form.title.trim() || !form.body.trim()) {
      toast.error("Title and body are required");
      return;
    }
    if (isSuperAdmin && form.audience === "consultancy" && !form.consultancyId) {
      toast.error("Select a consultancy");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: form.title.trim(),
        body: form.body.trim(),
        audience: form.audience,
        isPublished: form.isPublished,
        consultancyId:
          isSuperAdmin && form.audience === "consultancy" ? Number(form.consultancyId) : undefined,
      };
      const res = await fetch(editing ? `/api/news/${editing.id}` : "/api/news", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const result = await res.json().catch(() => ({}));
        toast.error(result.error || "Failed to save news");
        return;
      }
      toast.success(editing ? "News updated" : "News posted");
      setShowModal(false);
      setEditing(null);
      refresh();
    } catch {
      toast.error("Error saving news");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (item: NewsItem) => {
    if (!confirm(`Delete "${item.title}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/news/${item.id}`, { method: "DELETE" });
      if (!res.ok) {
        toast.error("Failed to delete news");
        return;
      }
      toast.success("News deleted");
      refresh();
    } catch {
      toast.error("Error deleting news");
    }
  };

  const audienceLabel = useMemo(
    () => (item: NewsItem) => {
      if (item.audience === "all" || item.consultancyId == null) return "All consultancies";
      const match = consultancies.find((c) => c.id === item.consultancyId);
      return match ? match.name : "This consultancy";
    },
    [consultancies]
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="size-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Newspaper size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">News</h1>
              <p className="text-xs text-slate-400">
                {total} {total === 1 ? "post" : "posts"} · announcements for staff and consultancies
              </p>
            </div>
          </div>
        </div>
        {canPost && (
          <button
            type="button"
            onClick={openCreate}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={15} /> Post News
          </button>
        )}
      </div>

      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search news…"
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-400">
          <Loader2 className="animate-spin mr-2" size={18} /> Loading news…
        </div>
      ) : items.length === 0 ? (
        <div className="card p-10 text-center">
          <Newspaper className="mx-auto text-slate-300 mb-3" size={32} />
          <p className="text-sm text-slate-500">
            {search ? "No news matches your search." : "No news has been posted yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <article key={item.id} className="card p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h2 className="font-bold text-slate-800">{item.title}</h2>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                        item.audience === "all" || item.consultancyId == null
                          ? "bg-indigo-50 text-indigo-600"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      <Globe2 size={10} /> {audienceLabel(item)}
                    </span>
                    {!item.isPublished && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 text-[9px] font-black uppercase tracking-widest">
                        Draft
                      </span>
                    )}
                    {item.isRead === false && (
                      <span className="size-2 rounded-full bg-indigo-500" title="Unread" />
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mb-3">
                    {item.author?.name || "System"}
                    {item.author?.email ? ` · ${item.author.email}` : ""} ·{" "}
                    {formatDate(item.publishedAt || item.createdAt)}
                  </p>
                  <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">
                    {item.body}
                  </p>
                </div>
                {canPost && (
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => openEdit(item)}
                      aria-label={`Edit ${item.title}`}
                      className="size-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item)}
                      aria-label={`Delete ${item.title}`}
                      className="size-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-xs text-slate-500">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="font-bold text-slate-800">{editing ? "Edit news" : "Post news"}</h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                aria-label="Close"
                className="size-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  maxLength={255}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="News headline"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Body
                </label>
                <textarea
                  value={form.body}
                  onChange={(e) => setForm({ ...form, body: e.target.value })}
                  rows={7}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-y"
                  placeholder="Write the announcement…"
                  required
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                    Audience
                  </label>
                  {isSuperAdmin ? (
                    <select
                      value={form.audience}
                      onChange={(e) =>
                        setForm({ ...form, audience: e.target.value as NewsForm["audience"] })
                      }
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      <option value="all">All consultancies</option>
                      <option value="consultancy">Specific consultancy</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      value="My consultancy"
                      disabled
                      className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-500"
                    />
                  )}
                </div>

                {isSuperAdmin && form.audience === "consultancy" && (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                      Consultancy
                    </label>
                    <select
                      value={form.consultancyId}
                      onChange={(e) => setForm({ ...form, consultancyId: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                      required
                    >
                      <option value="">Select consultancy…</option>
                      {consultancies.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.code})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isPublished}
                  onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                  className="size-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                />
                <span className="text-sm font-medium text-slate-600">
                  Publish now (visible to users and shown in the login popup)
                </span>
              </label>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary flex items-center gap-2 disabled:opacity-60"
                >
                  {submitting && <Loader2 className="animate-spin" size={15} />}
                  {editing ? "Save changes" : "Post news"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
