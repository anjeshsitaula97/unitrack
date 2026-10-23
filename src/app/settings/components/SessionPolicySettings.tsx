"use client";

import { useEffect, useRef, useState } from "react";
import { MailCheck, TimerReset } from "lucide-react";
import { toast } from "sonner";

const FALLBACK_MIN = 1;
const FALLBACK_MAX = 720;

/**
 * Platform-wide session policy.
 *
 * One number drives two rules: how long an account may sit idle before it is
 * signed out automatically, and how long a session therefore counts as "still
 * open at another location" when someone tries to sign in again. Keeping them
 * linked is what stops a login from being refused over a session the server has
 * already expired, so the card explains both behaviours together.
 *
 * Underneath them sits the email-code relogin: the way out of that refusal for
 * somebody who can prove they own the account, and therefore the amount of the
 * window people actually have to wait.
 *
 * The values are stored on the platform row and apply to every consultancy; only
 * a Super Admin may change them, which the API reports through `canManage`.
 */
export default function SessionPolicySettings() {
  const [minutes, setMinutes] = useState("");
  const [min, setMin] = useState(FALLBACK_MIN);
  const [max, setMax] = useState(FALLBACK_MAX);
  const [canManage, setCanManage] = useState(false);
  const [otpTakeover, setOtpTakeover] = useState(true);
  const [isSavingTakeover, setIsSavingTakeover] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const busyRef = useRef(false);

  useEffect(() => {
    const ac = new AbortController();
    fetch("/api/settings/security", { signal: ac.signal, cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) throw new Error();
        const data = await res.json();
        setMinutes(String(data?.sessionIdleTimeoutMinutes ?? ""));
        if (Number.isFinite(data?.minSessionIdleTimeoutMinutes)) {
          setMin(Number(data.minSessionIdleTimeoutMinutes));
        }
        if (Number.isFinite(data?.maxSessionIdleTimeoutMinutes)) {
          setMax(Number(data.maxSessionIdleTimeoutMinutes));
        }
        setCanManage(Boolean(data?.canManage));
        // A missing key means an older API response, not a switched-off system.
        setOtpTakeover(data?.sessionOtpTakeoverEnabled !== false);
        setIsLoading(false);
      })
      .catch(() => {
        if (!ac.signal.aborted) {
          setIsLoading(false);
          toast.error("Failed to load session settings");
        }
      });
    return () => ac.abort();
  }, []);

  const handleSave = async () => {
    if (busyRef.current) return;
    const value = Number(minutes);
    if (!Number.isFinite(value) || value < min || value > max) {
      toast.error(`Enter whole minutes between ${min} and ${max}`);
      return;
    }
    busyRef.current = true;
    setIsSaving(true);
    try {
      const res = await fetch("/api/settings/security", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionIdleTimeoutMinutes: Math.round(value) }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "Failed to save session settings");
        return;
      }
      toast.success(`Accounts sign out after ${Math.round(value)} minutes of inactivity`);
    } catch (_err) {
      toast.error("Error saving session settings");
    } finally {
      busyRef.current = false;
      setIsSaving(false);
    }
  };

  const handleToggleTakeover = async () => {
    if (busyRef.current || isLoading || isSavingTakeover || !canManage) return;
    const next = !otpTakeover;
    setOtpTakeover(next);
    setIsSavingTakeover(true);
    try {
      const res = await fetch("/api/settings/security", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Only the switch: the timeout is saved from its own field, so a
        // half-typed number cannot be written by flipping this.
        body: JSON.stringify({ sessionOtpTakeoverEnabled: next }),
      });
      if (!res.ok) {
        setOtpTakeover(!next);
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "Failed to update the email-code setting");
        return;
      }
      toast.success(
        next
          ? "Relogin with an email code is now offered"
          : "Relogin with an email code is now switched off"
      );
    } catch (_err) {
      setOtpTakeover(!next);
      toast.error("Error updating the email-code setting");
    } finally {
      setIsSavingTakeover(false);
    }
  };

  const disabled = isLoading || isSaving || !canManage;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="bg-indigo-50 p-2.5 rounded-xl text-indigo-600">
          <TimerReset size={18} />
        </span>
        <div>
          <h3 className="text-sm font-bold text-slate-700">Session &amp; Inactivity Policy</h3>
          <p className="text-xs text-slate-400">
            Applies to every consultancy. Only a Super Admin can change it.
          </p>
        </div>
      </div>

      <p className="mt-4 text-sm text-slate-500 leading-relaxed">
        An account may only be signed in from one location. While its session is still active, a
        sign-in attempt made elsewhere is refused until that session is signed out or has been idle
        for longer than the window below.
      </p>

      <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <label className="text-sm font-medium text-slate-600" htmlFor="idle-timeout-minutes">
          Log out after
        </label>
        <input
          id="idle-timeout-minutes"
          type="number"
          min={min}
          max={max}
          step={1}
          inputMode="numeric"
          value={minutes}
          disabled={disabled}
          onChange={(e) => setMinutes(e.target.value)}
          className="w-full sm:w-32 px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:opacity-60"
        />
        <span className="text-sm text-slate-500">minutes of inactivity</span>
        {canManage && (
          <button
            type="button"
            onClick={handleSave}
            disabled={disabled}
            className="sm:ml-auto inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-60"
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
        )}
      </div>

      {!canManage && !isLoading && (
        <p className="mt-3 text-xs text-slate-400">
          Read-only: ask a Super Admin to change the window. It currently applies to this
          consultancy as well.
        </p>
      )}

      <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between gap-4">
        <div className="flex gap-4">
          <div className="size-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
            <MailCheck size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Relogin with an email code</h3>
            <p className="text-xs text-slate-500 mt-0.5 max-w-prose leading-relaxed">
              When a sign-in is refused because the account is already live elsewhere, offer a
              6-digit code emailed to the registered address. Entering it signs that other location
              out straight away. Switched off, the person has to sign out there first, or be signed
              out with “Sign Out Session” in Access.
            </p>
          </div>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={otpTakeover}
          aria-label="Relogin with an email code"
          disabled={isLoading || isSavingTakeover || !canManage}
          onClick={handleToggleTakeover}
          className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors disabled:opacity-50 ${
            otpTakeover ? "bg-indigo-600" : "bg-slate-300"
          }`}
        >
          <span
            className={`inline-block size-5 transform rounded-full bg-white shadow transition-transform ${
              otpTakeover ? "translate-x-5" : "translate-x-0.5"
            }`}
          />
        </button>
      </div>
    </div>
  );
}
