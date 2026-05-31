import React, { useState, useEffect } from 'react';
import { MoreHorizontal, Filter, ArrowUpDown, ExternalLink, Edit2, Trash2, Loader2, Building2 } from 'lucide-react';
import Link from 'next/link';

const statusConfig: Record<string, { label: string; className: string }> = {
  'Active': { label: '+ Active', className: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
  'Pending': { label: '+ Pending', className: 'bg-amber-50 text-amber-700 border border-amber-200' },
  'In Progress': { label: '+ In Progress', className: 'bg-violet-50 text-violet-700 border border-violet-200' },
  'Planning': { label: '+ Planning', className: 'bg-blue-50 text-blue-700 border border-blue-200' },
  'Suspended': { label: '+ Suspended', className: 'bg-red-50 text-red-700 border border-red-200' },
};

type TabType = 'all' | 'active' | 'pending';

const tabs: { key: TabType; label: string }[] = [
  { key: 'all', label: 'All Universities' },
  { key: 'active', label: 'Active' },
  { key: 'pending', label: 'Pending' },
];

export default function RecentUniversitiesTable() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    const ac = new AbortController();
    fetch('/api/dashboard/recent-universities', { signal: ac.signal })
      .then(res => res.json())
      .then(result => {
        setData(result);
        setLoading(false);
      })
      .catch(err => {
        if (err?.name !== 'AbortError') {
          console.error('Recent Universities Fetch Error:', err);
          setLoading(false);
        }
      });
    return () => ac.abort();
  }, []);

  const filtered = data.filter((u) => {
    if (activeTab === 'active') return u.status === 'Active';
    if (activeTab === 'pending') return u.status === 'Pending' || u.status === 'Planning';
    return true;
  });

  const toggleRow = (id: string) => {
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const toggleAll = () => {
    setSelected(selected.length === filtered.length ? [] : filtered.map((u) => u.id));
  };

  return (
    <div className="card p-5 relative min-h-[400px]">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10 rounded-2xl">
          <Loader2 className="animate-spin text-indigo-500" size={32} />
        </div>
      )}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <div className="size-7 rounded-lg bg-slate-100 flex items-center justify-center">
              <Building2 size={14} className="text-indigo-600" />
            </div>
            <h3 className="font-semibold text-slate-800 text-sm">Recently Listed Universities</h3>
          </div>
          <p className="text-xs text-slate-400 ml-9">Showing all recently added universities</p>
        </div>
        <button type="button" className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all duration-150" aria-label="MoreHorizontal"> <MoreHorizontal size={16} />
        </button>
      </div>

      {/* Tabs + Actions */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1">
          {tabs.map((tab) => (
            <button type="button"
              key={`tab-${tab.key}`}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                activeTab === tab.key
                  ? 'bg-slate-100 text-slate-800' :'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button type="button" className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 transition-all duration-150" aria-label="Filter"> <Filter size={12} />
            Filter
          </button>
          <button type="button" className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 transition-all duration-150" aria-label="ArrowUpDown"> <ArrowUpDown size={12} />
            Sort
          </button>
        </div>
      </div>

      {/* Bulk action bar */}
      {selected.length > 0 && (
        <div className="mb-3 flex items-center gap-3 px-3 py-2 bg-indigo-50 border border-indigo-200 rounded-lg animate-slide-up">
          <span className="text-xs font-semibold text-indigo-700">{selected.length} selected</span>
          <button type="button" className="text-xs text-indigo-600 hover:underline font-medium">Export</button>
          <button type="button" className="text-xs text-red-500 hover:underline font-medium">Delete</button>
          <button type="button" onClick={() => setSelected([])} className="ml-auto text-xs text-slate-500 hover:text-slate-700">Clear</button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left py-2 pr-4 w-8">
                <input
                  type="checkbox"
                  checked={selected.length === filtered.length && filtered.length > 0}
                  onChange={toggleAll}
                  className="size-3.5 rounded border-slate-300 text-indigo-600 cursor-pointer"
                />
              </th>
              <th className="text-left py-2 pr-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">University Name</th>
              <th className="text-left py-2 pr-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Status</th>
              <th className="text-left py-2 pr-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Assignee</th>
              <th className="text-left py-2 pr-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Country</th>
              <th className="text-left py-2 pr-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Completion</th>
              <th className="text-left py-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Added Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.length > 0 ? (
              filtered.map((row) => {
                const status = statusConfig[row.status] || statusConfig['Active'];
                const isSelected = selected.includes(row.id);
                return (
                  <tr
                    key={row.id}
                    className={`group hover:bg-slate-50 transition-colors ${isSelected ? 'bg-indigo-50/40' : ''}`}
                  >
                    <td className="py-2.5 pr-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleRow(row.id)}
                        className="size-3.5 rounded border-slate-300 text-indigo-600 cursor-pointer"
                      />
                    </td>
                    <td className="py-2.5 pr-4">
                      <span className="text-xs font-medium text-slate-700 truncate max-w-[200px] block">{row.name}</span>
                    </td>
                    <td className="py-2.5 pr-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold ${status.className}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="py-2.5 pr-4">
                      <div className="flex gap-x-[-0.375rem]">
                        {row.assignees.map((color: string, i: number) => (
                          <div
                            key={`assignee-${row.id}-${color}`}
                            className="size-6 rounded-full border-2 border-white flex items-center justify-center text-white text-[9px] font-bold"
                            style={{ backgroundColor: color }}
                          >
                            {['A','B','C','D'][i]}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="py-2.5 pr-4">
                      <span className="text-[11px] font-medium text-indigo-600">/{row.country}</span>
                    </td>
                    <td className="py-2.5 pr-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                            style={{ width: `${row.completion}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-semibold text-slate-600 font-tabular">{row.completion}%</span>
                      </div>
                    </td>
                    <td className="py-2.5">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[11px] text-slate-500 whitespace-nowrap">{row.addedDate}</span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {row.website && (
                            <a href={row.website} target="_blank" rel="noopener noreferrer" className="p-1 rounded hover:bg-slate-200 transition-colors" title="Visit Website">
                              <ExternalLink size={12} className="text-slate-400" />
                            </a>
                          )}
                          <Link href={`/universities`} className="p-1 rounded hover:bg-slate-200 transition-colors" title="Manage universities">
                            <Edit2 size={12} className="text-slate-400" />
                          </Link>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : !loading && (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400 text-sm italic">
                  No universities found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}