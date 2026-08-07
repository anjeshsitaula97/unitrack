"use client";

import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import AppLayoutWrapper from "@/components/AppLayoutWrapper";
import StudentForm from "@/app/students/components/StudentForm";
import type { Student } from "@/app/students/components/StudentForm";
import { toast } from "sonner";

export default function EditStudentPage() {
  const router = useRouter();
  const params = useParams();
  const studentId = params.id as string;
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentId) return;
    fetch(`/api/students/${studentId}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Not found");
        const data = await res.json();
        setStudent(data);
      })
      .catch(() => {
        toast.error("Failed to load student");
        router.push("/students");
      })
      .finally(() => setLoading(false));
  }, [studentId, router]);

  if (loading) {
    return (
      <AppLayoutWrapper>
        <div className="min-h-screen bg-slate-50/50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-slate-400">
            <Loader2 className="animate-spin" size={32} />
            <p className="text-sm font-bold">Loading student…</p>
          </div>
        </div>
      </AppLayoutWrapper>
    );
  }

  if (!student) return null;

  return (
    <AppLayoutWrapper>
      <StudentForm
        initialStudent={student}
        onSuccess={() => router.push(`/students/${studentId}`)}
      />
    </AppLayoutWrapper>
  );
}
