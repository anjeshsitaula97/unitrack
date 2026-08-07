import React from "react";
import AppLayoutWrapper from "@/components/AppLayoutWrapper";
import ApplicationDetailContent from "./ApplicationDetailContent";

export const metadata = {
  title: "Application Details | UniTrack",
  description: "View and manage application details",
};

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <AppLayoutWrapper>
      <ApplicationDetailContent id={id} />
    </AppLayoutWrapper>
  );
}
