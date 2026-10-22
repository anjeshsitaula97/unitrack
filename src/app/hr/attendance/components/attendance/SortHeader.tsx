import type { ReactNode } from "react";
import { ArrowUpDown } from "lucide-react";

const SortHeader = ({
  field,
  children,
  sortField,
  onSort,
}: {
  field: string;
  children: ReactNode;
  sortField: string;
  onSort: (field: string) => void;
}) => (
  <th className="py-3 px-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest select-none">
    <button
      type="button"
      className="flex items-center gap-1 cursor-pointer hover:text-slate-600"
      onClick={() => onSort(field)}
    >
      {children}
      <ArrowUpDown
        size={11}
        className={`transition-opacity ${sortField === field ? "opacity-100 text-indigo-500" : "opacity-30"}`}
      />
    </button>
  </th>
);

export default SortHeader;
