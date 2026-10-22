"use client";

import type { ChangeEvent, RefObject } from "react";
import CoursePrerequisitesOverview from "./CoursePrerequisitesOverview";
import CourseRequirements from "./CourseRequirements";
import DocumentSections from "./DocumentSections";
import RequirementsToolbar from "./RequirementsToolbar";
import type {
  GroupedDocs,
  MatchedPrerequisite,
  ReqFilter,
  RequirementRow,
  SectionKey,
} from "./types";

export default function RequirementsTab({
  reqFilter,
  onReqFilterChange,
  matchedPrereqs,
  requirementRows,
  visibleSections,
  grouped,
  openSections,
  onToggleSection,
  uploadingReq,
  onUploadClick,
  fileInputRef,
  onFileSelected,
  onSetDocStatus,
}: {
  reqFilter: ReqFilter;
  onReqFilterChange: (filter: ReqFilter) => void;
  matchedPrereqs: MatchedPrerequisite[];
  requirementRows: RequirementRow[];
  visibleSections: SectionKey[];
  grouped: GroupedDocs;
  openSections: Record<string, boolean>;
  onToggleSection: (section: SectionKey) => void;
  uploadingReq: string | null;
  onUploadClick: (reqName: string) => void;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onFileSelected: (e: ChangeEvent<HTMLInputElement>) => void;
  onSetDocStatus: (docId: string, status: "Approved" | "Rejected") => void;
}) {
  return (
    <>
      <RequirementsToolbar reqFilter={reqFilter} onReqFilterChange={onReqFilterChange} />
      <CoursePrerequisitesOverview matchedPrereqs={matchedPrereqs} />
      <CourseRequirements
        requirementRows={requirementRows}
        uploadingReq={uploadingReq}
        onUploadClick={onUploadClick}
        fileInputRef={fileInputRef}
        onFileSelected={onFileSelected}
      />
      <DocumentSections
        visibleSections={visibleSections}
        grouped={grouped}
        openSections={openSections}
        onToggleSection={onToggleSection}
        onSetDocStatus={onSetDocStatus}
      />
    </>
  );
}
