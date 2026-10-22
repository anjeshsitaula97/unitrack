interface CommissionPartnershipFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export default function CommissionPartnershipField({
  value,
  onChange,
}: CommissionPartnershipFieldProps) {
  return (
    <div className="mb-4">
      <label
        htmlFor="fld-number"
        className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5"
      >
        Partnership Amount
      </label>
      <input
        id="fld-number"
        type="number"
        step="any"
        placeholder="e.g. 5000 (optional)"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition font-medium"
      />
    </div>
  );
}
