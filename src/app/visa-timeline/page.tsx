import React from "react";
import AppLayoutWrapper from "@/components/AppLayoutWrapper";
import VisaTimelineContent from "./VisaTimelineContent";

export const metadata = { title: "Visa Timeline | UniTrack" };

export default function VisaTimelinePage() {
  return (
    <AppLayoutWrapper>
      <VisaTimelineContent />
    </AppLayoutWrapper>
  );
}
