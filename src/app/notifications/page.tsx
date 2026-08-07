import React from "react";
import AppLayoutWrapper from "@/components/AppLayoutWrapper";
import NotificationsContent from "./components/NotificationsContent";

export const metadata = {
  title: "Notifications | UniTrack",
  description: "UniTrack administration - Notifications",
};

export default function NotificationsPage() {
  return (
    <AppLayoutWrapper>
      <NotificationsContent />
    </AppLayoutWrapper>
  );
}
