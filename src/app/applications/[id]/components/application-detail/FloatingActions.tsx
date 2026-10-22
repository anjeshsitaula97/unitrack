"use client";

import { useRouter } from "next/navigation";
import { ChevronUp, Info } from "lucide-react";
import { toast } from "sonner";
import type { ApplicationDetail } from "./types";

export default function FloatingActions({ detail }: { detail: ApplicationDetail }) {
  const router = useRouter();

  return (
    <div className="fixed bottom-6 right-6 flex flex-col items-end gap-3 z-30">
      <button
        type="button"
        onClick={() => router.push("/applications")}
        className="bg-indigo-900 text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-xl hover:bg-indigo-800 transition text-sm font-medium"
      >
        Back to list
        <ChevronUp size={16} />
      </button>
      <button
        type="button"
        onClick={() =>
          toast.message("Application help", {
            description: `Status: ${detail.status}. Change it in the Settings tab — the process tracker updates automatically.`,
          })
        }
        className="w-12 h-12 bg-white border border-indigo-200 rounded-full flex items-center justify-center shadow-xl hover:bg-indigo-50 transition text-indigo-600"
        aria-label="Help"
      >
        <Info size={22} />
      </button>
    </div>
  );
}
