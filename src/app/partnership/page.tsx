import React from "react";
import AppLayoutWrapper from "@/components/AppLayoutWrapper";
import PartnershipContent from "./components/PartnershipContent";

export const metadata = {
  title: "Partnership | UniTrack",
  description: "UniTrack administration - Partnerships",
};

export default function PartnershipPage() {
  return (
    <AppLayoutWrapper>
      <PartnershipContent />
    </AppLayoutWrapper>
  );
}
