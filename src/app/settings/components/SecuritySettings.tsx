"use client";

import { Lock, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import SettingsHeader from "./SettingsHeader";

export default function SecuritySettings() {
  return (
    <div className="space-y-6 max-w-2xl">
      <SettingsHeader
        icon={<ShieldCheck size={18} />}
        title="Account Security"
        description="Manage your password and session settings."
      />

      <div className="card p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="size-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
            <Lock size={24} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">Change Password</h3>
            <p className="text-xs text-slate-400">
              Regularly updating your password is recommended for safety.
            </p>
          </div>
        </div>

        <form className="space-y-4" autoComplete="off">
          <input
            type="password"
            id="current-password"
            name="current-password"
            aria-label="Current password"
            placeholder="Current Password"
            autoComplete="current-password"
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="password"
            id="new-password"
            name="new-password"
            aria-label="New password"
            placeholder="New Password"
            autoComplete="new-password"
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="password"
            id="confirm-password"
            name="confirm-password"
            aria-label="Confirm new password"
            placeholder="Confirm New Password"
            autoComplete="new-password"
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button type="button" className="btn-primary w-full shadow-lg shadow-indigo-100">
            Update Password
          </button>
        </form>
      </div>

      <div className="bg-slate-50 border border-red-200 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-red-600">Deactivate Account</h3>
          <p className="text-xs text-slate-500 mt-1">
            This action will suspend your access to all applications and documents.
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            toast.message("Deactivate Account", {
              description: "Contact your administrator to deactivate this account.",
            })
          }
          className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 active:scale-95 transition flex-shrink-0"
        >
          Deactivate
        </button>
      </div>
    </div>
  );
}
