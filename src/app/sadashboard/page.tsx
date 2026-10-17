import React from "react";
import { redirect } from "next/navigation";
import AppLayoutWrapper from "@/components/AppLayoutWrapper";
import DashboardContent from "@/app/dashboard/components/DashboardContent";
import { getSession } from "@/lib/api-utils";
import { isSuperAdminRole } from "@/lib/permission-catalog";

export const metadata = {
  title: "Super Admin Dashboard | UniTrack",
  description: "UniTrack administration - Super Admin Dashboard",
};

export default async function SADashboardPage() {
  const session = await getSession();
  if (!session || !isSuperAdminRole(session.role)) {
    redirect("/om/login");
  }

  return (
    <AppLayoutWrapper>
      <DashboardContent />
    </AppLayoutWrapper>
  );
}
