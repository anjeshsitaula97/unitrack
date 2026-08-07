"use client";

import { useRouter } from "next/navigation";
import AppLayoutWrapper from "@/components/AppLayoutWrapper";
import StudentForm from "@/app/students/components/StudentForm";

export default function NewStudentPage() {
  const router = useRouter();
  return (
    <AppLayoutWrapper>
      <StudentForm onSuccess={() => router.push("/students")} />
    </AppLayoutWrapper>
  );
}
