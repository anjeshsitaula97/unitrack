import React from "react";
import AppLayoutWrapper from "@/components/AppLayoutWrapper";
import UniversityForm from "../../components/UniversityForm";

export const metadata = {
  title: "Edit University | UniTrack",
  description: "UniTrack administration - Edit University",
};

export default async function EditUniversityPage({ params }: { params: { id: string } }) {
  const { id } = await params;

  return (
    <AppLayoutWrapper>
      <UniversityForm universityId={id} />
    </AppLayoutWrapper>
  );
}
