import React from "react";
import AppLayoutWrapper from "@/components/AppLayoutWrapper";
import RequestDetailContent from "./components/RequestDetailContent";

export const metadata = {
  title: "Marketing Request | UniTrack",
  description: "Marketing request details",
};

export default function RequestDetailPage() {
  return (
    <AppLayoutWrapper>
      <RequestDetailContent />
    </AppLayoutWrapper>
  );
}