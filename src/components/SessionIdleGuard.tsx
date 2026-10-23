"use client";

import { useEffect, useRef } from "react";
import { clearAuthCache } from "@/lib/auth-state";
import { deactivateSession } from "@/lib/client-session";
import { getLoginPathFor } from "@/lib/role-home";
import { IDLE_LOGOUT_REASON, REPLACED_LOGOUT_REASON } from "@/lib/session-policy";

/** How often the guard checks the clock and, when allowed, stamps the session. */
const TICK_INTERVAL_MS = 15_000;

/**
 * Interaction events treated as "the person is here". Deliberately excludes
 * mousemove: a cursor resting on the pad would keep a session alive forever.
 */
const ACTIVITY_EVENTS = ["pointerdown", "keydown", "wheel", "touchstart"] as const;

/**
 * Signs the account out once it has been idle for the configured number of
 * minutes and releases its session, so the person can sign in again from
 * anywhere instead of being told they are still logged in elsewhere.
 *
 * It also notices the opposite case: when another location signs in with an
 * emailed ownership code, this tab's session is superseded, and it is sent to the
 * login page saying so instead of claiming the person was away.
 *
 * The server is the authority (an expired session stops being accepted even
 * without this component), but the browser has to act too: only it knows
 * whether anybody is actually at the keyboard, and only it can call logout.
 *
 * The subject does not need to be passed in: the session endpoints read the
 * cookie that belongs to the portal this shell is rendering.
 */
export default function SessionIdleGuard() {
  // Stamped by the effect on mount; initialising it with Date.now() here would
  // make the render impure.
  const lastActivityRef = useRef(0);

  useEffect(() => {
    let idleMs = 0;
    let expired = false;

    const markActivity = () => {
      lastActivityRef.current = Date.now();
    };

    const expire = async (reason: string) => {
      if (expired) return;
      expired = true;
      // A session that was taken over is already ended, and this tab's cookie is
      // the account's cookie: calling logout here would clear the cookie the
      // newer location is signing with. Only an inactivity sign-out has a live
      // session to release.
      if (reason !== REPLACED_LOGOUT_REASON) {
        try {
          // Best effort. If the request never lands the session is still dead
          // server-side once the window passes; the redirect is what the user sees.
          await fetch("/api/auth/logout", {
            method: "POST",
            credentials: "include",
          });
        } catch {
          // Ignore and continue signing out locally.
        }
      }
      clearAuthCache();
      deactivateSession();
      const target = getLoginPathFor(window.location.pathname);
      window.location.replace(`${target}?reason=${reason}`);
    };

    const tick = async () => {
      if (expired) return;
      // Nothing to enforce until the budget is known (for instance when the
      // policy request failed); the server-side check still applies.
      if (!idleMs) return;

      const idle = Date.now() - lastActivityRef.current;
      if (idle >= idleMs) {
        await expire(IDLE_LOGOUT_REASON);
        return;
      }

      // Only refresh a session somebody is using, and stop refreshing once the
      // tab has been quiet for half the window: otherwise the last heartbeat
      // would silently extend the session for a whole extra window after the
      // browser was closed.
      if (idle > idleMs / 2) return;
      if (document.visibilityState !== "visible") return;

      try {
        const res = await fetch("/api/session/heartbeat", {
          method: "POST",
          credentials: "include",
          cache: "no-store",
        });
        // A 401 means the server already ended this session; the body says why.
        // A superseded session must not be reported as an idle timeout — the
        // account holder needs to know somebody else signed in.
        if (res.status === 401) {
          const body = (await res.json().catch(() => null)) as { code?: string } | null;
          await expire(
            body?.code === "SESSION_REPLACED" ? REPLACED_LOGOUT_REASON : IDLE_LOGOUT_REASON
          );
        }
      } catch {
        // Offline or transient failure: the next tick retries, and the client
        // timer alone still enforces the sign-out.
      }
    };

    const onVisibilityChange = () => {
      // Background tabs throttle timers, so a laptop resumed after being closed
      // has to be re-evaluated the moment it becomes visible again.
      if (document.visibilityState === "visible") void tick();
    };

    const boot = async () => {
      try {
        const res = await fetch("/api/session/policy", {
          credentials: "include",
          cache: "no-store",
        });
        if (!res.ok) return;
        const data = (await res.json()) as { idleTimeoutMinutes?: number };
        const minutes = Number(data?.idleTimeoutMinutes);
        if (Number.isFinite(minutes) && minutes > 0) idleMs = minutes * 60_000;
      } catch {
        // No policy readable: this component stays inert.
      }
    };

    markActivity();
    for (const event of ACTIVITY_EVENTS) {
      window.addEventListener(event, markActivity, { capture: true, passive: true });
    }
    document.addEventListener("visibilitychange", onVisibilityChange);
    const timer = setInterval(() => void tick(), TICK_INTERVAL_MS);
    void boot();

    return () => {
      clearInterval(timer);
      for (const event of ACTIVITY_EVENTS) {
        window.removeEventListener(event, markActivity, { capture: true });
      }
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  // Purely behavioural: no markup.
  return null;
}
