import React from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AppLayoutWrapper from "@/components/AppLayoutWrapper";
import { getSession } from "@/lib/api-utils";
import { isSuperAdminRole } from "@/lib/permission-catalog";
import ConsultanciesContent from "./components/ConsultanciesContent";

export const metadata: Metadata = {
  title: "Consultancies | UniTrack",
  description: "Manage consultancies across the platform",
};

export default async function ConsultanciesPage() {
  const session = await getSession();
  if (!session || !isSuperAdminRole(session.role)) {
    redirect("/dashboard");
  }

  return (
    <AppLayoutWrapper>
      <ConsultanciesContent />
    </AppLayoutWrapper>
  );
}
