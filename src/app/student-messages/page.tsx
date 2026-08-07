import React from "react";
import AppLayoutWrapper from "@/components/AppLayoutWrapper";
import AdminStudentMessagesContent from "./components/AdminStudentMessagesContent";

export const metadata = {
  title: "Messages | UniTrack",
  description: "Message with students and team",
};

export default function StudentMessagesPage() {
  return (
    <AppLayoutWrapper>
      <AdminStudentMessagesContent />
    </AppLayoutWrapper>
  );
}
