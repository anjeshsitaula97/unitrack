import React from "react";
import UniversityDetailContent from "../components/UniversityDetailContent";

export const metadata = {
  title: "University Details | UniTrack",
  description: "UniTrack administration - University Details",
};

export default async function UniversityPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  return <UniversityDetailContent id={id} />;
}
