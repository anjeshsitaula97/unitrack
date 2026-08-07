import AppLayoutWrapper from "@/components/AppLayoutWrapper";
import FaceEnrollmentContent from "./components/FaceEnrollmentContent";

export const metadata = {
  title: "Face Enrollment | UniTrack",
  description: "UniTrack administration - Face Enrollment",
};

export default function FaceEnrollmentPage() {
  return (
    <AppLayoutWrapper>
      <FaceEnrollmentContent />
    </AppLayoutWrapper>
  );
}
