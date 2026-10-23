"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { ArrowLeft, Clock, Loader2, Mail, ShieldAlert } from "lucide-react";

/**
 * The 409 body a login route returns when the account is already live elsewhere.
 * Shaped loosely on purpose: anything missing falls back to a plain refusal, so an
 * older response never renders a half-empty panel.
 */
export interface BlockedSessionInfo {
  error?: string;
  session?: {
    ip?: string | null;
    userAgent?: string | null;
    lastSeenAt?: number | null;
  };
  relogin?: {
    otpEnabled?: boolean;
    maskedEmail?: string;
    otpSeconds?: number;
    maxAttempts?: number;
    resendSeconds?: number;
  };
}

type Phase = "offer" | "sending" | "sent" | "verifying";

const ACCENTS = {
  indigo: {
    border: "border-indigo-100 bg-indigo-50/60",
    icon: "bg-indigo-600",
    button: "bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500",
    link: "text-indigo-700 hover:text-indigo-800",
  },
  emerald: {
    border: "border-emerald-100 bg-emerald-50/60",
    icon: "bg-emerald-600",
    button: "bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500",
    link: "text-emerald-700 hover:text-emerald-800",
  },
} as const;

/** Seconds as m:ss, so a 2-minute code reads the way a stopwatch does. */
function formatClock(total: number): string {
  const safe = Math.max(0, Math.floor(total));
  return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, "0")}`;
}

/**
 * Lets a person who is genuinely at the keyboard take their own account back.
 *
 * The login form has already refused them: the account is signed in somewhere
 * else, and the rule exists so two people cannot silently share one account. This
 * panel is the second proof of identity — a code delivered to the address on the
 * account — which turns "I know this password" into "this is my account", and
 * signs the other location out when it is accepted.
 *
 * The password is submitted again with every request. It is still in the parent's
 * state, which is why the panel is opened from a failed sign-in rather than
 * reached directly: nobody should be able to ask for a code without the password.
 */
export default function SessionTakeoverRelogin({
  block,
  email,
  password,
  portal,
  accent = "indigo",
  onSignedIn,
  onCancel,
}: {
  block: BlockedSessionInfo;
  email: string;
  password: string;
  /** Which account table the code is issued against, mirroring the login form. */
  portal?: "super-admin" | "student";
  accent?: keyof typeof ACCENTS;
  /** Called once the code has been accepted and the new session cookie is set. */
  onSignedIn: () => void | Promise<void>;
  /** Back to the plain password form. */
  onCancel: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("offer");
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [maskedEmail, setMaskedEmail] = useState(block.relogin?.maskedEmail || "");
  const [codeSeconds, setCodeSeconds] = useState(0);
  const [resendSeconds, setResendSeconds] = useState(0);
  const busy = phase === "sending" || phase === "verifying";
  const theme = ACCENTS[accent];

  // One timer for both counters, running only while a code is outstanding. It
  // stops with the panel rather than ticking in the background: a code that the
  // person walked away from is worthless, and the server expiry is the authority.
  useEffect(() => {
    if (phase !== "sent") return;
    const timer = setInterval(() => {
      setCodeSeconds((s) => (s > 0 ? s - 1 : 0));
      setResendSeconds((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [phase]);

  const request = async () => {
    setPhase("sending");
    setMessage("");
    try {
      const res = await fetch("/api/auth/session-otp", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, ...(portal ? { portal } : {}) }),
      });
      const data = (await res.json().catch(() => null)) as {
        sent?: boolean;
        code?: string;
        error?: string;
        maskedEmail?: string;
        otpSeconds?: number;
        resendSeconds?: number;
      } | null;

      if (data?.sent) {
        setMaskedEmail(data.maskedEmail || maskedEmail);
        setCodeSeconds(data.otpSeconds || 120);
        setResendSeconds(data.resendSeconds || 30);
        setOtp("");
        setPhase("sent");
        return;
      }

      // Anything else is a dead end for now: the session has been released, the
      // codes are switched off, or the mail could not be sent. Either way the
      // person is better off at the password form than staring at a disabled box.
      setPhase("offer");
      setMessage(data?.error || "The code could not be sent. Please try again.");
    } catch {
      setPhase("offer");
      setMessage("Could not reach the server. Please check your connection.");
    }
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setPhase("verifying");
    setMessage("");
    try {
      const res = await fetch("/api/auth/session-otp/verify", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, otp, ...(portal ? { portal } : {}) }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          error?: string;
          code?: string;
        } | null;
        setMessage(data?.error || "That code was not accepted.");
        // A spent, expired or locked-out code cannot be typed again, so the box
        // goes back to the request button instead of counting down to nothing.
        const dead =
          data?.code === "EXPIRED" ||
          data?.code === "TOO_MANY_ATTEMPTS" ||
          data?.code === "NOT_FOUND";
        if (dead) {
          setCodeSeconds(0);
          setPhase("offer");
        } else {
          setPhase("sent");
        }
        return;
      }

      await onSignedIn();
    } catch {
      setPhase("sent");
      setMessage("Could not reach the server. Please try again.");
    }
  };

  const codeExpired = phase === "sent" && codeSeconds === 0;
  // The code box stays on screen while it is being checked: swapping to the
  // request button mid-request would read as a failure before the server has
  // even answered.
  const showingCode = phase === "sent" || phase === "verifying";
  const minutes = block.relogin?.otpSeconds ? Math.round(block.relogin.otpSeconds / 60) : 2;
  const session = block.session;
  const hasSessionDetails = Boolean(session?.userAgent || session?.ip || session?.lastSeenAt);

  return (
    <div className={`mb-6 rounded-xl border p-5 ${theme.border}`}>
      <div className="flex items-start gap-3 mb-3">
        <div
          className={`size-8 rounded-lg flex items-center justify-center flex-shrink-0 ${theme.icon}`}
        >
          <ShieldAlert className="size-4 text-white" />
        </div>
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-slate-800">Already signed in elsewhere</h2>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            {block.error ||
              "The user is already logged in at another location. Please logout from the location before logging in to the system."}
          </p>
        </div>
      </div>

      {hasSessionDetails && (
        <div className="mb-4 text-xs text-slate-500 space-y-1 pl-11">
          {session?.lastSeenAt ? (
            <p>Last active {new Date(session.lastSeenAt).toLocaleString()}</p>
          ) : null}
          {session?.ip ? <p>From {session.ip}</p> : null}
          {session?.userAgent ? <p className="break-words">{session.userAgent}</p> : null}
        </div>
      )}

      {showingCode && (
        <form onSubmit={submit} className="space-y-3">
          <p className="text-xs text-slate-600">
            We have sent a 6-digit code to{" "}
            <span className="font-semibold text-slate-800">{maskedEmail || "your email"}</span>. It
            expires in {minutes} minutes.
          </p>
          <div>
            <label htmlFor="session-otp" className="block text-sm font-medium text-slate-700 mb-2">
              Verification code
            </label>
            <input
              id="session-otp"
              inputMode="numeric"
              autoComplete="one-time-code"
              autoFocus
              maxLength={6}
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-center tracking-[0.5em] text-lg font-semibold text-slate-800 focus:border-indigo-500 focus:ring-indigo-500 outline-none"
              placeholder="000000"
            />
          </div>
          {codeExpired && (
            <p className="text-xs font-medium text-amber-700">
              This code has expired. Request a new one.
            </p>
          )}
          <button
            type="submit"
            disabled={busy || otp.length < 6}
            className={`w-full flex justify-center items-center py-3 px-4 rounded-xl text-sm font-medium text-white transition-colors disabled:opacity-70 ${theme.button} focus:outline-none focus:ring-2 focus:ring-offset-2`}
          >
            {phase === "verifying" ? (
              <>
                <Loader2 className="animate-spin -ml-1 mr-2 size-4" />
                Verifying…
              </>
            ) : (
              "Verify and sign in"
            )}
          </button>
        </form>
      )}

      {!showingCode && (
        <div className="space-y-3">
          <p className="text-xs text-slate-600 leading-relaxed">
            If that is not you right now — a laptop left open, a phone tab you forgot — sign out
            there. Or confirm you own this account with a code sent to its registered email.
          </p>
          <button
            type="button"
            onClick={() => void request()}
            disabled={busy}
            className={`w-full flex justify-center items-center py-3 px-4 rounded-xl text-sm font-medium text-white transition-colors disabled:opacity-70 ${theme.button} focus:outline-none focus:ring-2 focus:ring-offset-2`}
          >
            {phase === "sending" ? (
              <>
                <Loader2 className="animate-spin -ml-1 mr-2 size-4" />
                Sending code…
              </>
            ) : (
              <>
                <Mail className="-ml-1 mr-2 size-4" />
                Relogin with email code
              </>
            )}
          </button>
        </div>
      )}

      {showingCode && (
        <div className="mt-3 flex items-center justify-between text-xs">
          <span className="inline-flex items-center gap-1 text-slate-500 tabular-nums">
            <Clock className="size-3.5" />
            {formatClock(codeSeconds)} left
          </span>
          <button
            type="button"
            onClick={() => void request()}
            disabled={busy || codeSeconds > 0 || resendSeconds > 0}
            className={`${theme.link} font-medium disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {resendSeconds > 0 && codeSeconds > 0 ? `Resend in ${resendSeconds}s` : "Resend code"}
          </button>
        </div>
      )}

      {message && (
        <p className="mt-3 text-xs font-medium text-red-600 leading-relaxed">{message}</p>
      )}

      <button
        type="button"
        onClick={onCancel}
        className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 transition-colors"
      >
        <ArrowLeft className="size-3.5" />
        Back to sign in
      </button>
    </div>
  );
}
