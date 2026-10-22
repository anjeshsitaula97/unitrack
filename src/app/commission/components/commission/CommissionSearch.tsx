import { Search } from "lucide-react";

interface CommissionSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export default function CommissionSearch({ value, onChange }: CommissionSearchProps) {
  return (
    <div className="relative flex-1 min-w-[260px] max-w-sm mb-4">
      <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
      <input
        aria-label="Search universities, courses, partners, currencies..."
        type="text"
        placeholder="Search universities, courses, partners, currencies..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-10 pr-4 py-2 text-sm border border-slate-100 rounded-xl bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition font-medium placeholder:text-slate-400"
      />
    </div>
  );
}
