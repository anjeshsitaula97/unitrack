"use client";

import { Plus, ChevronLeft, ChevronRight, ClipboardCheck } from "lucide-react";
import WorkflowStageCard from "./WorkflowStageCard";
import type { VisaWorkflowController } from "./useVisaWorkflow";

export default function WorkflowProcessView({ workflow }: { workflow: VisaWorkflowController }) {
  const {
    country,
    visaType,
    workflowStages,
    scrollRef,
    updateScrollButtons,
    canScrollLeft,
    canScrollRight,
    scrollBy,
    setShowStageModal,
  } = workflow;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Application Pipeline</h2>
          <p className="text-sm text-slate-500 mt-1">
            Configure automated stages for {country} {visaType}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowStageModal(true)}
          className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-[color,background-color,border-color,box-shadow,transform,opacity] flex items-center gap-2 shadow-lg shadow-indigo-100"
        >
          <Plus size={16} /> New Stage
        </button>
      </div>

      <div className="relative">
        {workflowStages.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-slate-100 shadow-inner relative overflow-hidden">
            <div className="absolute -top-10 -right-10 size-40 bg-indigo-50/50 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -left-10 size-40 bg-violet-50/50 rounded-full blur-3xl" />
            <div className="relative size-24 bg-gradient-to-br from-indigo-100 to-violet-100 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-100/50">
              <ClipboardCheck size={36} className="text-indigo-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">No Stages Defined</h3>
            <p className="text-sm text-slate-500">Add your first processing stage to begin.</p>
          </div>
        ) : (
          <>
            <div
              ref={scrollRef}
              onScroll={updateScrollButtons}
              className="flex items-start gap-0 overflow-x-hidden pb-12 pt-10 px-8"
            >
              {workflowStages.map((stage, index) => (
                <WorkflowStageCard
                  key={stage.id}
                  stage={stage}
                  index={index}
                  total={workflowStages.length}
                  workflow={workflow}
                />
              ))}
            </div>

            {canScrollLeft && (
              <button
                aria-label="Scroll stages left"
                type="button"
                onClick={() => scrollBy("left")}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-20 size-10 bg-white/90 backdrop-blur-sm rounded-full shadow-lg border border-slate-100 flex items-center justify-center text-slate-600 hover:text-indigo-600 hover:bg-white transition-[color,background-color,border-color,box-shadow,transform,opacity]"
              >
                <ChevronLeft size={20} />
              </button>
            )}
            {canScrollRight && (
              <button
                aria-label="Scroll stages right"
                type="button"
                onClick={() => scrollBy("right")}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-20 size-10 bg-white/90 backdrop-blur-sm rounded-full shadow-lg border border-slate-100 flex items-center justify-center text-slate-600 hover:text-indigo-600 hover:bg-white transition-[color,background-color,border-color,box-shadow,transform,opacity]"
              >
                <ChevronRight size={20} />
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
