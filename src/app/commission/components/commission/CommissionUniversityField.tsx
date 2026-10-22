import type { Univ } from "./types";

interface CommissionUniversityFieldProps {
  universities: Univ[];
  value: string;
  onChange: (value: string) => void;
}

export default function CommissionUniversityField({
  universities,
  value,
  onChange,
}: CommissionUniversityFieldProps) {
  return (
    <div className="mb-4">
      <label
        htmlFor="commission-university"
        className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5"
      >
        University <span className="text-red-500">*</span>
      </label>
      <select
        id="commission-university"
        aria-label="University"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition font-medium"
      >
        <option value="">Select a university...</option>
        {universities.map((u) => (
          <option key={u.id} value={u.id}>
            {u.name} — {u.country || "Global"}
          </option>
        ))}
      </select>
    </div>
  );
}
