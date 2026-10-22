"use client";

import ApplicationDetailsSummary from "./ApplicationDetailsSummary";
import ApplicationProcessOverview from "./ApplicationProcessOverview";
import ApplicationStatusSettings from "./ApplicationStatusSettings";
import type { ApplicationDetail, ApplicationStatus } from "./types";

export default function SettingsTab({
  detail,
  appStatuses,
  saving,
  progressStages,
  doneThrough,
  onStatusUpdate,
}: {
  detail: ApplicationDetail;
  appStatuses: ApplicationStatus[];
  saving: boolean;
  progressStages: string[];
  doneThrough: number;
  onStatusUpdate: (status: string) => void;
}) {
  return (
    <div className="space-y-6">
      <ApplicationStatusSettings
        appStatuses={appStatuses}
        detail={detail}
        saving={saving}
        onStatusUpdate={onStatusUpdate}
      />
      <ApplicationProcessOverview progressStages={progressStages} doneThrough={doneThrough} />
      <ApplicationDetailsSummary detail={detail} />
    </div>
  );
}
