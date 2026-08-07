import React from "react";
import AppLayoutWrapper from "@/components/AppLayoutWrapper";
import PartnerDashboardContent from "./components/PartnerDashboardContent";

export const metadata = {
  title: "B2B Partner Dashboard | UniTrack",
  description: "UniTrack administration - B2B Partner Dashboard",
};

export default function PartnerDashboardPage() {
  return (
    <AppLayoutWrapper>
      <PartnerDashboardContent />
    </AppLayoutWrapper>
  );
}
