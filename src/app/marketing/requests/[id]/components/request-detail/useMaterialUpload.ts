"use client";

import { useState } from "react";

export interface MaterialUploadState {
  uploading: boolean;
  dragActive: boolean;
  selectedFile: File | null;
  materialDescription: string;
  isFinal: boolean;
  setDragActive: (value: boolean) => void;
  setSelectedFile: (file: File | null) => void;
  setMaterialDescription: (value: string) => void;
  setIsFinal: (value: boolean) => void;
  handleUpload: () => Promise<void>;
}

export function useMaterialUpload({
  requestId,
  onUploaded,
}: {
  requestId: string;
  onUploaded: () => void;
}): MaterialUploadState {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [materialDescription, setMaterialDescription] = useState("");
  const [isFinal, setIsFinal] = useState(false);

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("requestId", requestId);
      formData.append("file", selectedFile);
      formData.append("isFinal", isFinal.toString());
      if (materialDescription) formData.append("description", materialDescription);

      const res = await fetch("/api/marketing/materials", {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      if (res.ok) {
        setSelectedFile(null);
        setMaterialDescription("");
        setIsFinal(false);
        onUploaded();
      }
    } catch (error) {
      console.error("Failed to upload:", error);
    } finally {
      setUploading(false);
    }
  };

  return {
    uploading,
    dragActive,
    selectedFile,
    materialDescription,
    isFinal,
    setDragActive,
    setSelectedFile,
    setMaterialDescription,
    setIsFinal,
    handleUpload,
  };
}
