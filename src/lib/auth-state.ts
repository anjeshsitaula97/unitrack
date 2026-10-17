export interface AppUser {
  id: number;
  name?: string | null;
  email?: string | null;
  role?: string | null;
  avatar?: string | null;
  subscriptionPackage?: string | null;
  subscriptionExpiry?: string | null;
  isFirstLogin?: boolean | null;
  consultancy?: { id: number; code: string; name: string; logoUrl: string | null } | null;
}

export interface AuthState {
  user: AppUser;
  role: string;
}

let cached: AuthState | null | undefined = undefined;
let inFlight: Promise<AuthState | null> | null = null;

export function getCachedAuthState(): AuthState | null | undefined {
  return cached;
}

export function setCachedAuthState(state: AuthState | null): void {
  cached = state;
}

export function clearAuthCache(): void {
  cached = undefined;
  inFlight = null;
}

export async function revalidateAuthState(): Promise<AuthState | null> {
  try {
    const res = await fetch("/api/auth/me", { cache: "no-store", credentials: "include" });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data?.id) return null;
    return { user: data, role: (data.role || "Student").toLowerCase() };
  } catch (err) {
    console.error("Failed to fetch user:", err);
    return null;
  }
}

export function loadAuthState(): Promise<AuthState | null> {
  if (inFlight === null) {
    inFlight = revalidateAuthState().finally(() => {
      inFlight = null;
    });
  }
  return inFlight;
}
