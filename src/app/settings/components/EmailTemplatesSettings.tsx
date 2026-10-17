"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle, Edit2, Eye, MailPlus, RotateCcw, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import { loadEmailTemplates, type EmailTemplateItem } from "./settings-shared";
import SettingsHeader from "./SettingsHeader";

const inputClass =
  "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none";
const labelClass = "block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2";

const SAMPLE_CHANGES = `<table style="width:100%;border-collapse:collapse;margin:8px 0;border:1px solid #eef2f7;border-radius:8px;overflow:hidden;">
  <tr style="background:#f8fafc;">
    <th align="left" style="padding:8px 10px;color:#64748b;font-size:11px;text-transform:uppercase;">Field</th>
    <th align="left" style="padding:8px 10px;color:#64748b;font-size:11px;text-transform:uppercase;">Previous</th>
    <th align="left" style="padding:8px 10px;color:#64748b;font-size:11px;text-transform:uppercase;">New</th>
  </tr>
  <tr>
    <td style="padding:8px 10px;border-bottom:1px solid #eef2f7;font-size:13px;">Test Type</td>
    <td style="padding:8px 10px;border-bottom:1px solid #eef2f7;color:#94a3b8;font-size:13px;">—</td>
    <td style="padding:8px 10px;border-bottom:1px solid #eef2f7;font-size:13px;">IELTS</td>
  </tr>
</table>`;

const SAMPLE_VARS: Record<string, string> = {
  studentName: "Jane Doe",
  studentEmail: "jane.doe@example.com",
  actorName: "Admin User",
  appName: "UniTrack",
  date: new Date().toLocaleString(),
  changes: SAMPLE_CHANGES,
};

function renderPreview(template: string): string {
  return template.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_m, key: string) => SAMPLE_VARS[key] ?? "");
}

