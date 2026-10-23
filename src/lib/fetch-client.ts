import { toast } from "sonner";

interface FetchOptions extends RequestInit {
  showError?: boolean;
  showSuccess?: boolean;
  successMessage?: string;
}

class FetchError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: unknown
  ) {
    super(message);
    this.name = "FetchError";
  }
}

/**
 * Redirects to the login page once, after the session has been rejected by the
 * server. The guard keeps a burst of parallel 401s from stacking navigation
 * calls.
 */
let redirectingToLogin = false;

function handleUnauthorized() {
  if (redirectingToLogin) return;
  redirectingToLogin = true;
  if (typeof window !== "undefined") {
    // `replace` so the expired page does not stay in the history stack.
    window.location.replace("/login");
  }
}

async function apiFetch<T = unknown>(url: string, options: FetchOptions = {}): Promise<T> {
  const { showError = true, showSuccess = false, successMessage, ...fetchOptions } = options;

  try {
    const res = await fetch(url, {
      headers: { "Content-Type": "application/json", ...fetchOptions.headers },
      ...fetchOptions,
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      const errorMsg = errorData?.error || `Request failed with status ${res.status}`;
      // A 401 means the session is gone — expired, revoked, or superseded by a
      // newer login on another device. Send the user back to the login form
      // instead of leaving them on a dead page.
      if (res.status === 401 && !url.startsWith("/api/auth/")) {
        // The session is gone and we redirect to /login below. A toast here
        // would flash "Unauthorized" on every in-flight call during a logout,
        // so it is intentionally suppressed; callers can react to the thrown
        // FetchError (status 401) instead.
        handleUnauthorized();
      } else if (showError) {
        toast.error(errorMsg);
      }
      throw new FetchError(res.status, errorMsg, errorData);
    }

    const data = await res.json().catch(() => null);

    if (showSuccess) {
      toast.success(successMessage || "Operation completed successfully");
    }

    return data as T;
  } catch (err) {
    if (err instanceof FetchError) throw err;
    const errorMsg = err instanceof Error ? err.message : "Network error";
    if (showError) {
      toast.error(errorMsg);
    }
    throw new FetchError(0, errorMsg);
  }
}

export async function safeJson(res: Response) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export interface UploadProgress {
  loaded: number;
  total: number;
}

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, i);
  const decimals = i === 0 ? 0 : value >= 100 ? 0 : value >= 10 ? 1 : 2;
  return `${value.toFixed(decimals)} ${units[i]}`;
}

export function uploadWithProgress<T = unknown>(
  url: string,
  formData: FormData,
  onProgress?: (progress: UploadProgress) => void
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    xhr.withCredentials = true;

    xhr.upload.onprogress = (event) => {
      if (onProgress && event.lengthComputable) {
        onProgress({ loaded: event.loaded, total: event.total });
      }
    };

    xhr.onload = () => {
      let data: unknown = null;
      if (xhr.responseText) {
        try {
          data = JSON.parse(xhr.responseText);
        } catch {
          data = null;
        }
      }
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(data as T);
      } else {
        const message =
          (data as { error?: string } | null)?.error || `Upload failed (${xhr.status})`;
        reject(new Error(message));
      }
    };

    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.onabort = () => reject(new Error("Upload cancelled"));

    xhr.send(formData);
  });
}

export const api = {
  get: <T = unknown>(url: string, options?: FetchOptions) =>
    apiFetch<T>(url, { method: "GET", ...options }),

  post: <T = unknown>(url: string, body?: unknown, options?: FetchOptions) =>
    apiFetch<T>(url, { method: "POST", body: body ? JSON.stringify(body) : undefined, ...options }),

  put: <T = unknown>(url: string, body?: unknown, options?: FetchOptions) =>
    apiFetch<T>(url, { method: "PUT", body: body ? JSON.stringify(body) : undefined, ...options }),

  delete: <T = unknown>(url: string, options?: FetchOptions) =>
    apiFetch<T>(url, { method: "DELETE", ...options }),

  upload: <T = unknown>(url: string, formData: FormData, options?: FetchOptions) =>
    apiFetch<T>(url, { method: "POST", body: formData, ...options }),
};
