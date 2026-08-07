import React from "react";
import AppLayoutWrapper from "@/components/AppLayoutWrapper";
import StudentDetailContent from "./StudentDetailContent";

export const metadata = { title: "Student Details | UniTrack" };

export default async function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <AppLayoutWrapper>
      <StudentDetailContent id={id} />
    </AppLayoutWrapper>
  );
}
