import React from "react";
import AppLayoutWrapper from "@/components/AppLayoutWrapper";
import DashboardContent from "./components/DashboardContent";

export const metadata = {
  title: "Dashboard | UniTrack",
  description: "UniTrack administration - Dashboard",
};

export default function DashboardPage() {
  return (
    <AppLayoutWrapper>
      <DashboardContent />
    </AppLayoutWrapper>
  );
}
