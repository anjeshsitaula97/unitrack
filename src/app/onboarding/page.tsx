import React from "react";
import AppLayoutWrapper from "@/components/AppLayoutWrapper";
import OnboardingContent from "./OnboardingContent";

export const metadata = { title: "Student Onboarding | UniTrack" };

export default function OnboardingPage() {
  return (
    <AppLayoutWrapper>
      <OnboardingContent />
    </AppLayoutWrapper>
  );
}
