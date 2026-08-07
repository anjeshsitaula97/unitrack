import React from "react";
import AppLayoutWrapper from "@/components/AppLayoutWrapper";
import ReportBuilderContent from "./ReportBuilderContent";

export const metadata = { title: "Report Builder | UniTrack" };

export default function ReportBuilderPage() {
  return (
    <AppLayoutWrapper>
      <ReportBuilderContent />
    </AppLayoutWrapper>
  );
}
