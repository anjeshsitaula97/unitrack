import type { Dispatch, RefObject, SetStateAction } from "react";
import { Loader2, X } from "lucide-react";
import ConsultancyFormFields from "./ConsultancyFormFields";
import type { Consultancy, FormState } from "./types";

export default function ConsultancyFormModal({
  editing,
  form,
  setForm,
  isSaving,
  isUploading,
  fileInputRef,
  onLogoUpload,
  onClose,
  onSave,
}: {
  editing: Consultancy | null;
  form: FormState;
  setForm: Dispatch<SetStateAction<FormState>>;
  isSaving: boolean;
  isUploading: boolean;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onLogoUpload: (file: File) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center bg-slate-900/40 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-2xl my-8 bg-white rounded-2xl shadow-xl border border-slate-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-800">
            {editing ? `Edit ${editing.code}` : "New Consultancy"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <ConsultancyFormFields
          form={form}
          setForm={setForm}
          editing={editing}
          isUploading={isUploading}
          fileInputRef={fileInputRef}
          onLogoUpload={onLogoUpload}
        />

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100">
          <button type="button" onClick={onClose} className="btn-secondary" disabled={isSaving}>
            Cancel
          </button>
          <button type="button" onClick={onSave} className="btn-primary" disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Saving…
              </>
            ) : editing ? (
              "Save Changes"
            ) : (
              "Create Consultancy"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
