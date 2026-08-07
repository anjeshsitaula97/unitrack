import React from "react";
import AppLayoutWrapper from "@/components/AppLayoutWrapper";
import DashboardContent from "@/app/dashboard/components/DashboardContent";

export const metadata = {
  title: "Administrator Dashboard | UniTrack",
  description: "UniTrack administration - Administrator Dashboard",
};

export default function AdminDashboardPage() {
  return (
    <AppLayoutWrapper>
      <DashboardContent />
    </AppLayoutWrapper>
  );
}
