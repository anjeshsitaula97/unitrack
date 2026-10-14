import React from "react";
import AppLayoutWrapper from "@/components/AppLayoutWrapper";
import UniversityForm from "../components/UniversityForm";
import { getSession } from "@/lib/api-utils";
import { isSuperAdminRole } from "@/lib/permission-catalog";

export const metadata = {
  title: "Add University | UniTrack",
  description: "UniTrack administration - Add University",
};

export default async function AddUniversityPage() {
  const session = await getSession();

  return (
    <AppLayoutWrapper>
      <UniversityForm isSuperAdmin={isSuperAdminRole(session?.role)} />
    </AppLayoutWrapper>
  );
}
