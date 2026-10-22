import { Building2 } from "lucide-react";

export default function CommissionInfoBox() {
  return (
    <div className="p-6 bg-indigo-50 border border-indigo-100 rounded-2xl flex gap-5 mt-6">
      <div className="size-12 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm flex-shrink-0">
        <Building2 size={24} />
      </div>
      <div>
        <h4 className="text-sm font-bold text-indigo-900 mb-1">How commissions work</h4>
        <p className="text-xs text-indigo-700 leading-relaxed">
          Commission structures (percentage or flat) are configured per university and per course. A
          course-level commission overrides the university default. When a student enrolled through
          a partner successfully enrolls, the configured commission is used to calculate agent
          payouts.
        </p>
      </div>
    </div>
  );
}
