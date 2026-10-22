interface CommissionValueFieldsProps {
  type: "Percentage" | "Flat" | "None";
  value: string;
  currency: string;
  onValueChange: (value: string) => void;
  onCurrencyChange: (value: string) => void;
}

export default function CommissionValueFields({
  type,
  value,
  currency,
  onValueChange,
  onCurrencyChange,
}: CommissionValueFieldsProps) {
  return (
    <>
      <div className="mb-4">
        <label
          htmlFor="fld-number-2"
          className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5"
        >
          Commission Value
        </label>
        <div className="relative">
          <input
            id="fld-number-2"
            type="number"
            step="any"
            placeholder={type === "Percentage" ? "e.g. 10 (%)" : "e.g. 500 (flat)"}
            value={value}
            onChange={(e) => onValueChange(e.target.value)}
            className="w-full pl-4 pr-12 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition font-medium"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
            {type === "Percentage" ? "%" : "amt"}
          </span>
        </div>
      </div>

      <div className="mb-4">
        <label
          htmlFor="fld-text"
          className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5"
        >
          Currency
        </label>
        <input
          id="fld-text"
          type="text"
          placeholder="e.g. USD"
          value={currency}
          onChange={(e) => onCurrencyChange(e.target.value)}
          className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition font-medium uppercase"
        />
      </div>
    </>
  );
}
