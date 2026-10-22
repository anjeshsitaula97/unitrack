import { Loader2, Settings } from "lucide-react";

export interface SmtpSettings {
  host: string;
  port: string;
  user: string;
  pass: string;
  fromEmail: string;
  fromName: string;
  encryption: string;
}

const inputClass =
  "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm";
const labelClass = "block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5";

export default function SmtpSettingsForm({
  settings,
  onChange,
  saving,
  onSubmit,
}: {
  settings: SmtpSettings;
  onChange: (settings: SmtpSettings) => void;
  saving: boolean;
  onSubmit: (e: React.FormEvent) => void;
}) {
  const update = (patch: Partial<SmtpSettings>) => onChange({ ...settings, ...patch });
  return (
    <div className="max-w-lg">
      <form
        onSubmit={onSubmit}
        className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4"
      >
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="smtp-host" className={labelClass}>
              SMTP Host
            </label>
            <input
              id="smtp-host"
              type="text"
              value={settings.host}
              onChange={(e) => update({ host: e.target.value })}
              placeholder="smtp.gmail.com"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="smtp-port" className={labelClass}>
              Port
            </label>
            <input
              id="smtp-port"
              type="number"
              value={settings.port}
              onChange={(e) => update({ port: e.target.value })}
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label htmlFor="smtp-username" className={labelClass}>
            SMTP Username
          </label>
          <input
            id="smtp-username"
            type="text"
            value={settings.user}
            onChange={(e) => update({ user: e.target.value })}
            placeholder="your@email.com"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="smtp-password" className={labelClass}>
            SMTP Password
          </label>
          <input
            id="smtp-password"
            type="password"
            value={settings.pass}
            onChange={(e) => update({ pass: e.target.value })}
            placeholder="App password or SMTP password"
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="from-email" className={labelClass}>
              From Email
            </label>
            <input
              id="from-email"
              type="email"
              value={settings.fromEmail}
              onChange={(e) => update({ fromEmail: e.target.value })}
              placeholder="sender@email.com"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="from-name" className={labelClass}>
              From Name
            </label>
            <input
              id="from-name"
              type="text"
              value={settings.fromName}
              onChange={(e) => update({ fromName: e.target.value })}
              placeholder="UniTrack"
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label htmlFor="smtp-encryption" className={labelClass}>
            Encryption
          </label>
          <select
            id="smtp-encryption"
            value={settings.encryption}
            onChange={(e) => update({ encryption: e.target.value })}
            className={inputClass}
          >
            <option value="TLS">TLS</option>
            <option value="SSL">SSL</option>
            <option value="None">None</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {saving ? <Loader2 className="animate-spin" size={18} /> : <Settings size={18} />}
          {saving ? "Saving..." : "Save SMTP Settings"}
        </button>
      </form>
    </div>
  );
}