export default function EmailTemplatesSettings() {
  const [templates, setTemplates] = useState<EmailTemplateItem[] | undefined>(undefined);
  const [editing, setEditing] = useState<EmailTemplateItem | null>(null);
  const [form, setForm] = useState<{ subject: string; body: string; isEnabled: boolean }>({
    subject: "",
    body: "",
    isEnabled: true,
  });
  const [showPreview, setShowPreview] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplateItem | null>(null);
  const busyRef = useRef(false);

  const load = (signal: AbortSignal) => {
    loadEmailTemplates(signal)
      .then((data) => setTemplates(data))
      .catch(() => setTemplates([]));
  };

  useEffect(() => {
    const ac = new AbortController();
    load(ac.signal);
    return () => ac.abort();
  }, []);

  const startEdit = (template: EmailTemplateItem) => {
    setEditing(template);
    setForm({ subject: template.subject, body: template.body, isEnabled: template.isEnabled });
    setShowPreview(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busyRef.current || !editing) return;
    busyRef.current = true;
    try {
      const res = await fetch("/api/settings/email-templates", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: editing.key, ...form }),
      });
      if (!res.ok) {
        const result = await res.json().catch(() => ({}));
        toast.error(result.error || "Failed to save template");
        return;
      }
      toast.success("Template saved");
      setEditing(null);
      const ac = new AbortController();
      load(ac.signal);
    } catch (_error) {
      toast.error("Error saving template");
    } finally {
      busyRef.current = false;
    }
  };

  const handleToggleEnabled = async (template: EmailTemplateItem) => {
    if (busyRef.current) return;
    busyRef.current = true;
    try {
      const res = await fetch("/api/settings/email-templates", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: template.key,
          subject: template.subject,
          body: template.body,
          isEnabled: !template.isEnabled,
        }),
      });
      if (res.ok) {
        const ac = new AbortController();
        load(ac.signal);
      } else {
        toast.error("Failed to update template");
      }
    } catch (_error) {
      toast.error("Error updating template");
    } finally {
      busyRef.current = false;
    }
  };

  const handleReset = async (template: EmailTemplateItem) => {
    if (busyRef.current) return;
    if (!confirm(`Reset "${template.name}" back to its default content?`)) return;
    busyRef.current = true;
    try {
      const res = await fetch(
        `/api/settings/email-templates?key=${encodeURIComponent(template.key)}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        toast.success("Template reset to default");
        if (editing?.key === template.key) setEditing(null);
        const ac = new AbortController();
        load(ac.signal);
      } else {
        toast.error("Failed to reset template");
      }
    } catch (_error) {
      toast.error("Error resetting template");
    } finally {
      busyRef.current = false;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between gap-4">
        <SettingsHeader
          icon={<MailPlus size={18} />}
          title="Email Templates"
          description="Customise the messages the system sends to students."
        />
      </div>

      {editing && (
        <TemplateEditor
          editing={editing}
          form={form}
          setForm={setForm}
          showPreview={showPreview}
          setShowPreview={setShowPreview}
          onSubmit={handleSave}
          onClose={() => setEditing(null)}
        />
      )}

      <div className="space-y-4">
        {(templates?.length ?? 0) === 0 && templates !== undefined && (
          <div className="text-center py-8 text-sm text-slate-400">No email templates found.</div>
        )}
        {(templates ?? []).map((template) => (
          <TemplateCard
            key={template.key}
            template={template}
            onEdit={() => startEdit(template)}
            onReset={() => handleReset(template)}
            onToggle={() => handleToggleEnabled(template)}
            onPreview={() => setPreviewTemplate(template)}
          />
        ))}
      </div>

      {previewTemplate && (
        <EmailPreviewModal
          template={previewTemplate}
          subject={renderPreview(previewTemplate.subject)}
          html={renderPreview(previewTemplate.body)}
          onClose={() => setPreviewTemplate(null)}
        />
      )}

      <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 flex gap-5 mt-10">
        <div className="size-12 bg-white rounded-xl flex items-center justify-center text-amber-600 shadow-sm flex-shrink-0">
          <AlertTriangle size={24} />
        </div>
        <div>
          <h4 className="text-sm font-bold text-amber-900 mb-1">About automated emails</h4>
          <p className="text-xs text-amber-700 leading-relaxed">
            Templates marked Automatic are sent to the student without any staff action. Turning a
            template off stops that email from being sent. Emails require an active SMTP
            configuration under Email Settings.
          </p>
        </div>
      </div>
    </div>
  );
}

function TemplateCard({
  template,
  onEdit,
  onReset,
  onToggle,
  onPreview,
}: {
  template: EmailTemplateItem;
  onEdit: () => void;
  onReset: () => void;
  onToggle: () => void;
  onPreview: () => void;
}) {
  return (
    <div className="card p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition">
      <div className="flex items-start gap-4 min-w-0">
        <div className="size-12 rounded-2xl flex items-center justify-center bg-indigo-50 text-indigo-600 flex-shrink-0">
          <MailPlus size={24} />
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-bold text-slate-800">{template.name}</h3>
            {template.autoSend && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-widest">
                <Sparkles size={10} /> Automatic
              </span>
            )}
            {!template.isEnabled && (
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-400 text-[9px] font-black uppercase tracking-widest">
                Disabled
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 font-medium mt-1">{template.description}</p>
          <p className="text-[11px] text-slate-500 mt-1.5">
            <span className="font-semibold text-slate-600">Subject:</span> {template.subject}
          </p>
          <p className="text-[10px] text-slate-400 mt-1 italic">{template.trigger}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <label className="flex items-center gap-2 mr-1 cursor-pointer">
          <input
            type="checkbox"
            checked={template.isEnabled}
            onChange={onToggle}
            className="size-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
          />
          <span className="text-xs font-semibold text-slate-600">Enabled</span>
        </label>
        <button
          type="button"
          onClick={onPreview}
          aria-label={`Preview ${template.name}`}
          className="p-2 text-emerald-800 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition"
        >
          <Eye size={18} />
        </button>
        <button
          type="button"
          onClick={onEdit}
          aria-label={`Edit ${template.name}`}
          className="p-2 text-indigo-800 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition"
        >
          <Edit2 size={18} />
        </button>
        <button
          type="button"
          onClick={onReset}
          aria-label={`Reset ${template.name}`}
          className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition"
        >
          <RotateCcw size={18} />
        </button>
      </div>
    </div>
  );
}

function EmailPreviewModal({
  template,
  subject,
  html,
  onClose,
}: {
  template: EmailTemplateItem;
  subject: string;
  html: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close preview"
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl animate-slide-up overflow-hidden flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-800">Preview: {template.name}</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Using sample student data</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-slate-400 hover:text-slate-600 transition-colors p-1"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 space-y-1.5 text-xs">
          <div className="flex gap-3">
            <span className="w-14 text-slate-400 font-semibold">To</span>
            <span className="font-medium text-slate-700">{SAMPLE_VARS.studentEmail}</span>
          </div>
          <div className="flex gap-3">
            <span className="w-14 text-slate-400 font-semibold">From</span>
            <span className="font-medium text-slate-700">
              UniTrack &lt;support@unitrackcrm.com&gt;
            </span>
          </div>
          <div className="flex gap-3">
            <span className="w-14 text-slate-400 font-semibold">Subject</span>
            <span className="font-semibold text-slate-800">{subject}</span>
          </div>
        </div>

        <div className="p-4 bg-slate-100 overflow-auto">
          {/* Sandboxed iframe renders the email HTML in isolation, matching how it appears in a client. */}
          <iframe
            title="Email preview"
            srcDoc={html}
            sandbox=""
            className="w-full h-[440px] rounded-xl bg-white border border-slate-200"
          />
        </div>
      </div>
    </div>
  );
}

function TemplateEditor({
  editing,
  form,
  setForm,
  showPreview,
  setShowPreview,
  onSubmit,
  onClose,
}: {
  editing: EmailTemplateItem;
  form: { subject: string; body: string; isEnabled: boolean };
  setForm: React.Dispatch<
    React.SetStateAction<{ subject: string; body: string; isEnabled: boolean }>
  >;
  showPreview: boolean;
  setShowPreview: (value: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}) {
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const insertPlaceholder = (name: string) => {
    const el = bodyRef.current;
    const token = `{{${name}}}`;
    if (!el) {
      setForm((prev) => ({ ...prev, body: `${prev.body}${token}` }));
      return;
    }
    const start = el.selectionStart ?? form.body.length;
    const end = el.selectionEnd ?? form.body.length;
    const next = form.body.slice(0, start) + token + form.body.slice(end);
    setForm((prev) => ({ ...prev, body: next }));
    requestAnimationFrame(() => {
      el.focus();
      el.selectionStart = el.selectionEnd = start + token.length;
    });
  };

  return (
    <div className="card p-8 border-2 border-indigo-100 animate-slide-down mb-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Edit Template</h3>
          <p className="text-xs text-slate-400 mt-0.5">{editing.name}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X size={24} />
        </button>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <div>
          <label htmlFor="template-subject" className={labelClass}>
            Subject
          </label>
          <input
            id="template-subject"
            type="text"
            value={form.subject}
            onChange={(e) => setForm((prev) => ({ ...prev, subject: e.target.value }))}
            className={inputClass}
            required
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className={labelClass}>Body (HTML)</span>
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              {showPreview ? "Edit" : "Preview"}
            </button>
          </div>

          {showPreview ? (
            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 text-xs">
                <span className="font-semibold text-slate-600">Subject:</span>{" "}
                <span className="text-slate-800">{renderPreview(form.subject)}</span>
              </div>
              <div
                className="overflow-auto max-h-[420px]"
                // Preview renders the admin's own HTML template with sample data.
                dangerouslySetInnerHTML={{ __html: renderPreview(form.body) }}
              />
            </div>
          ) : (
            <textarea
              id="template-body"
              ref={bodyRef}
              value={form.body}
              onChange={(e) => setForm((prev) => ({ ...prev, body: e.target.value }))}
              rows={14}
              spellCheck={false}
              className={`${inputClass} font-mono text-xs leading-relaxed resize-y`}
              required
            />
          )}

          <div className="mt-3">
            <span className={labelClass}>Insert placeholder</span>
            <div className="flex flex-wrap gap-2">
              {editing.placeholders.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => insertPlaceholder(name)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-[11px] font-mono font-semibold text-slate-600 transition"
                >
                  {`{{${name}}}`}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="template-enabled"
              checked={form.isEnabled}
              onChange={(e) => setForm((prev) => ({ ...prev, isEnabled: e.target.checked }))}
              className="size-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
            />
            <label htmlFor="template-enabled" className="text-sm font-semibold text-slate-700">
              Enabled
            </label>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Save Template
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
