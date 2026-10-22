import { Loader2 } from "lucide-react";

interface CommissionModalFooterProps {
  saving: boolean;
  disabled: boolean;
  onClose: () => void;
  onSave: () => void;
}

export default function CommissionModalFooter({
  saving,
  disabled,
  onClose,
  onSave,
}: CommissionModalFooterProps) {
  return (
    <div className="flex items-center gap-3 mt-6">
      <button
        type="button"
        onClick={onClose}
        disabled={saving}
        className="flex-1 py-2.5 rounded-xl text-sm font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-50"
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={onSave}
        disabled={saving || disabled}
        className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2"
      >
        {saving && <Loader2 size={14} className="animate-spin" />}
        Save Commission
      </button>
    </div>
  );
}
