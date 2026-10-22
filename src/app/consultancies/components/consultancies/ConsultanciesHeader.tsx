import { Building2, Plus } from "lucide-react";

export default function ConsultanciesHeader({
  count,
  onCreate,
}: {
  count: number;
  onCreate: () => void;
}) {
  return (
    <>
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 mb-1">Consultancies</h1>
          <p className="text-sm text-slate-400">
            {count.toLocaleString()} consultanc
            {count === 1 ? "y" : "ies"} on the platform
          </p>
        </div>
        <button type="button" onClick={onCreate} className="btn-primary" aria-label="Add">
          <Plus size={15} /> New Consultancy
        </button>
      </div>

      <div className="card p-5 mb-6">
        <div className="flex items-center gap-3 text-indigo-700 bg-indigo-50 p-4 rounded-lg border border-indigo-100">
          <Building2 className="flex-shrink-0" size={24} />
          <div>
            <h4 className="text-sm font-bold">Fully isolated workspaces</h4>
            <p className="text-xs mt-1">
              Each consultancy sees only its own records, roles and branding. Use{" "}
              <span className="font-semibold">View All</span> to work across the platform, or switch
              into a single consultancy to scope every screen, list and report to it.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
