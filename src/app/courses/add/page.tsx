import React from "react";
import AppLayoutWrapper from "@/components/AppLayoutWrapper";
import AddCourseContent from "../components/AddCourseContent";

export const metadata = {
  title: "Add Course | UniTrack",
  description: "UniTrack administration - Add Course",
};

export default function AddCoursePage() {
  return (
    <AppLayoutWrapper>
      <AddCourseContent />
    </AppLayoutWrapper>
  );
}
