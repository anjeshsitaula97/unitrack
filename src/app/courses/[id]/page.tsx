import React from "react";
import AppLayoutWrapper from "@/components/AppLayoutWrapper";
import CourseDetailContent from "../components/CourseDetailContent";

export const metadata = {
  title: "Course Details | UniTrack",
  description: "UniTrack administration - Course Details",
};

export default async function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <AppLayoutWrapper>
      <CourseDetailContent id={id} />
    </AppLayoutWrapper>
  );
}
