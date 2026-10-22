import { Loader2 } from "lucide-react";

export default function PreviewLoading({ previewTitle }: { previewTitle: string }) {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-20 flex flex-col items-center gap-4 text-center shadow-sm">
      <Loader2 className="animate-spin text-indigo-600" size={48} />
      <div>
        <p className="text-lg font-black text-slate-800">Compiling Report…</p>
        <p className="text-sm text-slate-400 font-medium">
          Fetching the latest data for {previewTitle}
        </p>
      </div>
    </div>
  );
}
