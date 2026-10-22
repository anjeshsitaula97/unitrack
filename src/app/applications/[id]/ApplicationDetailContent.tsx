"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getStageSequence } from "@/lib/application-statuses";
import ApplicationDetailHeader from "./components/application-detail/ApplicationDetailHeader";
import ApplicationProgressTracker from "./components/application-detail/ApplicationProgressTracker";
import ApplicationStudentSidebar from "./components/application-detail/ApplicationStudentSidebar";
import ApplicationTabs from "./components/application-detail/ApplicationTabs";
import CommissionTab from "./components/application-detail/CommissionTab";
import FloatingActions from "./components/application-detail/FloatingActions";
import NotesTab from "./components/application-detail/NotesTab";
import RequirementsTab from "./components/application-detail/RequirementsTab";
import SettingsTab from "./components/application-detail/SettingsTab";
import StudentRecordsTab from "./components/application-detail/StudentRecordsTab";
import WorkflowTab from "./components/application-detail/WorkflowTab";
import type { MainTab, ReqFilter, SectionKey } from "./components/application-detail/types";
import { useApplicationDetailData } from "./components/application-detail/useApplicationDetailData";
import { useApplicationRequirements } from "./components/application-detail/useApplicationRequirements";
import { useNotes } from "./components/application-detail/useNotes";
import { useWorkflow } from "./components/application-detail/useWorkflow";
import { stageOfStatus } from "./components/application-detail/utils";

export default function ApplicationDetailContent({ id }: { id: string }) {
  const router = useRouter();
  const {
    detail,
    appStatuses,
    docs,
    appCount,
    loading,
    saving,
    manageOpen,
    setManageOpen,
    academicDocNames,
    fileInputRef,
    uploadingReq,
    handleUploadClick,
    handleFileSelected,
    setDocStatus,
    handleStatusUpdate,
  } = useApplicationDetailData(id);

  const [mainTab, setMainTab] = useState<MainTab>("Requirements");
  const [reqFilter, setReqFilter] = useState<ReqFilter>("All");
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    Pending: true,
    Approved: true,
    Rejected: true,
    "In Review": true,
  });
  const [sideOpen, setSideOpen] = useState<string | null>("Application details");

  const { matchedPrereqs, requirementRows, grouped, visibleSections } = useApplicationRequirements({
    detail,
    docs,
    academicDocNames,
    reqFilter,
  });

  const workflow = useWorkflow({ id, mainTab });
  const notes = useNotes({ id, mainTab });

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (navigator.share) {
        await navigator.share({ title: "Application", url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard");
      }
    } catch {
      try {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard");
      } catch {
        toast.error("Unable to share");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-400">
        <Loader2 className="animate-spin mr-2" size={24} />
        <span className="text-sm font-medium">Loading application…</span>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="text-center py-24">
        <p className="text-slate-500 font-medium mb-4">Application not found</p>
        <button
          type="button"
          onClick={() => router.push("/applications")}
          className="px-4 py-2 bg-[#1d4ed8] text-white rounded-lg text-sm font-medium"
        >
          Back to Applications
        </button>
      </div>
    );
  }

  const progressStages = getStageSequence(appStatuses);
  const currentStage = stageOfStatus(detail.status, appStatuses);
  const doneThrough = progressStages.indexOf(currentStage);
  const studentName = `${detail.student.firstName} ${detail.student.lastName}`;
  const title = [
    detail.course.level,
    detail.course.name,
    detail.university.city || detail.university.name,
  ]
    .filter(Boolean)
    .join(" - ");

  return (
    <div className="animate-fade-in text-slate-800 pb-24">
      <ApplicationDetailHeader
        title={title}
        detail={detail}
        appStatuses={appStatuses}
        saving={saving}
        manageOpen={manageOpen}
        onToggleManage={() => setManageOpen((o) => !o)}
        onStatusUpdate={handleStatusUpdate}
        onShare={handleShare}
      />

      <ApplicationProgressTracker progressStages={progressStages} doneThrough={doneThrough} />

      <div className="grid grid-cols-12 gap-8">
        <ApplicationStudentSidebar
          detail={detail}
          appCount={appCount}
          sideOpen={sideOpen}
          onToggleSide={(key) => setSideOpen(sideOpen === key ? null : key)}
        />

        <section className="col-span-12 lg:col-span-9">
          <ApplicationTabs
            mainTab={mainTab}
            notesCount={notes.notes.length}
            onSelect={setMainTab}
          />

          {mainTab === "Requirements" && (
            <RequirementsTab
              reqFilter={reqFilter}
              onReqFilterChange={setReqFilter}
              matchedPrereqs={matchedPrereqs}
              requirementRows={requirementRows}
              visibleSections={visibleSections}
              grouped={grouped}
              openSections={openSections}
              onToggleSection={(section: SectionKey) =>
                setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }))
              }
              uploadingReq={uploadingReq}
              onUploadClick={handleUploadClick}
              fileInputRef={fileInputRef}
              onFileSelected={handleFileSelected}
              onSetDocStatus={setDocStatus}
            />
          )}

          {mainTab === "Student records" && (
            <StudentRecordsTab detail={detail} studentName={studentName} />
          )}

          {mainTab === "Workflow" && (
            <WorkflowTab
              wfStages={workflow.wfStages}
              wfLoading={workflow.wfLoading}
              newStageName={workflow.newStageName}
              newStageDesc={workflow.newStageDesc}
              savingStage={workflow.savingStage}
              addingSubtaskTo={workflow.addingSubtaskTo}
              subtaskInputs={workflow.subtaskInputs}
              onNameChange={workflow.setNewStageName}
              onDescChange={workflow.setNewStageDesc}
              onAddStage={workflow.handleAddStage}
              onDeleteStage={workflow.handleDeleteStage}
              onToggleSubtask={workflow.handleToggleSubtask}
              onDeleteSubtask={workflow.handleDeleteSubtask}
              onStartAddSubtask={workflow.handleStartAddSubtask}
              onSubtaskInputChange={workflow.handleSubtaskInputChange}
              onAddSubtask={workflow.handleAddSubtask}
              onCancelSubtask={workflow.handleCancelSubtask}
            />
          )}

          {mainTab === "Notes" && (
            <NotesTab
              notes={notes.notes}
              notesLoading={notes.notesLoading}
              newNote={notes.newNote}
              savingNote={notes.savingNote}
              onNoteChange={notes.setNewNote}
              onAddNote={notes.handleAddNote}
              onDeleteNote={notes.handleDeleteNote}
            />
          )}

          {mainTab === "Commission" && <CommissionTab />}

          {mainTab === "Settings" && (
            <SettingsTab
              detail={detail}
              appStatuses={appStatuses}
              saving={saving}
              progressStages={progressStages}
              doneThrough={doneThrough}
              onStatusUpdate={handleStatusUpdate}
            />
          )}
        </section>
      </div>

      <FloatingActions detail={detail} />
    </div>
  );
}
