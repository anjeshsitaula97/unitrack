"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  Upload,
  Image,
  Video,
  FileText,
  Download,
  Trash2,
  CheckCircle,
  XCircle,
  User,
  Calendar,
  Clock,
  Megaphone,
  Save,
} from "lucide-react";

function formatDate(dateStr: string | null) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return (
    d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) +
    " " +
    d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
  );
}

type MarketingRequest = {
  id: number;
  title: string;
  description: string;
  type: string;
  status: string;
  priority: string;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  requestedBy: number;
  assignedTo: number | null;
  requester: { id: number; name: string; email: string; avatar: string | null };
  assignee: { id: number; name: string; email: string; avatar: string | null } | null;
  materials: MarketingMaterial[];
};

type MarketingMaterial = {
  id: number;
  requestId: number;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedBy: number;
  description: string | null;
  isFinal: boolean;
  createdAt: string;
  uploader: { id: number; name: string; avatar: string | null };
};

const STATUS_COLORS: Record<string, string> = {
  Pending: "bg-yellow-100 text-yellow-700",
  "In Progress": "bg-blue-100 text-blue-700",
  Completed: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-700",
};

const PRIORITY_COLORS: Record<string, string> = {
  Low: "bg-slate-100 text-slate-700",
  Medium: "bg-blue-100 text-blue-700",
  High: "bg-orange-100 text-orange-700",
  Urgent: "bg-red-100 text-red-700",
};

const STATUS_OPTIONS = ["Pending", "In Progress", "Completed", "Cancelled"];

export default function RequestDetailContent() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [request, setRequest] = useState<MarketingRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [materialDescription, setMaterialDescription] = useState("");
  const [isFinal, setIsFinal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fetchRequest = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/marketing/requests/${id}`, { credentials: "include" });
      const data = await res.json();
      if (data.id) setRequest(data);
    } catch (error) {
      console.error("Failed to fetch request:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequest();
  }, [id]);

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("requestId", id);
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
        fetchRequest();
      }
    } catch (error) {
      console.error("Failed to upload:", error);
    } finally {
      setUploading(false);
    }
  };

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

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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
        <h2 className="text-xl font-bold text-slate-900 mb-2">
          Request not found
        </h2>
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
      {/* Back button */}
      <button
        onClick={() => router.push("/marketing/materials")}
        className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors text-sm font-medium"
      >
        <ArrowLeft size={16} /> Back to Marketing Materials
      </button>

      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-4 bg-indigo-100 rounded-xl text-indigo-600">
              <Megaphone size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{request.title}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[request.status]}`}>
                  {request.status}
                </span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${PRIORITY_COLORS[request.priority]}`}>
                  {request.priority} priority
                </span>
                <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
                  {request.type}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {STATUS_OPTIONS.map((status) => (
              <button
                key={status}
                onClick={() => handleSaveStatus(status)}
                disabled={isSaving || status === request.status}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                  request.status === status
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Details */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <User size={20} className="text-indigo-500" />
            <div>
              <p className="text-xs text-slate-500">Requested by</p>
              <p className="text-sm font-medium text-slate-900">{request.requester.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <User size={20} className="text-emerald-500" />
            <div>
              <p className="text-xs text-slate-500">Assigned to</p>
              <p className="text-sm font-medium text-slate-900">
                {request.assignee?.name || "Unassigned"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <Calendar size={20} className="text-orange-500" />
            <div>
              <p className="text-xs text-slate-500">Due date</p>
              <p className="text-sm font-medium text-slate-900">
                {formatDate(request.dueDate)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <Clock size={20} className="text-purple-500" />
            <div>
              <p className="text-xs text-slate-500">Created</p>
              <p className="text-sm font-medium text-slate-900">
                {formatDate(request.createdAt)}
              </p>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-slate-700 mb-2">Description</h3>
          <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">
            {request.description}
          </p>
        </div>
      </div>

      {/* Upload section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
          <Upload size={20} className="text-indigo-600" />
          Upload Completed Work
        </h2>

        {/* Drag & drop area */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragActive(false);
            const file = e.dataTransfer.files[0];
            if (file) setSelectedFile(file);
          }}
          className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors ${
            dragActive
              ? "border-indigo-500 bg-indigo-50"
              : "border-slate-300 hover:border-indigo-400"
          }`}
        >
          <input
            type="file"
            id="material-upload"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) setSelectedFile(file);
            }}
          />
          {selectedFile ? (
            <div className="flex items-center justify-center gap-4">
              <div className="p-3 bg-indigo-100 rounded-lg text-indigo-600">
                {selectedFile.type.startsWith("image/") ? (
                  <Image size={24} />
                ) : selectedFile.type.startsWith("video/") ? (
                  <Video size={24} />
                ) : (
                  <FileText size={24} />
                )}
              </div>
              <div className="text-left">
                <p className="font-medium text-slate-900">{selectedFile.name}</p>
                <p className="text-sm text-slate-500">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
              <button
                onClick={() => setSelectedFile(null)}
                className="p-2 text-slate-400 hover:text-red-600"
              >
                <XCircle size={20} />
              </button>
            </div>
          ) : (
            <>
              <Upload size={32} className="text-slate-400 mx-auto mb-3" />
              <p className="text-slate-600 font-medium mb-1">
                Drag and drop your file here, or
              </p>
              <button
                onClick={() => document.getElementById("material-upload")?.click()}
                className="text-indigo-600 font-medium hover:underline"
              >
                browse files
              </button>
              <p className="mt-2 text-xs text-slate-400">
                Images (PNG, JPG, SVG), Videos (MP4, MOV), Documents (PDF, PSD)
              </p>
            </>
          )}
        </div>

        {/* Upload options */}
        <div className="mt-4 space-y-3">
          <input
            type="text"
            value={materialDescription}
            onChange={(e) => setMaterialDescription(e.target.value)}
            placeholder="Add a description (optional)"
            className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
          />
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={isFinal}
              onChange={(e) => setIsFinal(e.target.checked)}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            Mark as final version
          </label>
          <button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {uploading ? (
              <>
                <Loader2 className="animate-spin" size={16} /> Uploading...
              </>
            ) : (
              <>
                <Upload size={16} /> Upload Material
              </>
            )}
          </button>
        </div>
      </div>

      {/* Delivered materials */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
          <CheckCircle size={20} className="text-green-500" />
          Delivered Materials ({request.materials.length})
        </h2>

        {request.materials.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-slate-400">
              No materials uploaded yet. Upload the first file above.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {request.materials.map((material) => (
              <div
                key={material.id}
                className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden"
              >
                {/* Preview */}
                <div className="aspect-video bg-slate-200 flex items-center justify-center">
                  {material.fileType === "image" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={material.fileUrl}
                      alt={material.fileName}
                      className="w-full h-full object-contain"
                    />
                  ) : material.fileType === "video" ? (
                    <video
                      src={material.fileUrl}
                      controls
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <FileText size={48} className="text-slate-400" />
                  )}
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {material.fileName}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatFileSize(material.fileSize)} • {material.uploader.name}
                      </p>
                      {material.description && (
                        <p className="text-xs text-slate-600 mt-1 break-words">
                          {material.description}
                        </p>
                      )}
                      {material.isFinal && (
                        <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
                          <CheckCircle size={10} /> Final version
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <button
                      onClick={() => handleDownload(material.fileUrl, material.fileName)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-700 transition-colors"
                    >
                      <Download size={14} /> Download
                    </button>
                    <button
                      onClick={() => handleDeleteMaterial(material.id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}