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
  // Server-side gate: the console URL space is Super Admin only, so a tenant
  // session (or none) is sent back to the branded console login.
  const session = await getSession();
  if (!session || !isSuperAdminRole(session.role)) {
    redirect("/appconsole/login");
  }

  // Deliberately the exact same shell and widgets as /dashboard: one app layout
  // (sidebar, topbar, tour, news popup) around the shared dashboard content.
  return (
    <AppLayoutWrapper>
      <DashboardContent />
    </AppLayoutWrapper>
  );
}
