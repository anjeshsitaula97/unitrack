'use client';

import React, { useState, useEffect } from 'react';
import { Key, Copy, Plus, Trash2, Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const handleCopy = (token: string) => {
  navigator.clipboard.writeText(token);
  toast.success('API key copied to clipboard');
};

export default function ApiKeysContent() {
  const [keys, setKeys] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [showKey, setShowKey] = useState<string | null>(null);

  useEffect(() => {
    const ac = new AbortController();
    fetch('/api/api-keys', { signal: ac.signal })
      .then(res => {
        if (!res.ok) throw new Error('API Error');
        return res.json();
      })
      .then(data => {
        setKeys(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (err?.name !== 'AbortError') {
          toast.error('Failed to load API keys database');
          setKeys([]);
        }
      })
      .finally(() => {
        setIsLoadingData(false);
      });
    return () => ac.abort();
  }, []);

  const handleGenerate = async () => {
    toast.info('Generating key...');
    try {
      const res = await fetch('/api/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'New Integration Key' })
      });
      if (res.ok) {
        const newKey = await res.json();
        setKeys([newKey, ...keys]);
        toast.success('Successfully generated new API Key');
      } else {
        toast.error('Failed to generate key');
      }
    } catch (err) {
      toast.error('Error connecting to backend');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to revoke this API key? This action is permanent and will break any integrations using this key.')) return;
    
    try {
      const res = await fetch(`/api/api-keys/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setKeys(keys.filter(k => k.id !== id));
        toast.success('API key revoked successfully');
      } else {
        toast.error('Failed to revoke key');
      }
    } catch (err) {
      toast.error('Error connecting to backend');
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
        <button type="button" onClick={handleGenerate} className="btn-primary" aria-label="Add"> <Plus size={15} /> Generate New Key
        </button>
      </div>

      <div className="card p-5 mb-6">
        <div className="flex items-center gap-3 text-amber-700 bg-amber-50 p-4 rounded-lg border border-amber-100">
          <Key className="flex-shrink-0" size={24} />
          <div>
            <h4 className="text-sm font-bold">Keep these keys secret</h4>
            <p className="text-xs mt-1">These keys allow programmatic access to your entire platform. Do not share them in public repositories or client-side code.</p>
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50/60">
            <tr className="border-b border-slate-100">
              <th className="text-left py-3 px-5 text-[11px] font-semibold text-slate-400 uppercase">Key Name</th>
              <th className="text-left py-3 px-5 text-[11px] font-semibold text-slate-400 uppercase">Token</th>
              <th className="text-left py-3 px-5 text-[11px] font-semibold text-slate-400 uppercase">Created</th>
              <th className="text-left py-3 px-5 text-[11px] font-semibold text-slate-400 uppercase">Last Used</th>
              <th className="text-right py-3 px-5 text-[11px] font-semibold text-slate-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {keys.map((keyInfo) => (
              <tr key={keyInfo.id} className="hover:bg-slate-50">
                <td className="py-4 px-5">
                  <p className="text-sm font-semibold text-slate-800">{keyInfo.name}</p>
                </td>
                <td className="py-4 px-5">
                  <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-md inline-flex w-48 justify-between">
                    <code className="text-xs text-slate-600 font-mono">
                      {showKey === keyInfo.id ? keyInfo.tokenHash : keyInfo.tokenHash.substring(0, 12) + 'â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢'}
                    </code>
                    <button type="button" onClick={() => setShowKey(showKey === keyInfo.id ? null : keyInfo.id)} className="text-slate-400 hover:text-slate-600">
                      {showKey === keyInfo.id ? <EyeOff size={14}/> : <Eye size={14}/>}
                    </button>
                  </div>
                </td>
                <td className="py-4 px-5 text-sm text-slate-500">{new Date(keyInfo.created).toLocaleDateString()}</td>
                <td className="py-4 px-5 text-sm text-slate-500">{keyInfo.lastUsed}</td>
                <td className="py-4 px-5 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button type="button" onClick={() => handleCopy(keyInfo.tokenHash)} className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-200 text-slate-500 transition-colors" title="Copy Key">
                      <Copy size={13} />
                    </button>
                    <button type="button" onClick={() => handleDelete(keyInfo.id)} className="p-1.5 rounded-lg border border-slate-200 hover:bg-red-50 text-red-800 hover:text-red-500 transition-colors" title="Revoke Key">
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
