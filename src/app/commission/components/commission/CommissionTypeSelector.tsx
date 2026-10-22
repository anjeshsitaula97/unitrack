import { Percent, Scale } from "lucide-react";

interface CommissionTypeSelectorProps {
  value: "Percentage" | "Flat" | "None";
  onChange: (value: "Percentage" | "Flat" | "None") => void;
}

export default function CommissionTypeSelector({ value, onChange }: CommissionTypeSelectorProps) {
  return (
    <div className="mb-4">
      <span
        id="commission-type-label"
        className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5"
      >
        Commission Type
      </span>
      <div role="group" aria-labelledby="commission-type-label" className="grid grid-cols-3 gap-2">
        {(["Percentage", "Flat", "None"] as const).map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors ${
              value === opt
                ? "bg-indigo-600 text-white border-indigo-600"
                : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300"
            }`}
          >
            {opt === "Percentage" ? (
              <span className="inline-flex items-center gap-1">
                <Percent size={12} /> {opt}
              </span>
            ) : opt === "Flat" ? (
              <span className="inline-flex items-center gap-1">
                <Scale size={12} /> {opt}
              </span>
            ) : (
              opt
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
