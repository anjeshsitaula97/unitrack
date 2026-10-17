"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import { toast } from "sonner";
import SettingsHeader from "./SettingsHeader";

const DEFAULT_NOTIF_PREFS = [
  {
    id: "appStatus",
    label: "Application Status Updates",
    desc: "Receive alerts when your admission status changes.",
    email: true,
    push: true,
  },
  {
    id: "payment",
    label: "Payment Reminders",
    desc: "Notifications for upcoming tuition and fee deadlines.",
    email: true,
    push: false,
  },
  {
    id: "scholarship",
    label: "Scholarship & Rewards",
    desc: "Stay updated on new funding opportunities.",
    email: true,
    push: false,
  },
  {
    id: "marketing",
    label: "Marketing & Institution News",
    desc: "Occasional news about campus events and programs.",
    email: false,
    push: false,
  },
];

export default function NotificationSettings() {
  const [notifPrefs, setNotifPrefs] = useState(DEFAULT_NOTIF_PREFS);

  const toggleNotif = (id: string, key: "email" | "push") => {
    setNotifPrefs((prev) => prev.map((p) => (p.id === id ? { ...p, [key]: !p[key] } : p)));
  };

  const resetNotifPrefs = () => {
    setNotifPrefs(DEFAULT_NOTIF_PREFS.map((p) => ({ ...p })));
    toast.success("Notification preferences reset to default");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <SettingsHeader
        icon={<Bell size={18} />}
        title="Notification Preferences"
        description="Choose how you want to receive alerts across the platform."
      />

      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-slate-800">Alert Preferences</h3>
          <button
            type="button"
            onClick={resetNotifPrefs}
            className="text-sm font-semibold text-indigo-600 hover:underline"
          >
            Reset to Default
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Alert Type
                </th>
                <th className="text-center py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Email
                </th>
                <th className="text-center py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  SMS / Push
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {notifPrefs.map((pref) => (
                <tr key={pref.id}>
                  <td className="py-4">
                    <p className="text-sm font-medium text-slate-800">{pref.label}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{pref.desc}</p>
                  </td>
                  <td className="text-center py-4">
                    <input
                      type="checkbox"
                      aria-label={`${pref.label} email alerts`}
                      checked={pref.email}
                      onChange={() => toggleNotif(pref.id, "email")}
                      className="size-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                  </td>
                  <td className="text-center py-4">
                    <input
                      type="checkbox"
                      aria-label={`${pref.label} SMS and push alerts`}
                      checked={pref.push}
                      onChange={() => toggleNotif(pref.id, "push")}
                      className="size-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex gap-4">
        <div className="size-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0">
          <Bell size={20} />
        </div>
        <div>
          <h4 className="text-sm font-bold text-indigo-900">Email delivery</h4>
          <p className="text-xs text-indigo-700 mt-0.5 leading-relaxed">
            Email alerts are sent through the SMTP server configured in Email Settings. SMS and push
            notifications are delivered through the connected channel providers.
          </p>
        </div>
      </div>
    </div>
  );
}
