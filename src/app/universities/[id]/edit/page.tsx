import React from "react";
import AppLayoutWrapper from "@/components/AppLayoutWrapper";
import UniversityForm from "../../components/UniversityForm";
import { getSession } from "@/lib/api-utils";
import { isSuperAdminRole } from "@/lib/permission-catalog";

export const metadata = {
  title: "Edit University | UniTrack",
  description: "UniTrack administration - Edit University",
};

export default async function EditUniversityPage({ params }: { params: Promise<{ id: string }> }) {
  const [{ id }, session] = await Promise.all([params, getSession()]);

  return (
    <AppLayoutWrapper>
      <UniversityForm universityId={id} isSuperAdmin={isSuperAdminRole(session?.role)} />
    </AppLayoutWrapper>
  );
}
