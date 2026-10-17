"use client";

import React, { useState, useEffect } from "react";
import { Key, Copy, Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

const handleCopy = (token: string) => {
  navigator.clipboard.writeText(token);
  toast.success("API key copied to clipboard");
};

interface ApiKey {
  id: number;
  name: string;
  created: string;
  lastUsed: string | null;
}

interface RevealedKey {
  name: string;
  token: string;
}

export default function ApiKeysContent() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [revealedKey, setRevealedKey] = useState<RevealedKey | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const refreshKeys = async () => {
    try {
      const res = await fetch("/api/api-keys");
      if (!res.ok) throw new Error("API Error");
      const data = await res.json();
      setKeys(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load API keys database");
    }
  };

  useEffect(() => {
    const ac = new AbortController();
    fetch("/api/api-keys", { signal: ac.signal })
      .then((res) => {
        if (!res.ok) throw new Error("API Error");
        return res.json();
      })
      .then((data) => {
        setKeys(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (err?.name !== "AbortError") {
          toast.error("Failed to load API keys database");
          setKeys([]);
        }
      })
      .finally(() => {
        setIsLoadingData(false);
      });
    return () => ac.abort();
  }, []);

  const handleGenerate = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      const res = await fetch("/api/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "New Integration Key" }),
      });
      if (!res.ok) {
        toast.error("Failed to generate key");
        return;
      }
      const newKey = await res.json();
      if (newKey?.token) {
        setRevealedKey({ name: newKey.name, token: newKey.token });
      }
      await refreshKeys();
      toast.success("Successfully generated new API Key");
    } catch (_err) {
      toast.error("Error connecting to backend");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (
      !confirm(
        "Are you sure you want to revoke this API key? This action is permanent and will break any integrations using this key."
      )
    )
      return;

    try {
      const res = await fetch(`/api/api-keys/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setKeys(keys.filter((k) => k.id !== id));
        toast.success("API key revoked successfully");
      } else {
        toast.error("Failed to revoke key");
      }
    } catch (_err) {
      toast.error("Error connecting to backend");
    }
  };

  return (
    <div className="animate-fade-in relative block min-h-[400px]">
      {isLoadingData && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-xl">
          <Loader2 className="animate-spin text-indigo-500" size={32} />
        </div>
      )}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 mb-1">API Keys</h1>
          <p className="text-sm text-slate-400">
            {keys.length.toLocaleString()} active integration keys
          </p>
        </div>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={isSaving}
          className="btn-primary disabled:opacity-50"
          aria-label="Add"
        >
          {" "}
          <Plus size={15} /> Generate New Key
        </button>
      </div>

      {revealedKey && (
        <div className="card p-5 mb-6 border-indigo-100 bg-indigo-50">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h4 className="text-sm font-bold text-slate-800">
                {revealedKey.name} created — copy it now
              </h4>
              <p className="text-xs mt-1 text-slate-600">
                For security, this key is only shown once. Store it somewhere safe before dismissing
                this message.
              </p>
              <div className="mt-3 flex items-center gap-2 bg-white px-3 py-2 rounded-md border border-indigo-100 max-w-xl">
                <code className="text-xs text-slate-700 font-mono break-all">
                  {revealedKey.token}
                </code>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={() => handleCopy(revealedKey.token)}
                className="px-3 py-2 bg-indigo-600 rounded-lg text-xs font-semibold text-white hover:bg-indigo-700 flex items-center gap-1.5"
              >
                <Copy size={13} /> Copy
              </button>
              <button
                type="button"
                onClick={() => setRevealedKey(null)}
                className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="card p-5 mb-6">
        <div className="flex items-center gap-3 text-amber-700 bg-amber-50 p-4 rounded-lg border border-amber-100">
          <Key className="flex-shrink-0" size={24} />
          <div>
            <h4 className="text-sm font-bold">Keep these keys secret</h4>
            <p className="text-xs mt-1">
              These keys allow programmatic access to your entire platform. Do not share them in
              public repositories or client-side code.
            </p>
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50/60">
            <tr className="border-b border-slate-100">
              <th className="text-left py-3 px-5 text-[11px] font-semibold text-slate-400 uppercase">
                Key Name
              </th>
              <th className="text-left py-3 px-5 text-[11px] font-semibold text-slate-400 uppercase">
                Token
              </th>
              <th className="text-left py-3 px-5 text-[11px] font-semibold text-slate-400 uppercase">
                Created
              </th>
              <th className="text-left py-3 px-5 text-[11px] font-semibold text-slate-400 uppercase">
                Last Used
              </th>
              <th className="text-right py-3 px-5 text-[11px] font-semibold text-slate-400 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {keys.map((keyInfo) => (
              <tr key={keyInfo.id} className="hover:bg-slate-50">
                <td className="py-4 px-5">
                  <p className="text-sm font-semibold text-slate-800">{keyInfo.name}</p>
                </td>
                <td className="py-4 px-5">
                  <code className="text-xs text-slate-600 font-mono">pk_live_••••••••••••</code>
                </td>
                <td className="py-4 px-5 text-sm text-slate-500">
                  {new Date(keyInfo.created).toLocaleDateString("en-US", { timeZone: "UTC" })}
                </td>
                <td className="py-4 px-5 text-sm text-slate-500">{keyInfo.lastUsed || "Never"}</td>
                <td className="py-4 px-5 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => handleDelete(keyInfo.id)}
                      className="p-1.5 rounded-lg border border-slate-200 hover:bg-red-50 text-red-800 hover:text-red-500 transition-colors"
                      title="Revoke Key"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
