import React from "react";
import AppLayoutWrapper from "@/components/AppLayoutWrapper";
import AuditContent from "./AuditContent";

export const metadata = { title: "Audit Trail | UniTrack" };

export default function AuditPage() {
  return (
    <AppLayoutWrapper>
      <AuditContent />
    </AppLayoutWrapper>
  );
}
