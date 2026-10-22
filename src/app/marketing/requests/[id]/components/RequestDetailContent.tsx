"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, XCircle } from "lucide-react";
import DeliveredMaterials from "./request-detail/DeliveredMaterials";
import RequestHeader from "./request-detail/RequestHeader";
import UploadSection from "./request-detail/UploadSection";
import type { MarketingRequest } from "./request-detail/types";
import { useMaterialUpload } from "./request-detail/useMaterialUpload";

export default function RequestDetailContent() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [request, setRequest] = useState<MarketingRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchRequest = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/marketing/requests/${id}`, { credentials: "include" });
      if (!res.ok) throw new Error(`Failed to fetch request: ${res.status}`);
      const data = await res.json();
      if (data.id) setRequest(data);
    } catch (error) {
      console.error("Failed to fetch request:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const {
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
  } = useMaterialUpload({ requestId: id, onUploaded: fetchRequest });

  useEffect(() => {
    const controller = new AbortController();
    let ignore = false;
    (async () => {
      try {
        const res = await fetch(`/api/marketing/requests/${id}`, {
          credentials: "include",
          signal: controller.signal,
        });
        if (res.ok) {
          const data = await res.json();
          if (!ignore) setRequest(data);
        }
      } catch (error) {
        if (ignore) return;
        console.error("Failed to fetch request:", error);
      } finally {
        if (!ignore) setIsLoading(false);
      }
    })();
    return () => {
      ignore = true;
      controller.abort();
    };
  }, [id]);

  const handleSaveStatus = async (status: string) => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/marketing/requests/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      if (res.ok) fetchRequest();
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteMaterial = async (materialId: number) => {
    if (!confirm("Delete this material?")) return;
    try {
      await fetch(`/api/marketing/materials/${materialId}`, {
        method: "DELETE",
        credentials: "include",
      });
      fetchRequest();
    } catch (error) {
      console.error("Failed to delete material:", error);
    }
  };

  const handleDownload = (url: string, fileName: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
  };

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
        <p className="mt-4 text-slate-500">Loading request details...</p>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <XCircle size={48} className="text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">Request not found</h2>
        <button
          onClick={() => router.push("/marketing/materials")}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
        >
          Back to Marketing Materials
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <RequestHeader
        request={request}
        isSaving={isSaving}
        onSaveStatus={handleSaveStatus}
        onBack={() => router.push("/marketing/materials")}
      />

      <UploadSection
        uploading={uploading}
        dragActive={dragActive}
        selectedFile={selectedFile}
        materialDescription={materialDescription}
        isFinal={isFinal}
        setDragActive={setDragActive}
        setSelectedFile={setSelectedFile}
        setMaterialDescription={setMaterialDescription}
        setIsFinal={setIsFinal}
        handleUpload={handleUpload}
      />

      <DeliveredMaterials
        materials={request.materials}
        onDownload={handleDownload}
        onDelete={handleDeleteMaterial}
      />
    </div>
  );
}
