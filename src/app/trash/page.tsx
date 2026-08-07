import React from "react";
import AppLayoutWrapper from "@/components/AppLayoutWrapper";
import TrashContent from "./TrashContent";

export const metadata = { title: "Recycle Bin | UniTrack" };

export default function TrashPage() {
  return (
    <AppLayoutWrapper>
      <TrashContent />
    </AppLayoutWrapper>
  );
}
