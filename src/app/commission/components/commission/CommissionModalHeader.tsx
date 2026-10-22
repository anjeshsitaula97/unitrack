import { BadgeDollarSign } from "lucide-react";

interface CommissionModalHeaderProps {
  isEditing: boolean;
}

export default function CommissionModalHeader({ isEditing }: CommissionModalHeaderProps) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="size-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-indigo-50 text-indigo-600">
        <BadgeDollarSign size={18} />
      </div>
      <div>
        <h3 className="text-base font-bold text-slate-800">
          {isEditing ? "Edit Commission" : "Add Commission"}
        </h3>
        <p className="text-xs text-slate-400 font-medium">
          Select a university and optional course
        </p>
      </div>
    </div>
  );
}
