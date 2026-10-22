import { toast } from "sonner";
import type { Student, StudentFormData } from "./types";

export async function submitStudentForm({
  initialStudent,
  formData,
  onSuccess,
}: {
  initialStudent?: Student | null;
  formData: StudentFormData;
  onSuccess: () => void;
}) {
  const isEditing = !!initialStudent;
  const method = isEditing ? "PUT" : "POST";
  const url = isEditing ? `/api/students/${initialStudent!.id}` : "/api/students";
  // The phone field may already carry a country code, in which case adding
  // the prefix again produced "+977 +977 9800000000".
  const phone = formData.phone.trim();
  const prefixedPhone =
    /^\+?[\d\s()-]+$/.test(phone) && phone.startsWith("+")
      ? phone
      : `${formData.phonePrefix} ${phone}`.trim();

  const submissionData = { ...formData, phone: prefixedPhone };
  try {
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(submissionData),
    });
    if (res.ok) {
      const responseData = await res.json();
      if (!isEditing && responseData.generatedPassword) {
        toast.success(`Student added. Portal password: ${responseData.generatedPassword}`, {
          duration: 10000,
        });
      } else {
        toast.success(isEditing ? "Student updated" : "Student added");
      }
      onSuccess();
    } else {
      const error = await res.json();
      toast.error(error.error || "Operation failed");
    }
  } catch (_err) {
    toast.error("Error connecting to server");
  }
}
