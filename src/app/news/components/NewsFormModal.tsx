import { Loader2, X } from "lucide-react";
import type { ConsultancyOption, NewsForm } from "./news-types";

export default function NewsFormModal({
  editing,
  form,
  setForm,
  isSuperAdmin,
  consultancies,
  submitting,
  onSubmit,
  onClose,
}: {
  editing: boolean;
  form: NewsForm;
  setForm: (form: NewsForm) => void;
  isSuperAdmin: boolean;
  consultancies: ConsultancyOption[];
  submitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-bold text-slate-800">{editing ? "Edit news" : "Post news"}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="size-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        </div>
        <form onSubmit={onSubmit} className="p-6 space-y-4">
          <div>
            <label
              htmlFor="fld-text"
              className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2"
            >
              Title
            </label>
            <input
              id="fld-text"
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
            <label
              htmlFor="news-body"
              className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2"
            >
              Body
            </label>
            <textarea
              id="news-body"
              aria-label="Write the announcement…"
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
              <label
                htmlFor="news-audience"
                className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2"
              >
                Audience
              </label>
              {isSuperAdmin ? (
                <select
                  id="news-audience"
                  aria-label="Audience"
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
                  id="news-audience"
                  aria-label="Consultancy"
                  type="text"
                  value="My consultancy"
                  disabled
                  className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-500"
                />
              )}
            </div>

            {isSuperAdmin && form.audience === "consultancy" && (
              <div>
                <label
                  htmlFor="news-consultancy"
                  className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2"
                >
                  Consultancy
                </label>
                <select
                  id="news-consultancy"
                  aria-label="Consultancy"
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
              onClick={onClose}
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
  );
}
