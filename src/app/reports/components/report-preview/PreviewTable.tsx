import type { ReportRow } from "./types";

export default function PreviewTable({ previewData }: { previewData: ReportRow[] }) {
  return (
    <div className="overflow-x-auto max-h-[500px]">
      <table className="w-full text-left border-collapse min-w-[1000px]">
        <thead className="sticky top-0 bg-white border-b border-slate-100 z-10 shadow-sm">
          <tr>
            {Object.keys(previewData[0] || {}).map((key) => (
              <th
                key={key}
                className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50/30"
              >
                {key}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {previewData.slice(0, 100).map((row, rowOffset) => {
            const rowKey = `row-${Object.values(row).join("-").slice(0, 30)}-${rowOffset}`;
            return (
              <tr key={rowKey} className="hover:bg-indigo-50/20 transition-colors">
                {Object.values(row).map((val, colOffset) => {
                  const cellKey = `cell-${Object.keys(row)[colOffset] || colOffset}-${String(val).slice(0, 10)}`;
                  return (
                    <td
                      key={cellKey}
                      className="px-6 py-4 text-sm text-slate-600 font-bold whitespace-nowrap"
                    >
                      {typeof val === "object" ? JSON.stringify(val) : String(val)}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
