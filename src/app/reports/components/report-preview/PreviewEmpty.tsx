import { FileText } from "lucide-react";

export default function PreviewEmpty() {
  return (
    <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-16 text-center text-slate-400">
      <div className="size-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
        <FileText size={32} className="text-slate-200" />
      </div>
      <p className="font-bold">No data found for the selected criteria.</p>
      <p className="text-sm">Try adjusting your date filters.</p>
    </div>
  );
}
