import { daysToExpiry } from "./utils";

export default function PackageBadge({ expiry }: { expiry: string | null }) {
  const days = daysToExpiry(expiry);
  if (days === null) {
    return <span className="text-[11px] text-slate-400">No expiry</span>;
  }
  if (days < 0) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full">
        Expired {Math.abs(days)}d ago
      </span>
    );
  }
  if (days <= 30) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full">
        Expires in {days}d
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
      Active
    </span>
  );
}
