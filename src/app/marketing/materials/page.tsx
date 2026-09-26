import React from "react";
import AppLayoutWrapper from "@/components/AppLayoutWrapper";
import MarketingMaterialsContent from "./components/MarketingMaterialsContent";

export const metadata = {
  title: "Marketing Materials | UniTrack",
  description: "Manage marketing material requests and assets",
};

export default function MarketingMaterialsPage() {
  return (
    <AppLayoutWrapper>
      <MarketingMaterialsContent />
    </AppLayoutWrapper>
  );
}