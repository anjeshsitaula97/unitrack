'use client';

import React from 'react';
import { MoreHorizontal } from 'lucide-react';

export default function RecentActivityFeed() {
  const [activities, setActivities] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isMounted, setIsMounted] = React.useState(true);

  React.useEffect(() => {
    const ac = new AbortController();
    fetch('/api/activity?limit=20', { signal: ac.signal })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setActivities(data);
        setIsLoading(false);
      })
      .catch((err) => {
        if (err?.name !== 'AbortError') {
          setIsLoading(false);
        }
      });
    return () => ac.abort();
  }, []);

  const recent = activities.slice(0, 10);

  if (!isMounted) return null;

  return (
    <div className="card p-5 h-full">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-slate-800 text-sm">Recent Activities</h3>
          <p className="text-xs text-slate-400 mt-0.5">Real-time platform activity</p>
        </div>
        <button type="button" className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all duration-150" aria-label="MoreHorizontal"> <MoreHorizontal size={16} />
        </button>
      </div>
      <div className="space-y-0 divide-y divide-slate-50">
        {isLoading && <p className="text-xs text-slate-400 py-4 text-center">Loading activities…</p>}
        {!isLoading && recent.length === 0 && (
          <div className="py-8 text-center">
            <p className="text-xs text-slate-400 italic">No activities yet.</p>
          </div>
        )}
        {recent.map((act) => (
          <div key={act.id} className="flex items-start gap-3 py-2.5 hover:bg-slate-50 -mx-2 px-2 rounded-lg transition-colors cursor-pointer group">
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <div
                className="size-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0"
                style={{ backgroundColor: act.actorColor }}
              >
                {act.actorInitials}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-700 leading-relaxed">
                <span className="font-semibold">{act.actor}</span>{' '}
                <span className="text-slate-500">{act.action}</span>{' '}
                <span className="font-semibold text-indigo-600">{act.target}</span>{' '}
                {act.targetBy && (
                  <>
                    <span className="text-slate-400">by</span>{' '}
                    <span className="font-medium text-slate-600">{act.targetBy}</span>
                  </>
                )}
              </p>
            </div>
            <span className="text-[10px] text-slate-400 flex-shrink-0 whitespace-nowrap">{act.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}