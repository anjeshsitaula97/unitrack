'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Briefcase, Loader2, X, Users, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function DesignationsContent() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ title: '', description: '' });

  const fetchData = async () => {
    try {
      const res = await fetch('/api/hr/designations');
      if (res.ok) setItems(await res.json());
    } catch { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const openAdd = () => { setEditing(null); setForm({ title: '', description: '' }); setShowModal(true); };
  const openEdit = (item: any) => { setEditing(item); setForm({ title: item.title, description: item.description || '' }); setShowModal(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const url = editing ? `/api/hr/designations/${editing.id}` : '/api/hr/designations';
      const method = editing ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (res.ok) {
        toast.success(editing ? 'Designation updated' : 'Designation created');
        setShowModal(false); fetchData();
      } else { const d = await res.json(); toast.error(d.error || 'Failed to save'); }
    } catch { toast.error('Error connecting to server'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this designation?')) return;
    try {
      const res = await fetch(`/api/hr/designations/${id}`, { method: 'DELETE' });
      if (res.ok) { toast.success('Designation deleted'); fetchData(); }
      else { const d = await res.json(); toast.error(d.error || 'Failed to delete'); }
    } catch { toast.error('Error connecting to server'); }
  };

  return (
    <div className="animate-fade-in">
      {loading && <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-indigo-500" size={32} /></div>}

      {!loading && (
        <>
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Link href="/hr" className="text-slate-400 hover:text-slate-600"><ArrowLeft size={16} /></Link>
                <h1 className="text-2xl font-bold text-slate-800">Designations</h1>
              </div>
              <p className="text-sm text-slate-400">{items.length} job titles</p>
            </div>
            <button type="button" onClick={openAdd} className="btn-primary flex items-center gap-2" aria-label="Add"> <Plus size={15} /> Add Designation</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
              <div key={item.id} className="card p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="size-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center"><Briefcase size={20} /></div>
                  <div className="flex gap-1">
                    <button type="button" onClick={() => openEdit(item)} className="p-1.5 text-indigo-800 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"><Edit2 size={14} /></button>
                    <button type="button" onClick={() => handleDelete(item.id)} className="p-1.5 text-red-800 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button>
                  </div>
                </div>
                <h3 className="font-bold text-slate-800 mb-1">{item.title}</h3>
                {item.description && <p className="text-xs text-slate-400 mb-3">{item.description}</p>}
                <div className="flex items-center gap-1 text-xs text-slate-500"><Users size={12} /> {item._count?.members || 0} members</div>
              </div>
            ))}
            {items.length === 0 && <div className="col-span-full text-center py-12 text-slate-400">No designations yet</div>}
          </div>
        </>
      )}

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-scale-in overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-slate-800">{editing ? 'Edit Designation' : 'Add Designation'}</h3>
              <button type="button" onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 p-1"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Title</label>
                <input type="text" required value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="e.g. Senior Developer" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Description</label>
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Role description" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm" rows={3} />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={submitting} className="btn-primary px-8 disabled:opacity-50">
                  {submitting ? 'Saving...' : editing ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
