"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, Newspaper, Plus, Search } from "lucide-react";
import NewsArticleCard from "./NewsArticleCard";
import NewsFormModal from "./NewsFormModal";
import { EMPTY_FORM, type ConsultancyOption, type NewsForm, type NewsItem } from "./news-types";
import { toast } from "sonner";

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
      .then(async (res) => {
        if (!res.ok) throw new Error(`Failed to load role: ${res.status}`);
        return res.json();
      })
      .then((data) => setRole(data?.role || ""))
      .catch(() => {});
    return () => ac.abort();
  }, []);

  useEffect(() => {
    if (!isSuperAdmin) return;
    const ac = new AbortController();
    fetch("/api/consultancies", { signal: ac.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error(`Failed to load consultancies: ${res.status}`);
        return res.json();
      })
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
          aria-label="Search news…"
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
            <NewsArticleCard
              key={item.id}
              item={item}
              canPost={canPost}
              audienceLabel={audienceLabel}
              onEdit={openEdit}
              onDelete={handleDelete}
            />
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
        <NewsFormModal
          editing={Boolean(editing)}
          form={form}
          setForm={setForm}
          isSuperAdmin={isSuperAdmin}
          consultancies={consultancies}
          submitting={submitting}
          onSubmit={handleSubmit}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
