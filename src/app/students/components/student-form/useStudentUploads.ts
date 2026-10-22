"use client";

import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { toast } from "sonner";
import type { StudentFormData } from "./types";

export function useStudentUploads(setFormData: Dispatch<SetStateAction<StudentFormData>>) {
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const handleFileUpload = async (type: string, file: File) => {
    setUploadingDoc(type);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      const newDoc = {
        id: crypto.randomUUID?.() || Math.random().toString(36).substr(2, 9),
        type,
        name: file.name,
        url: data.url,
        status: "Uploaded",
      };
      setFormData((prev: StudentFormData) => ({
        ...prev,
        documents: [...prev.documents.filter((d) => d.type !== type), newDoc],
      }));
      toast.success(`${type} uploaded successfully`);
    } catch {
      toast.error(`Failed to upload ${type}`);
    } finally {
      setUploadingDoc(null);
    }
  };

  const handlePhotoUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be 5MB or smaller");
      return;
    }
    setUploadingPhoto(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setFormData((prev: StudentFormData) => ({ ...prev, photoUrl: data.url }));
      toast.success("Photo uploaded successfully");
    } catch {
      toast.error("Failed to upload photo");
    } finally {
      setUploadingPhoto(false);
    }
  };

  return { uploadingDoc, uploadingPhoto, handleFileUpload, handlePhotoUpload };
}
