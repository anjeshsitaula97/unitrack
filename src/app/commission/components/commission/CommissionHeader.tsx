import Link from "next/link";
import { Handshake, Plus } from "lucide-react";

interface CommissionHeaderProps {
  onAdd: () => void;
}

export default function CommissionHeader({ onAdd }: CommissionHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 mb-1">Commission</h1>
        <p className="text-sm text-slate-400">
          Configure commission structures per university and per course
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Link href="/partnership" className="btn-secondary">
          <Handshake size={15} />
          View Partnerships
        </Link>
        <button
          type="button"
          onClick={onAdd}
          className="btn-primary inline-flex items-center gap-2"
        >
          <Plus size={15} />
          Add Commission
        </button>
      </div>
    </div>
  );
}
