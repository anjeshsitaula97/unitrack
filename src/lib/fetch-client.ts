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
    public data?: any
  ) {
    super(message);
    this.name = "FetchError";
  }
}

async function apiFetch<T = any>(url: string, options: FetchOptions = {}): Promise<T> {
  const { showError = true, showSuccess = false, successMessage, ...fetchOptions } = options;

  try {
    const res = await fetch(url, {
      headers: { "Content-Type": "application/json", ...fetchOptions.headers },
      ...fetchOptions,
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      const errorMsg = data?.error || `Request failed with status ${res.status}`;
      if (showError) {
        toast.error(errorMsg);
      }
      throw new FetchError(res.status, errorMsg, data);
    }

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

export async function safeJson(res: Response): Promise<any> {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export const api = {
  get: <T = any>(url: string, options?: FetchOptions) =>
    apiFetch<T>(url, { method: "GET", ...options }),

  post: <T = any>(url: string, body?: any, options?: FetchOptions) =>
    apiFetch<T>(url, { method: "POST", body: body ? JSON.stringify(body) : undefined, ...options }),

  put: <T = any>(url: string, body?: any, options?: FetchOptions) =>
    apiFetch<T>(url, { method: "PUT", body: body ? JSON.stringify(body) : undefined, ...options }),

  delete: <T = any>(url: string, options?: FetchOptions) =>
    apiFetch<T>(url, { method: "DELETE", ...options }),

  upload: <T = any>(url: string, formData: FormData, options?: FetchOptions) =>
    apiFetch<T>(url, { method: "POST", body: formData, ...options }),
};
