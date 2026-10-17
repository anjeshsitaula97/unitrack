"use client";

import { useEffect, useRef, useState } from "react";
import { Puzzle } from "lucide-react";
import { toast } from "sonner";
import { MODULES } from "@/lib/modules";
import {
  DEFAULT_ENABLED_MODULE_IDS,
  loadLocalization,
  type SystemSettings,
} from "./settings-shared";
import ModuleIcon from "./ModuleIcon";
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

export default function ModulesSettings() {
  const locSettingsRef = useRef<SystemSettings>(DEFAULT_LOC_SETTINGS);
  const [enabledModules, setEnabledModules] = useState<string[]>(DEFAULT_ENABLED_MODULE_IDS);
  const [isSavingModules, setIsSavingModules] = useState(false);
  const busyRef = useRef(false);

  useEffect(() => {
    const ac = new AbortController();
    loadLocalization(ac.signal)
      .then((result) => {
        if (!result) return;
        locSettingsRef.current = result.settings;
        if (result.moduleIds) setEnabledModules(result.moduleIds);
      })
      .catch(() => {});
    return () => ac.abort();
  }, []);

  const handleSaveModules = async () => {
    if (busyRef.current) return;
    if (enabledModules.length === 0) {
      toast.error("At least one module must remain enabled");
      return;
    }
    busyRef.current = true;
    setIsSavingModules(true);
    try {
      const payload = { ...locSettingsRef.current, enabledModules: JSON.stringify(enabledModules) };
      const res = await fetch("/api/settings/localization", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        toast.success("Module settings saved. Refresh to see changes.");
      } else {
        toast.error("Failed to save module settings");
      }
    } catch {
      toast.error("Error connecting to server");
    } finally {
      setIsSavingModules(false);
      busyRef.current = false;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div className="flex items-center justify-between">
        <SettingsHeader
          icon={<Puzzle size={18} />}
          title="Feature Modules"
          description="Enable or disable modules across the platform. Disabled modules are hidden from the sidebar and their routes are blocked."
        />
        <button
          type="button"
          onClick={handleSaveModules}
          disabled={isSavingModules}
          className="btn-primary px-6 shadow-lg shadow-indigo-100 disabled:opacity-50"
        >
          {isSavingModules ? "Saving..." : "Save Modules"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {MODULES.map((mod) => {
          const isEnabled = enabledModules.includes(mod.id);
          return (
            <div
              key={mod.id}
              className={`card p-5 transition duration-200 ${isEnabled ? "border-indigo-200 bg-white" : "border-slate-200 bg-slate-50/60 opacity-60"}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1.5">
                    <div
                      className={`size-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${isEnabled ? "bg-indigo-50 text-indigo-600" : "bg-slate-200/70 text-slate-500"}`}
                    >
                      <ModuleIcon name={mod.icon} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                        {mod.label}
                        <span
                          className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${isEnabled ? "bg-indigo-100 text-indigo-600" : "bg-slate-200 text-slate-500"}`}
                        >
                          {isEnabled ? "ON" : "OFF"}
                        </span>
                      </h4>
                      <p className="text-xs text-slate-500 leading-relaxed">{mod.description}</p>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1.5 font-mono pl-12">
                    {mod.routes.join(", ")}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEnabledModules((prev) =>
                      prev.includes(mod.id) ? prev.filter((id) => id !== mod.id) : [...prev, mod.id]
                    );
                  }}
                  aria-label={`${isEnabled ? "Disable" : "Enable"} ${mod.label} module`}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                    isEnabled ? "bg-indigo-600" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      isEnabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-4">
        <div className="size-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 flex-shrink-0">
          <Puzzle size={20} />
        </div>
        <div>
          <h4 className="text-sm font-bold text-amber-900">Module Visibility</h4>
          <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
            Disabled modules are immediately hidden from the sidebar and their routes return a
            redirect. A page refresh may be needed for sidebar changes to take effect.
          </p>
        </div>
      </div>
    </div>
  );
}
