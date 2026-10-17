"use client";

import { useEffect, useRef, useState } from "react";
import { Globe } from "lucide-react";
import { toast } from "sonner";
import { COUNTRIES } from "@/lib/data/countries";
import {
  DEFAULT_ENABLED_MODULE_IDS,
  loadLocalization,
  type SystemSettings,
} from "./settings-shared";
import SettingsHeader from "./SettingsHeader";

const DEFAULT_LOC_SETTINGS: SystemSettings = {
  country: "Nepal",
  currencyCode: "NPR",
  phoneCode: "+977",
  language: "English",
  enableBranches: false,
  showBSDate: false,
  officeLatitude: null,
  officeLongitude: null,
  officeRadius: 100,
};

const fieldClass =
  "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition text-sm font-medium";
const labelClass = "block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2";

export default function LocalizationSettings() {
  const [locSettings, setLocSettings] = useState<SystemSettings>(DEFAULT_LOC_SETTINGS);
  const enabledModulesRef = useRef<string[]>(DEFAULT_ENABLED_MODULE_IDS);
  const [isSavingLoc, setIsSavingLoc] = useState(false);
  const busyRef = useRef(false);

  useEffect(() => {
    const ac = new AbortController();
    loadLocalization(ac.signal)
      .then((result) => {
        if (!result) return;
        setLocSettings(result.settings);
        if (result.moduleIds) enabledModulesRef.current = result.moduleIds;
      })
      .catch(() => {});
    return () => ac.abort();
  }, []);

  const handleCountryChange = (countryName: string) => {
    const data = COUNTRIES.find((c) => c.name === countryName);
    if (data) {
      setLocSettings({
        ...locSettings,
        country: data.name,
        currencyCode: data.currency,
        phoneCode: data.phoneCode,
      });
    } else {
      setLocSettings({ ...locSettings, country: countryName });
    }
  };

  const handleSaveLocalization = async () => {
    if (busyRef.current) return;
    busyRef.current = true;
    setIsSavingLoc(true);
    try {
      const payload = {
        ...locSettings,
        enabledModules: JSON.stringify(enabledModulesRef.current),
      };
      const res = await fetch("/api/settings/localization", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        toast.success("Localization settings saved successfully");
      } else {
        toast.error("Failed to save settings");
      }
    } catch (_err) {
      toast.error("Error connecting to server");
    } finally {
      setIsSavingLoc(false);
      busyRef.current = false;
    }
  };

  const handleToggleBSDate = async () => {
    if (busyRef.current) return;
    const next = !locSettings.showBSDate;
    const updated = { ...locSettings, showBSDate: next };
    busyRef.current = true;
    setLocSettings(updated);
    try {
      const res = await fetch("/api/settings/localization", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      toast.success(next ? "B.S. date will show on dashboard" : "B.S. date hidden on dashboard");
    } catch (err) {
      console.error("BS Date toggle error:", err);
      toast.error(`Failed to update preference${err instanceof Error ? `: ${err.message}` : ""}`);
      setLocSettings((prev) => ({ ...prev, showBSDate: !next }));
    } finally {
      busyRef.current = false;
    }
  };

  return (
    <div className="space-y-6 max-w-2xl animate-fade-in">
      <SettingsHeader
        icon={<Globe size={18} />}
        title="Localization"
        description="Configure your region, currency, and language settings."
      />

      <div className="card p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="settings-country" className={labelClass}>
              Country
            </label>
            <select
              id="settings-country"
              value={locSettings.country}
              onChange={(e) => handleCountryChange(e.target.value)}
              className={`${fieldClass} appearance-none`}
            >
              <option value="">Select a country</option>
              {COUNTRIES.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="settings-currencyCode" className={labelClass}>
              Currency Code
            </label>
            <input
              id="settings-currencyCode"
              type="text"
              value={locSettings.currencyCode}
              onChange={(e) => setLocSettings({ ...locSettings, currencyCode: e.target.value })}
              placeholder="e.g. GBP"
              className={fieldClass}
            />
          </div>

          <div>
            <label htmlFor="settings-phoneCode" className={labelClass}>
              Telephone Code Symbol
            </label>
            <input
              id="settings-phoneCode"
              type="text"
              value={locSettings.phoneCode}
              onChange={(e) => setLocSettings({ ...locSettings, phoneCode: e.target.value })}
              placeholder="e.g. +44"
              className={fieldClass}
            />
          </div>

          <div>
            <label htmlFor="settings-language" className={labelClass}>
              Primary Language
            </label>
            <select
              id="settings-language"
              value={locSettings.language}
              onChange={(e) => setLocSettings({ ...locSettings, language: e.target.value })}
              className={`${fieldClass} appearance-none`}
            >
              <option>English</option>
              <option>Spanish</option>
              <option>French</option>
              <option>German</option>
              <option>Chinese</option>
              <option>Japanese</option>
            </select>
          </div>

          <ToggleRow
            title="Multi-branch Management"
            description="Enable this to manage multiple office locations and branches."
            enabled={locSettings.enableBranches}
            onToggle={() =>
              setLocSettings({ ...locSettings, enableBranches: !locSettings.enableBranches })
            }
            ariaLabel="Toggle multi-branch management"
          />

          <ToggleRow
            title="Show B.S. Date on Dashboard"
            description="Display Nepali Bikram Sambat (B.S.) date alongside the AD date on the main dashboard."
            enabled={!!locSettings.showBSDate}
            onToggle={handleToggleBSDate}
            ariaLabel="Toggle B.S. date on dashboard"
          />

          <GeofenceSection settings={locSettings} onChange={setLocSettings} />
        </div>

        <div className="mt-10 pt-6 border-t border-slate-50 flex justify-end">
          <button
            type="button"
            onClick={handleSaveLocalization}
            disabled={isSavingLoc}
            className="btn-primary px-10 shadow-lg shadow-indigo-100 disabled:opacity-50"
          >
            {isSavingLoc ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-4">
        <div className="size-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
          <Globe size={20} />
        </div>
        <div>
          <h4 className="text-sm font-bold text-blue-900">Platform-wide Impact</h4>
          <p className="text-xs text-blue-700 mt-0.5 leading-relaxed">
            Changing these settings will update date formats, currency symbols, and default phone
            prefixes across the entire UniTrack platform for all users.
          </p>
        </div>
      </div>
    </div>
  );
}

function ToggleRow({
  title,
  description,
  enabled,
  onToggle,
  ariaLabel,
}: {
  title: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
  ariaLabel: string;
}) {
  return (
    <div className="md:col-span-2 py-4 border-t border-slate-50">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-slate-700">{title}</h4>
          <p className="text-xs text-slate-500 mt-1">{description}</p>
        </div>
        <button
          type="button"
          onClick={onToggle}
          aria-label={ariaLabel}
          className={`w-12 h-6 rounded-full transition duration-300 relative ${
            enabled ? "bg-indigo-600" : "bg-slate-200"
          }`}
        >
          <div
            className={`absolute top-1 size-4 rounded-full bg-white transition duration-300 ${
              enabled ? "left-7" : "left-1"
            }`}
          />
        </button>
      </div>
    </div>
  );
}

function GeofenceSection({
  settings,
  onChange,
}: {
  settings: SystemSettings;
  onChange: (value: SystemSettings) => void;
}) {
  const geoFieldClass =
    "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition text-sm";
  const geoLabelClass =
    "block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1";

  return (
    <div className="md:col-span-2 py-4 border-t border-slate-100 mt-4">
      <h4 className="text-sm font-bold text-slate-700 mb-3">Main Office Location (Geofence)</h4>
      <p className="text-xs text-slate-500 mb-4">
        Used for check-in/check-out geolocation validation. Users must be within the set radius to
        mark attendance.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="settings-officeLatitude" className={geoLabelClass}>
            Office Latitude
          </label>
          <input
            id="settings-officeLatitude"
            type="number"
            step="any"
            value={settings.officeLatitude ?? ""}
            onChange={(e) =>
              onChange({
                ...settings,
                officeLatitude: e.target.value ? parseFloat(e.target.value) : null,
              })
            }
            placeholder="e.g. 40.7128"
            className={geoFieldClass}
          />
        </div>
        <div>
          <label htmlFor="settings-officeLongitude" className={geoLabelClass}>
            Office Longitude
          </label>
          <input
            id="settings-officeLongitude"
            type="number"
            step="any"
            value={settings.officeLongitude ?? ""}
            onChange={(e) =>
              onChange({
                ...settings,
                officeLongitude: e.target.value ? parseFloat(e.target.value) : null,
              })
            }
            placeholder="e.g. -74.0060"
            className={geoFieldClass}
          />
        </div>
        <div>
          <label htmlFor="settings-officeRadius" className={geoLabelClass}>
            Radius (meters)
          </label>
          <input
            id="settings-officeRadius"
            type="number"
            min="1"
            value={settings.officeRadius ?? 100}
            onChange={(e) =>
              onChange({
                ...settings,
                officeRadius: e.target.value ? parseInt(e.target.value) : 100,
              })
            }
            placeholder="100"
            className={geoFieldClass}
          />
        </div>
      </div>
    </div>
  );
}
