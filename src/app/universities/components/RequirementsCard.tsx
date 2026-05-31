'use client';

import React from 'react';
import { CheckCircle, Info } from 'lucide-react';
import { REQUIREMENTS_LIST } from '@/lib/constants';

interface RequirementsCardProps {
  form: any;
  update: (field: string, value: any) => void;
}

export default function RequirementsCard({ form, update }: RequirementsCardProps) {
  return (
    <div className="card p-6">
      <div className="flex items-center gap-2 mb-5">
        <div className="size-8 bg-blue-50 rounded-lg flex items-center justify-center">
          <CheckCircle size={16} className="text-blue-600" />
        </div>
        <h2 className="text-base font-bold text-slate-700">General Requirements</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {REQUIREMENTS_LIST.map((req) => {
          const isSelected = form.requirements.includes(req);
          return (
            <button type="button"
              key={req}
              onClick={() => {
                const next = isSelected
                  ? form.requirements.filter(r => r !== req)
                  : [...form.requirements, req];
                update('requirements', next);
              }}
              className={`
                flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer
                ${isSelected
                  ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-200'
                  : 'bg-slate-50 border-slate-200 hover:border-blue-300 hover:bg-white'}
              `}
            >
              <div className={`
                size-5 rounded border flex items-center justify-center transition-colors
                ${isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-300'}
              `}>
                {isSelected && <CheckCircle size={12} />}
              </div>
              <span className={`text-xs font-semibold ${isSelected ? 'text-blue-700' : 'text-slate-600'}`}>
                {req}
              </span>
            </button>
          );
        })}
      </div>
      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100 flex gap-2">
        <Info size={14} className="text-blue-500 mt-0.5 flex-shrink-0" />
        <p className="text-[10px] text-blue-700 leading-relaxed">
          Select all requirements that apply generally to this university's programs. Individual courses can have additional specific requirements.
        </p>
      </div>
    </div>
  );
}
