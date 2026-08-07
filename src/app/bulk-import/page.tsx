import React from "react";
import AppLayoutWrapper from "@/components/AppLayoutWrapper";
import BulkImportContent from "./BulkImportContent";

export const metadata = { title: "Bulk Import/Export | UniTrack" };

export default function BulkImportPage() {
  return (
    <AppLayoutWrapper>
      <BulkImportContent />
    </AppLayoutWrapper>
  );
}
