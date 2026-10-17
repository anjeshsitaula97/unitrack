"use client";

import { useEffect, useRef, useState } from "react";
import { Edit2, Mail, MapPin, Plus, Shield, ShieldCheck, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { loadBranches, loadEmailSettings, type Branch, type EmailSetting } from "./settings-shared";
import SettingsHeader from "./SettingsHeader";

const SMTP_PROVIDERS: Record<
  string,
  { smtpHost: string; smtpPort: string; smtpEncryption: string }
> = {
  Gmail: { smtpHost: "smtp.gmail.com", smtpPort: "587", smtpEncryption: "TLS" },
  Outlook: { smtpHost: "smtp-mail.outlook.com", smtpPort: "587", smtpEncryption: "TLS" },
  Hostinger: { smtpHost: "smtp.hostinger.com", smtpPort: "465", smtpEncryption: "SSL" },
};

interface NewEmailState {
  type: string;
  branchId: string;
  smtpHost: string;
  smtpPort: string;
  smtpUser: string;
  smtpPass: string;
  smtpEncryption: string;
  fromEmail: string;
  fromName: string;
  isActive: boolean;
  provider: string;
}

const EMPTY_EMAIL: NewEmailState = {
  type: "Global",
  branchId: "",
  smtpHost: "",
  smtpPort: "587",
  smtpUser: "",
  smtpPass: "",
  smtpEncryption: "TLS",
  fromEmail: "",
  fromName: "",
  isActive: true,
  provider: "Custom",
};

const inputClass =
  "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none";
const labelClass = "block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2";

export default function EmailSettings() {
  const [emailSettings, setEmailSettings] = useState<EmailSetting[] | undefined>(undefined);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [showAddEmail, setShowAddEmail] = useState(false);
  const [editingEmail, setEditingEmail] = useState<EmailSetting | null>(null);
  const [newEmail, setNewEmail] = useState<NewEmailState>(EMPTY_EMAIL);
  const busyRef = useRef(false);

  const refreshEmailSettings = () => {
    const ac = new AbortController();
    loadEmailSettings(ac.signal)
      .then((data) => setEmailSettings(data))
      .catch(() => {});
  };

  useEffect(() => {
    const ac = new AbortController();
    loadEmailSettings(ac.signal)
      .then((data) => setEmailSettings(data))
      .catch(() => {});
    loadBranches(ac.signal)
      .then((data) => setBranches(data))
      .catch(() => {});
    return () => ac.abort();
  }, []);

  const handleProviderChange = (provider: string) => {
    const preset = SMTP_PROVIDERS[provider];
    setNewEmail((prev) => ({
      ...prev,
      provider,
      ...(preset
        ? {
            smtpHost: preset.smtpHost,
            smtpPort: preset.smtpPort,
            smtpEncryption: preset.smtpEncryption,
          }
        : {}),
    }));
  };

  const handleEmailUserChange = (value: string) => {
    setNewEmail((prev) => ({
      ...prev,
      smtpUser: value,
      fromEmail: value,
    }));
  };

  const handleSaveEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busyRef.current) return;
    busyRef.current = true;
    const data = editingEmail || newEmail;

    try {
      const res = await fetch("/api/settings/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const result = await res.json().catch(() => ({}));
        toast.error(result.error || "Failed to save settings");
        return;
      }
      toast.success(editingEmail ? "Settings updated" : "Settings added");
      refreshEmailSettings();
      setShowAddEmail(false);
      setEditingEmail(null);
      setNewEmail(EMPTY_EMAIL);
    } catch (_error) {
      toast.error("Error saving settings");
    } finally {
      busyRef.current = false;
    }
  };

  const handleDeleteEmail = async (id: string) => {
    if (busyRef.current) return;
    if (!confirm("Are you sure you want to delete these SMTP settings?")) return;
    busyRef.current = true;
    try {
      const res = await fetch(`/api/settings/email?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Settings deleted");
        refreshEmailSettings();
      } else {
        toast.error("Failed to delete");
      }
    } catch (_error) {
      toast.error("Error deleting");
    } finally {
      busyRef.current = false;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <SettingsHeader
          icon={<Mail size={18} />}
          title="Email SMTP Settings"
          description="Configure SMTP servers for the main office or individual branches."
        />
        <button
          type="button"
          onClick={() => setShowAddEmail(true)}
          className="btn-primary flex items-center gap-2 shadow-lg shadow-indigo-100"
        >
          <Plus size={18} />
          Add SMTP Config
        </button>
      </div>

      {(showAddEmail || editingEmail) && (
        <EmailForm
          editingEmail={editingEmail}
          newEmail={newEmail}
          branches={branches}
          setEditingEmail={setEditingEmail}
          setNewEmail={setNewEmail}
          onSubmit={handleSaveEmail}
          onProviderChange={handleProviderChange}
          onEmailUserChange={handleEmailUserChange}
          onClose={() => {
            setShowAddEmail(false);
            setEditingEmail(null);
          }}
        />
      )}

      <EmailList
        settings={emailSettings}
        showAddEmail={showAddEmail}
        onEdit={setEditingEmail}
        onDelete={handleDeleteEmail}
      />

      <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 flex gap-5 mt-10">
        <div className="size-12 bg-white rounded-xl flex items-center justify-center text-amber-600 shadow-sm flex-shrink-0">
          <ShieldCheck size={24} />
        </div>
        <div>
          <h4 className="text-sm font-bold text-amber-900 mb-1">Email Delivery Security</h4>
          <p className="text-xs text-amber-700 leading-relaxed">
            SMTP credentials are stored securely in the database. When a branch configuration is
            active, the system will prioritize it for emails originating from that branch. If no
            branch setting exists, the Global configuration is used as a fallback.
          </p>
        </div>
      </div>
    </div>
  );
}

function EmailList({
  settings,
  showAddEmail,
  onEdit,
  onDelete,
}: {
  settings: EmailSetting[] | undefined;
  showAddEmail: boolean;
  onEdit: (setting: EmailSetting) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="space-y-4">
      {(settings?.length ?? 0) === 0 && !showAddEmail && (
        <div className="text-center py-8 text-sm text-slate-400">
          No email settings configured yet.
        </div>
      )}
      {(settings ?? []).map((setting) => (
        <div
          key={setting.id}
          className="card p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition"
        >
          <div className="flex items-center gap-4">
            <div
              className={`size-12 rounded-2xl flex items-center justify-center ${setting.type === "Global" ? "bg-indigo-50 text-indigo-600" : "bg-emerald-50 text-emerald-600"}`}
            >
              {setting.type === "Global" ? <Shield size={24} /> : <MapPin size={24} />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-800">
                  {setting.type === "Global" ? "Main Office (Global)" : setting.branch?.name}
                </h3>
                {!setting.isActive && (
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-400 text-[9px] font-black uppercase tracking-widest">
                    Disabled
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-medium">
                SMTP: {setting.smtpHost}:{setting.smtpPort} ({setting.smtpEncryption})
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Sender: {setting.fromName} &lt;{setting.fromEmail}&gt;
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onEdit(setting)}
              aria-label="Edit email settings"
              className="p-2 text-indigo-800 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition"
            >
              <Edit2 size={18} />
            </button>
            <button
              type="button"
              onClick={() => onDelete(setting.id)}
              aria-label="Delete email settings"
              className="p-2 text-rose-800 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function EmailForm({
  editingEmail,
  newEmail,
  branches,
  setEditingEmail,
  setNewEmail,
  onSubmit,
  onProviderChange,
  onEmailUserChange,
  onClose,
}: {
  editingEmail: EmailSetting | null;
  newEmail: NewEmailState;
  branches: Branch[];
  setEditingEmail: (value: EmailSetting | null) => void;
  setNewEmail: React.Dispatch<React.SetStateAction<NewEmailState>>;
  onSubmit: (e: React.FormEvent) => void;
  onProviderChange: (provider: string) => void;
  onEmailUserChange: (value: string) => void;
  onClose: () => void;
}) {
  const setField = (field: keyof EmailSetting, value: unknown) => {
    if (editingEmail) setEditingEmail({ ...editingEmail, [field]: value } as EmailSetting);
    else setNewEmail((prev) => ({ ...prev, [field]: value }));
  };

  const val = (field: keyof NewEmailState): string =>
    String(editingEmail ? editingEmail[field] : newEmail[field]);

  const isActive = editingEmail ? editingEmail.isActive : newEmail.isActive;

  return (
    <div className="card p-8 border-2 border-indigo-100 animate-slide-down mb-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-slate-800">
          {editingEmail ? "Update SMTP Configuration" : "New SMTP Configuration"}
        </h3>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {!editingEmail && (
            <div>
              <label htmlFor="settings-email-configType" className={labelClass}>
                Config Type
              </label>
              <select
                id="settings-email-configType"
                value={newEmail.type}
                onChange={(e) => {
                  setNewEmail((prev) => ({
                    ...prev,
                    type: e.target.value,
                    branchId: e.target.value === "Global" ? "" : prev.branchId,
                  }));
                }}
                className={inputClass}
              >
                <option value="Global">Global / Main Office</option>
                <option value="Branch">Specific Branch</option>
              </select>
            </div>
          )}

          {!editingEmail && (
            <div>
              <label htmlFor="settings-email-provider" className={labelClass}>
                Email Provider
              </label>
              <select
                id="settings-email-provider"
                value={newEmail.provider}
                onChange={(e) => onProviderChange(e.target.value)}
                className={inputClass}
              >
                <option value="Custom">Custom SMTP</option>
                <option value="Gmail">Gmail</option>
                <option value="Outlook">Outlook</option>
                <option value="Hostinger">Hostinger</option>
              </select>
              <p className="text-[10px] text-slate-400 mt-1 italic">
                Selecting a provider auto-fills the SMTP server details.
              </p>
            </div>
          )}

          {((!editingEmail && newEmail.type === "Branch") ||
            (editingEmail && editingEmail.type === "Branch")) && (
            <div>
              <label htmlFor="settings-email-branch" className={labelClass}>
                Select Branch
              </label>
              <select
                id="settings-email-branch"
                value={val("branchId")}
                onChange={(e) => setField("branchId", e.target.value)}
                className={inputClass}
                disabled={!!editingEmail}
              >
                <option value="">Select Branchâ€¦</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="md:col-span-1">
            <label htmlFor="settings-email-fromName" className={labelClass}>
              Sender Name
            </label>
            <input
              id="settings-email-fromName"
              type="text"
              value={val("fromName")}
              onChange={(e) => setField("fromName", e.target.value)}
              placeholder="e.g. UniTrack Support"
              className={inputClass}
              required
            />
          </div>

          <div className="md:col-span-1">
            <label htmlFor="settings-email-fromEmail" className={labelClass}>
              Sender Email
            </label>
            <input
              id="settings-email-fromEmail"
              type="email"
              value={val("fromEmail")}
              onChange={(e) => setField("fromEmail", e.target.value)}
              placeholder="noreply@unitrack.com"
              className={inputClass}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="md:col-span-2">
            <label htmlFor="settings-email-smtpHost" className={labelClass}>
              SMTP Host
            </label>
            <input
              id="settings-email-smtpHost"
              type="text"
              value={val("smtpHost")}
              onChange={(e) => setField("smtpHost", e.target.value)}
              placeholder="smtp.gmail.com"
              className={inputClass}
              required
            />
          </div>
          <div>
            <label htmlFor="settings-email-port" className={labelClass}>
              Port
            </label>
            <input
              id="settings-email-port"
              type="number"
              value={val("smtpPort")}
              onChange={(e) => setField("smtpPort", e.target.value)}
              placeholder="587"
              className={inputClass}
              required
            />
          </div>
          <div>
            <label htmlFor="settings-email-encryption" className={labelClass}>
              Encryption
            </label>
            <select
              id="settings-email-encryption"
              value={val("smtpEncryption")}
              onChange={(e) => setField("smtpEncryption", e.target.value)}
              className={inputClass}
            >
              <option value="TLS">TLS</option>
              <option value="SSL">SSL</option>
              <option value="None">None</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="settings-email-smtpUser" className={labelClass}>
              SMTP Username / Email
            </label>
            <input
              id="settings-email-smtpUser"
              type="email"
              value={val("smtpUser")}
              onChange={(e) => {
                if (editingEmail) setField("smtpUser", e.target.value);
                else onEmailUserChange(e.target.value);
              }}
              className={inputClass}
              required
            />
          </div>
          <div>
            <label htmlFor="settings-email-smtpPass" className={labelClass}>
              SMTP Password
            </label>
            <input
              id="settings-email-smtpPass"
              type="password"
              value={val("smtpPass")}
              onChange={(e) => setField("smtpPass", e.target.value)}
              placeholder={editingEmail ? "Leave blank to keep existing" : "Enter SMTP password"}
              className={inputClass}
              required
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="active-toggle"
              checked={isActive}
              onChange={(e) => setField("isActive", e.target.checked)}
              className="size-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
            />
            <label htmlFor="active-toggle" className="text-sm font-semibold text-slate-700">
              Active Configuration
            </label>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {editingEmail ? "Update SMTP" : "Create SMTP"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
