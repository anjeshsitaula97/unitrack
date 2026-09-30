"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import {
  FolderPlus,
  FileText,
  Upload,
  Scan,
  X,
  Camera,
  Trash2,
  Download,
  Loader2,
  ChevronLeft,
  Image as ImageIcon,
  File,
  AlertCircle,
  Sliders,
  RotateCw,
  User,
  Folder,
  Plus,
  ArrowUpDown,
  BarChart3,
  Map,
  Package,
  Eye,
  FileArchive,
} from "lucide-react";
import JSZip from "jszip";
import NextImage from "next/image";
import { SkeletonTable } from "@/components/Skeleton";
import { toast } from "sonner";

const softShadow = { boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.03)" } as const;
const activeShadow = { boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.06)" } as const;

const DPI_OPTIONS = [
  { label: "Screen (72 DPI)", value: 72, width: 1024 },
  { label: "Draft (150 DPI)", value: 150, width: 1600 },
  { label: "Standard (200 DPI)", value: 200, width: 2048 },
  { label: "High (300 DPI)", value: 300, width: 2560 },
];

const PAGE_SIZE = 5;

function formatTableDate(date: Date): string {
  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getFileIcon(fileType: string | null | undefined, name?: string) {
  const cls = "text-[#45464d]";
  if (fileType?.startsWith("image/")) return <ImageIcon size={20} className={cls} />;
  if (fileType?.includes("pdf")) return <FileText size={20} className={cls} />;
  const lower = (name || "").toLowerCase();
  if (lower.includes("report") || lower.includes("analytics"))
    return <BarChart3 size={20} className={cls} />;
  if (lower.includes("roadmap") || lower.includes("map")) return <Map size={20} className={cls} />;
  if (lower.includes("sprint") || lower.includes("inventory"))
    return <Package size={20} className={cls} />;
  return <File size={20} className={cls} />;
}

function addedByLabel(file: FileData, folderName?: string) {
  const name = file.user?.name || file.addedByName || folderName || file.name || "Unknown";
  return name;
}

function avatarTone(seed: string) {
  const tones = [
    "bg-[#2170e4] text-[#fefcff]",
    "bg-[#fcdeb5] text-[#271901]",
    "bg-[#dae2fd] text-[#131b2e]",
    "bg-[#d8e2ff] text-[#001a42]",
    "bg-[#574425] text-[#fcdeb5]",
  ];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash + seed.charCodeAt(i)) % tones.length;
  return tones[hash];
}

interface FolderData {
  id: string;
  name: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  _count: { files: number };
  __studentId?: string;
}

interface FileData {
  id: string;
  name: string;
  url: string;
  fileSize: number;
  fileType: string;
  folderId?: string;
  userId?: string;
  user?: { name?: string };
  addedByName?: string;
  createdAt: string;
  __studentId?: string;
  uploadedAt?: string;
  academicDocument?: { id: string; name: string } | null;
}

// The API returns numeric primary keys while these models declare string ids.
// Normalising on read keeps `String.prototype` calls (e.g. startsWith) safe.
function normalizeFolder(folder: unknown): FolderData {
  const f = folder as Record<string, unknown>;
  return {
    ...(f as unknown as FolderData),
    id: String(f.id),
    userId: String(f.userId),
  };
}

function normalizeFile(file: unknown): FileData {
  const f = file as Record<string, unknown>;
  return {
    ...(f as unknown as FileData),
    id: String(f.id),
    folderId: f.folderId != null ? String(f.folderId) : undefined,
    userId: f.userId != null ? String(f.userId) : undefined,
  };
}

function CreateFolderDialog({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (name: string) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        setName("");
        inputRef.current?.focus();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      await onSubmit(name.trim());
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
      role="presentation"
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-800">Create Folder</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100"
            aria-label="Close dialog"
          >
            <X size={18} className="text-slate-400" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <label htmlFor="folder-name" className="block text-sm font-medium text-slate-700 mb-1.5">
            Folder Name
          </label>
          <input
            id="folder-name"
            ref={inputRef}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. John Doe"
            aria-label="Folder name"
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
          <div className="flex justify-end gap-2 mt-5">
            <button type="button" onClick={onClose} className="btn-secondary text-sm px-4 py-2">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="btn-primary text-sm px-4 py-2"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <FolderPlus size={14} />}
              {loading ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddFileDialog({
  open,
  onClose,
  onSubmit,
  academicDocs,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (file: File, academicDocumentId?: string) => Promise<void>;
  academicDocs: { id: string; name: string }[];
}) {
  const [loading, setLoading] = useState(false);
  const [academicDocumentId, setAcademicDocumentId] = useState("");
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        setAcademicDocumentId("");
        setError("");
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [open]);

  if (!open) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setError("");
    try {
      await onSubmit(file, academicDocumentId || undefined);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
      role="presentation"
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-800">Add File</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100"
            aria-label="Close dialog"
          >
            <X size={18} className="text-slate-400" />
          </button>
        </div>
        <div className="py-4">
          {academicDocs.length > 0 && (
            <div className="mb-5">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Academic Document (optional)
              </label>
              <select
                value={academicDocumentId}
                onChange={(e) => setAcademicDocumentId(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
              >
                <option value="">— None —</option>
                {academicDocs.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          {error && (
            <p
              role="alert"
              className="mb-4 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700"
            >
              {error}
            </p>
          )}
          <div className="text-center">
            {loading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 size={32} className="animate-spin text-indigo-600" />
                <p className="text-sm text-slate-500">Uploading file&hellip;</p>
              </div>
            ) : (
              <>
                <Upload size={48} className="text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-500 mb-4">Select a file from your computer</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileChange}
                  aria-label="File upload"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-primary text-sm px-6 py-2.5"
                >
                  <Upload size={14} />
                  Browse Files
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface ScannerInfo {
  id: string;
  name: string;
  source?: string;
}

function ScanDialog({
  open,
  onClose,
  onSubmit,
  folderName,
  academicDocs,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (blob: Blob, filename: string, academicDocumentId?: string) => Promise<void>;
  folderName: string;
  academicDocs: { id: string; name: string }[];
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const prevOpenRef = useRef(open);

  const [mode, setMode] = useState<"select" | "camera" | "scanner">("select");
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [dpi, setDpi] = useState(200);
  const [isUploading, setIsUploading] = useState(false);
  const [scannerScanning, setScannerScanning] = useState(false);
  const [scanners, setScanners] = useState<ScannerInfo[]>([]);
  const [selectedScannerId, setSelectedScannerId] = useState<string>("");
  const [scannerStatus, setScannerStatus] = useState<"idle" | "loading" | "connected" | "error">(
    "idle"
  );
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [academicDocumentId, setAcademicDocumentId] = useState("");

  useEffect(() => {
    if (open && !prevOpenRef.current) {
      const timer = setTimeout(() => {
        setMode("select");
        setCameraActive(false);
        setCapturedImage(null);
        setCameraError(null);
        setScannerScanning(false);
        setScanners([]);
        setSelectedScannerId("");
        setScannerStatus("idle");
        setScannerError(null);
        setAcademicDocumentId("");
      }, 0);
      prevOpenRef.current = open;
      return () => clearTimeout(timer);
    }
    prevOpenRef.current = open;
  }, [open]);

  const currentDpiConfig = DPI_OPTIONS.find((d) => d.value === dpi) || DPI_OPTIONS[2];

  useEffect(() => {
    const stream = streamRef.current;
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const fetchScanners = useCallback(async () => {
    setScannerStatus("loading");
    setScannerError(null);
    try {
      const res = await fetch("http://localhost:5899/scanners");
      if (!res.ok) throw new Error("Scanner agent not available");
      const data = await res.json();
      let list = data.scanners || [];
      if (!Array.isArray(list)) list = [list];
      list = list.filter((s: ScannerInfo) => s && s.id && s.name);
      setScanners(list);
      if (list.length > 0) {
        setSelectedScannerId(list[0].id);
        setScannerStatus("connected");
      } else {
        setScannerError("No scanners found on this system.");
        setScannerStatus("error");
      }
    } catch {
      setScannerError("Scanner agent is not running. Start it with: node scanner-agent/index.js");
      setScannerStatus("error");
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
    setCameraError(null);
  }, []);

  const startCamera = async () => {
    setCameraError(null);
    setMode("camera");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: currentDpiConfig.width } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("Permission") || msg.includes("NotAllowed")) {
        setCameraError("Camera access denied. Please allow camera permissions.");
      } else if (msg.includes("NotFound")) {
        setCameraError("No camera found on this device.");
      } else {
        setCameraError("Could not access camera.");
      }
    }
  };

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const targetWidth = currentDpiConfig.width;
    const targetHeight = Math.round(targetWidth * (video.videoHeight / video.videoWidth));
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, targetWidth, targetHeight);
    const quality = dpi >= 300 ? 0.95 : dpi >= 200 ? 0.9 : 0.8;
    const dataUrl = canvas.toDataURL("image/jpeg", quality);
    setCapturedImage(dataUrl);
    stopCamera();
  };

  const handleUploadCapture = async () => {
    if (!capturedImage) return;
    setIsUploading(true);
    try {
      const blob = await (await fetch(capturedImage)).blob();
      const filename = `scan_${Date.now()}.jpg`;
      await onSubmit(blob, filename, academicDocumentId || undefined);
      toast.success("Document scanned successfully");
      onClose();
    } catch {
      toast.error("Failed to upload scanned document");
    } finally {
      setIsUploading(false);
    }
  };

  const handleScannerScan = async () => {
    if (!selectedScannerId) return;
    setScannerScanning(true);
    try {
      const res = await fetch("http://localhost:5899/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scannerId: selectedScannerId, dpi }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Scanner not available");
      }
      const data = await res.json();
      if (data.data) {
        const blob = await (await fetch(data.data)).blob();
        await onSubmit(blob, `scan_${Date.now()}.jpg`, academicDocumentId || undefined);
        toast.success("Document scanned from device");
        onClose();
      } else {
        throw new Error("No scan data received");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Scanner device failed");
    } finally {
      setScannerScanning(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
      role="presentation"
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scan size={16} className="text-indigo-600" />
            <h3 className="font-bold text-slate-800">
              {mode === "camera"
                ? "Camera Scan"
                : mode === "scanner"
                  ? "Scanner Device"
                  : `Scan to "${folderName}"`}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100"
            aria-label="Close dialog"
          >
            <X size={18} className="text-slate-400" />
          </button>
        </div>

        <div className="p-5">
          {mode === "select" && (
            <>
              {academicDocs.length > 0 && (
                <div className="mb-5">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Academic Document (optional)
                  </label>
                  <select
                    value={academicDocumentId}
                    onChange={(e) => setAcademicDocumentId(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
                  >
                    <option value="">— None —</option>
                    {academicDocs.map((doc) => (
                      <option key={doc.id} value={doc.id}>
                        {doc.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={startCamera}
                  className="flex flex-col items-center gap-3 p-8 border-2 border-dashed border-slate-200 rounded-xl hover:border-indigo-300 hover:bg-indigo-50/40 transition-all"
                >
                  <Camera size={40} className="text-indigo-500" />
                  <div>
                    <p className="font-semibold text-slate-700">Camera Scan</p>
                    <p className="text-xs text-slate-400 mt-0.5">Use your device camera</p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode("scanner");
                    fetchScanners();
                  }}
                  className="flex flex-col items-center gap-3 p-8 border-2 border-dashed border-slate-200 rounded-xl hover:border-indigo-300 hover:bg-indigo-50/40 transition-all"
                >
                  <Scan size={40} className="text-indigo-500" />
                  <div>
                    <p className="font-semibold text-slate-700">Scanner Device</p>
                    <p className="text-xs text-slate-400 mt-0.5">Use connected scanner hardware</p>
                  </div>
                </button>
              </div>
            </>
          )}

          {mode === "camera" && (
            <div>
              <div className="relative bg-slate-900 rounded-xl overflow-hidden min-h-[300px] flex items-center justify-center">
                {cameraError && (
                  <div className="text-center p-6">
                    <AlertCircle size={40} className="text-red-400 mx-auto mb-3" />
                    <p className="text-white/80 font-medium mb-1">Camera Error</p>
                    <p className="text-white/50 text-xs max-w-sm">{cameraError}</p>
                    <button
                      type="button"
                      onClick={startCamera}
                      className="btn-primary mt-3 text-sm"
                    >
                      Try Again
                    </button>
                  </div>
                )}
                {!cameraError && !cameraActive && !capturedImage && (
                  <div className="text-center p-6">
                    <Camera size={48} className="text-slate-600 mx-auto mb-3" />
                    <p className="text-white/70 text-sm mb-4">Click Start Camera to begin</p>
                    <button type="button" onClick={startCamera} className="btn-primary">
                      <Camera size={14} />
                      Start Camera
                    </button>
                  </div>
                )}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  aria-label="Camera preview"
                  className={`w-full max-h-[400px] object-contain ${cameraActive ? "block" : "hidden"}`}
                />
                {capturedImage && (
                  <NextImage
                    src={capturedImage}
                    alt="Captured"
                    width={800}
                    height={600}
                    className="max-w-full max-h-[400px] object-contain p-2"
                  />
                )}
                <canvas ref={canvasRef} className="hidden" />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
                <div className="flex items-center gap-2">
                  {cameraActive && (
                    <button type="button" onClick={captureImage} className="btn-primary text-sm">
                      <Camera size={14} />
                      Capture
                    </button>
                  )}
                  {capturedImage && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setCapturedImage(null);
                          startCamera();
                        }}
                        className="btn-secondary text-sm"
                      >
                        <RotateCw size={14} />
                        Recapture
                      </button>
                      <button
                        type="button"
                        onClick={handleUploadCapture}
                        disabled={isUploading}
                        className="btn-primary text-sm"
                      >
                        {isUploading ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Upload size={14} />
                        )}
                        {isUploading ? "Uploading..." : "Save to Folder"}
                      </button>
                    </>
                  )}
                  {!cameraActive && !capturedImage && (
                    <button
                      type="button"
                      onClick={() => setMode("select")}
                      className="btn-secondary text-sm"
                    >
                      <ChevronLeft size={14} />
                      Back
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Sliders size={14} className="text-slate-400" />
                  <select
                    value={dpi}
                    onChange={(e) => setDpi(Number(e.target.value))}
                    aria-label="DPI setting"
                    className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 cursor-pointer"
                  >
                    {DPI_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {mode === "scanner" && (
            <div>
              {scannerStatus === "loading" && (
                <div className="text-center py-8">
                  <Loader2 size={40} className="animate-spin text-indigo-500 mx-auto mb-3" />
                  <p className="text-sm text-slate-500">Discovering scanners&hellip;</p>
                </div>
              )}
              {scannerStatus === "error" && (
                <div className="text-center py-8">
                  <AlertCircle size={40} className="text-red-300 mx-auto mb-3" />
                  <p className="font-semibold text-slate-700 mb-1">Scanner Agent Unavailable</p>
                  <p className="text-xs text-slate-400 mb-4 max-w-sm mx-auto">{scannerError}</p>
                  <div className="bg-slate-50 rounded-lg p-4 mb-4 text-left text-xs font-mono text-slate-500">
                    <p className="font-semibold text-slate-700 mb-1">To start the scanner agent:</p>
                    <p>cd scanner-agent</p>
                    <p>node index.js</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setMode("select");
                    }}
                    className="btn-secondary text-sm px-4 py-2"
                  >
                    <ChevronLeft size={14} />
                    Back
                  </button>
                </div>
              )}
              {scannerStatus === "connected" && (
                <div>
                  <div className="mb-5">
                    <p className="text-sm font-semibold text-slate-700 mb-3">Select Scanner</p>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {scanners.map((s) => {
                        const isWia = s.source === "WIA" || s.id.startsWith("{");
                        return (
                          <label
                            key={s.id}
                            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                              selectedScannerId === s.id
                                ? "border-indigo-300 bg-indigo-50/50"
                                : "border-slate-200 hover:border-slate-300"
                            } ${!isWia ? "opacity-50" : ""}`}
                          >
                            <input
                              type="radio"
                              name="scanner"
                              value={s.id}
                              checked={selectedScannerId === s.id}
                              onChange={() => isWia && setSelectedScannerId(s.id)}
                              disabled={!isWia}
                              aria-label={s.name}
                              className="accent-indigo-600"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-medium text-slate-700 truncate">
                                  {s.name}
                                </p>
                                <span
                                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                                    isWia
                                      ? "bg-green-100 text-green-700"
                                      : "bg-slate-100 text-slate-400"
                                  }`}
                                >
                                  {isWia
                                    ? "Ready"
                                    : s.source === "Printer"
                                      ? "Printer"
                                      : "No driver"}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-400 font-mono truncate max-w-sm">
                                {s.id}
                              </p>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3 mb-5">
                    <div className="flex items-center gap-2">
                      <Sliders size={14} className="text-slate-400" />
                      <select
                        value={dpi}
                        onChange={(e) => setDpi(Number(e.target.value))}
                        aria-label="DPI setting"
                        className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 cursor-pointer"
                      >
                        {DPI_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={fetchScanners}
                      className="text-xs text-indigo-600 hover:text-indigo-800 transition-colors"
                    >
                      Refresh list
                    </button>
                  </div>
                  {selectedScannerId && !selectedScannerId.startsWith("{") && (
                    <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2 mb-4">
                      This device needs a WIA scanner driver for scanning. Only devices marked{" "}
                      <strong>Ready</strong> can be used.
                    </p>
                  )}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleScannerScan}
                      disabled={
                        scannerScanning || !selectedScannerId || !selectedScannerId.startsWith("{")
                      }
                      className="btn-primary text-base px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {scannerScanning ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Scan size={16} />
                      )}
                      {scannerScanning ? "Scanning..." : "Scan Now"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setMode("select")}
                      className="btn-secondary text-sm px-4 py-2"
                    >
                      <ChevronLeft size={14} />
                      Back
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FolderCardIcon({ student }: { student?: boolean }) {
  return (
    <div className="w-20 h-20 mb-4 relative">
      <div
        className={`w-full h-full rounded-lg flex items-center justify-center ${student ? "bg-[#d8e2ff]" : "bg-[#adc6ff]"}`}
      >
        {student ? (
          <User size={40} className="text-[#0058be]" strokeWidth={1.5} />
        ) : (
          <Folder size={40} className="text-[#0058be]" fill="#0058be" strokeWidth={0} />
        )}
      </div>
    </div>
  );
}

export default function FileManager() {
  const searchParams = useSearchParams();
  const [folders, setFolders] = useState<FolderData[] | undefined>(undefined);
  const [selectedFolder, setSelectedFolder] = useState<FolderData | null>(null);
  const [files, setFiles] = useState<FileData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filesLoading, setFilesLoading] = useState(false);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [showAddFile, setShowAddFile] = useState(false);
  const [showScan, setShowScan] = useState(false);
  const [academicDocs, setAcademicDocs] = useState<{ id: string; name: string }[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [filePage, setFilePage] = useState(0);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchAcademicDocuments = async () => {
    try {
      const res = await fetch("/api/academic-documents");
      if (res.ok) {
        const data = await res.json();
        setAcademicDocs(Array.isArray(data) ? data : []);
      }
    } catch {
      // silent
    }
  };

  const fetchFolders = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/files/folders");
      if (res.ok) {
        const data = await res.json();
        setFolders(Array.isArray(data) ? data.map(normalizeFolder) : []);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const fetchFoldersRef = useRef(fetchFolders);
  const fetchAcademicDocumentsRef = useRef(fetchAcademicDocuments);
  useEffect(() => {
    fetchFoldersRef.current = fetchFolders;
    fetchAcademicDocumentsRef.current = fetchAcademicDocuments;
    fetchFoldersRef.current();
    fetchAcademicDocumentsRef.current();
  }, []);

  const fetchFiles = async (rawFolderId: string | number) => {
    setFilesLoading(true);
    const folderId = String(rawFolderId);
    try {
      if (folderId.startsWith("student_")) {
        const studentId = folderId.replace("student_", "");
        const res = await fetch(`/api/students/${studentId}`);
        if (res.ok) {
          const student = await res.json();
          setFiles(
            Array.isArray(student.documents)
              ? student.documents.map((d: FileData) => ({
                  ...normalizeFile(d),
                  __studentId: studentId,
                }))
              : []
          );
        }
      } else {
        const res = await fetch(`/api/files?folderId=${folderId}`);
        if (res.ok) {
          const data = await res.json();
          setFiles(Array.isArray(data) ? data.map(normalizeFile) : []);
        }
      }
    } catch (error) {
      console.error("Failed to load files", error);
      toast.error("Failed to load files");
      setFiles([]);
    } finally {
      setFilesLoading(false);
    }
  };

  const handleCreateFolder = async (name: string) => {
    const res = await fetch("/api/files/folders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) throw new Error("Failed to create folder");
    const folder = normalizeFolder(await res.json());
    setFolders((prev) => [folder, ...(prev ?? [])]);
    toast.success("Folder created");
  };

  const handleDeleteFolder = async (id: string) => {
    if (id.startsWith("student_")) return;
    const res = await fetch(`/api/files/folders?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setFolders((prev) => (prev ?? []).filter((f) => f.id !== id));
      if (selectedFolder?.id === id) {
        setSelectedFolder(null);
        setFiles([]);
      }
      toast.success("Folder deleted");
    } else {
      toast.error("Failed to delete folder");
    }
  };

  const handleAddFile = async (file: File, academicDocumentId?: string) => {
    if (!selectedFolder) return;
    const formData = new FormData();
    formData.append("file", file);
    if (academicDocumentId) formData.append("academicDocumentId", academicDocumentId);
    const res = await fetch(`/api/files/upload?folderId=${selectedFolder.id}`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      throw new Error(body?.error || "Upload failed");
    }
    const newFile = normalizeFile(await res.json());
    setFiles((prev) => [newFile, ...(prev ?? [])]);
    setFolders((prev) =>
      (prev ?? []).map((f) =>
        f.id === selectedFolder.id ? { ...f, _count: { files: (f._count?.files ?? 0) + 1 } } : f
      )
    );
    toast.success("File uploaded");
  };

  const handleScanSubmit = async (blob: Blob, filename: string, academicDocumentId?: string) => {
    if (!selectedFolder) return;
    const formData = new FormData();
    formData.append("file", blob, filename);
    if (academicDocumentId) formData.append("academicDocumentId", academicDocumentId);
    const res = await fetch(`/api/files/upload?folderId=${selectedFolder.id}`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      throw new Error(body?.error || "Upload failed");
    }
    const newFile = normalizeFile(await res.json());
    setFiles((prev) => [newFile, ...(prev ?? [])]);
    setFolders((prev) =>
      (prev ?? []).map((f) =>
        f.id === selectedFolder.id ? { ...f, _count: { files: (f._count?.files ?? 0) + 1 } } : f
      )
    );
  };

  const handleDeleteFile = async (file: FileData) => {
    let url: string;
    if (file.__studentId) {
      url = `/api/students/${file.__studentId}/documents?documentId=${file.id}`;
    } else {
      url = `/api/files?id=${file.id}`;
    }
    const res = await fetch(url, { method: "DELETE" });
    if (res.ok) {
      setFiles((prev) => (prev ?? []).filter((f) => f.id !== file.id));
      if (selectedFolder) {
        setFolders((prev) =>
          (prev ?? []).map((f) =>
            f.id === selectedFolder.id
              ? { ...f, _count: { files: Math.max(0, (f._count?.files ?? 0) - 1) } }
              : f
          )
        );
      }
      toast.success("File deleted");
    } else {
      toast.error("Failed to delete file");
    }
  };

  const handleBulkDelete = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    if (!confirm(`Delete ${ids.length} file${ids.length > 1 ? "s" : ""}?`)) return;

    let deleted = 0;
    for (const id of ids) {
      const file = files.find((f) => f.id === id);
      if (!file) continue;
      let url: string;
      if (file.__studentId) {
        url = `/api/students/${file.__studentId}/documents?documentId=${file.id}`;
      } else {
        url = `/api/files?id=${file.id}`;
      }
      const res = await fetch(url, { method: "DELETE" });
      if (res.ok) deleted++;
    }

    if (deleted > 0) {
      setFiles((prev) => prev.filter((f) => !selectedIds.has(f.id)));
      if (selectedFolder) {
        setFolders((prev) =>
          (prev ?? []).map((f) =>
            f.id === selectedFolder.id
              ? { ...f, _count: { files: Math.max(0, (f._count?.files ?? 0) - deleted) } }
              : f
          )
        );
      }
      setSelectedIds(new Set());
      toast.success(`${deleted} file${deleted > 1 ? "s" : ""} deleted`);
    }
  };

  const handleBulkDownloadZip = async () => {
    const ids = Array.from(selectedIds);
    const selectedFiles = files.filter((f) => ids.includes(f.id));
    if (selectedFiles.length === 0) return;

    const toastId = toast.loading(
      `Preparing ${selectedFiles.length} file${selectedFiles.length > 1 ? "s" : ""}...`
    );
    try {
      const zip = new JSZip();
      let added = 0;

      for (const file of selectedFiles) {
        try {
          const res = await fetch(file.url);
          if (!res.ok) continue;
          const blob = await res.blob();
          const name = file.name || `file_${file.id}`;
          zip.file(name, blob);
          added++;
        } catch {
          // skip failed files
        }
      }

      if (added === 0) {
        toast.error("Failed to fetch files", { id: toastId });
        return;
      }

      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${selectedFolder?.name || "files"}_${added}_files.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(`${added} file${added > 1 ? "s" : ""} downloaded as ZIP`, { id: toastId });
    } catch {
      toast.error("Failed to create ZIP", { id: toastId });
    }
  };

  const openFolder = (folder: FolderData) => {
    setSelectedFolder(folder);
    setSelectedIds(new Set());
    setFilePage(0);
    fetchFiles(folder.id);
  };

  const openFolderRef = useRef(openFolder);
  useEffect(() => {
    openFolderRef.current = openFolder;
  });
  useEffect(() => {
    const studentId = searchParams.get("studentId");
    if (!studentId || !folders) return;
    const match = folders.find((f) => f.id === `student_${studentId}`);
    if (match) {
      openFolderRef.current(match);
    }
  }, [searchParams, folders]);

  const goBack = () => {
    setSelectedFolder(null);
    setFiles([]);
    setSelectedIds(new Set());
    setFilePage(0);
    fetchFolders();
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const pageFiles = files.slice(filePage * PAGE_SIZE, filePage * PAGE_SIZE + PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(files.length / PAGE_SIZE));
  const allPageSelected = pageFiles.length > 0 && pageFiles.every((f) => selectedIds.has(f.id));

  const toggleSelectAllPage = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allPageSelected) {
        pageFiles.forEach((f) => next.delete(f.id));
      } else {
        pageFiles.forEach((f) => next.add(f.id));
      }
      return next;
    });
  };

  if (selectedFolder) {
    return (
      <div className="animate-fade-in text-[#191c1e]">
        {/* Dashboard Header */}
        <div className="flex justify-between items-end mb-8">
          <div className="flex items-start gap-3">
            <button
              type="button"
              onClick={goBack}
              aria-label="Go back"
              className="mt-1 p-2 rounded-lg hover:bg-[#eceef0] transition-colors"
            >
              <ChevronLeft size={20} className="text-[#45464d]" />
            </button>
            <div>
              <h2 className="text-[32px] leading-10 font-bold tracking-[-0.02em] text-[#191c1e]">
                {selectedFolder.name}
              </h2>
              <p className="text-sm leading-5 text-[#45464d] mt-0.5">
                {files.length} file{files.length !== 1 ? "s" : ""} · Manage and organize your files.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowAddFile(true)}
              className="bg-black text-white px-6 py-3 rounded-lg text-xs font-medium tracking-[0.02em] flex items-center gap-2 hover:opacity-90 transition-opacity active:scale-95"
            >
              <Plus size={18} />
              Upload File
            </button>
            <button
              type="button"
              onClick={() => setShowScan(true)}
              className="bg-[#f2f4f6] text-[#191c1e] px-6 py-3 rounded-lg text-xs font-medium tracking-[0.02em] flex items-center gap-2 hover:bg-[#eceef0] transition-colors"
            >
              <Scan size={16} />
              Scan
            </button>
          </div>
        </div>

        {selectedIds.size > 0 && (
          <div className="mb-4 flex items-center gap-3 bg-indigo-50 border border-indigo-200 rounded-xl px-5 py-3">
            <span className="text-sm font-semibold text-indigo-800">
              {selectedIds.size} file{selectedIds.size > 1 ? "s" : ""} selected
            </span>
            <div className="flex-1" />
            <button
              type="button"
              onClick={handleBulkDownloadZip}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#1d4ed8] text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors"
            >
              <FileArchive size={14} />
              Download ZIP
            </button>
            <button
              type="button"
              onClick={handleBulkDelete}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700 transition-colors"
            >
              <Trash2 size={14} />
              Delete
            </button>
            <button
              type="button"
              onClick={() => setSelectedIds(new Set())}
              className="p-2 text-indigo-400 hover:text-indigo-700 transition-colors"
              title="Clear selection"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {filesLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-[#c6c6cd]" />
          </div>
        ) : files.length === 0 ? (
          <div className="bg-white rounded-xl overflow-hidden text-center py-20" style={softShadow}>
            <FileText size={48} className="text-[#e0e3e5] mx-auto mb-3" />
            <p className="text-sm text-[#45464d] font-medium">No documents found</p>
            <p className="text-xs text-[#76777d] mt-1">
              No documents yet — add files or scan to get started
            </p>
            <div className="flex items-center justify-center gap-3 mt-5">
              <button
                type="button"
                onClick={() => setShowAddFile(true)}
                className="bg-black text-white px-5 py-2.5 rounded-lg text-xs font-medium flex items-center gap-2 hover:opacity-90"
              >
                <Upload size={14} />
                Upload File
              </button>
              <button
                type="button"
                onClick={() => setShowScan(true)}
                className="bg-[#f2f4f6] text-[#191c1e] px-5 py-2.5 rounded-lg text-xs font-medium flex items-center gap-2 hover:bg-[#eceef0]"
              >
                <Scan size={14} />
                Scan
              </button>
            </div>
          </div>
        ) : (
          <section className="bg-white rounded-xl overflow-hidden" style={softShadow}>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-xs font-medium tracking-[0.02em] text-[#45464d] bg-[#f2f4f6]/50">
                    <th className="px-6 py-4 font-semibold">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={allPageSelected}
                          onChange={toggleSelectAllPage}
                          aria-label="Select all files"
                          className="rounded border-[#c6c6cd] text-[#0058be] focus:ring-[#0058be] w-4 h-4"
                        />
                        File name
                        <ArrowUpDown size={14} className="text-[#76777d]" />
                      </div>
                    </th>
                    <th className="px-6 py-4 font-semibold">
                      <div className="flex items-center gap-1">
                        Date added
                        <ArrowUpDown size={14} className="text-[#76777d]" />
                      </div>
                    </th>
                    <th className="px-6 py-4 font-semibold">Added by</th>
                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eceef0] text-sm">
                  {pageFiles.map((file) => {
                    const by = addedByLabel(file, selectedFolder.name);
                    const tone = avatarTone(by);
                    return (
                      <tr
                        key={file.id}
                        className="hover:bg-[#f2f4f6]/50 transition-colors group cursor-pointer"
                        onClick={(e) => {
                          if ((e.target as HTMLElement).closest("button, a, input")) return;
                          toggleSelect(file.id);
                        }}
                      >
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-4">
                            <input
                              type="checkbox"
                              checked={selectedIds.has(file.id)}
                              onChange={() => toggleSelect(file.id)}
                              aria-label={`Select ${file.name}`}
                              className="rounded border-[#c6c6cd] text-[#0058be] focus:ring-[#0058be] w-4 h-4"
                            />
                            <div className="w-8 h-8 rounded bg-[#e0e3e5] flex items-center justify-center shrink-0">
                              {getFileIcon(file.fileType, file.name)}
                            </div>
                            <div className="min-w-0">
                              <span className="font-semibold text-[#191c1e] truncate block">
                                {file.name}
                              </span>
                              {file.academicDocument?.name && (
                                <span className="text-[10px] text-[#0058be]">
                                  {file.academicDocument.name}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-3 text-[#45464d] whitespace-nowrap">
                          {formatTableDate(new Date(file.createdAt || file.uploadedAt || now))}
                        </td>
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${tone}`}
                            >
                              {by.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-[#191c1e] truncate max-w-[120px]">{by}</span>
                          </div>
                        </td>
                        <td className="px-6 py-3 text-right">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <a
                              href={file.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="p-1.5 rounded-md text-[#45464d] hover:bg-[#eceef0] hover:text-[#191c1e] transition-colors"
                              title="View"
                            >
                              <Eye size={15} />
                            </a>
                            <a
                              href={file.url}
                              download
                              onClick={(e) => e.stopPropagation()}
                              className="p-1.5 rounded-md text-[#45464d] hover:bg-[#eceef0] hover:text-[#191c1e] transition-colors"
                              title="Download"
                            >
                              <Download size={15} />
                            </a>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteFile(file);
                              }}
                              className="p-1.5 rounded-md text-[#ba1a1a] hover:bg-[#ffdad6] transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 border-t border-[#eceef0] flex justify-between items-center bg-[#f2f4f6]/30">
              <p className="text-xs font-medium text-[#45464d]">
                Showing {Math.min(files.length, filePage * PAGE_SIZE + 1)}–
                {Math.min(files.length, (filePage + 1) * PAGE_SIZE)} of {files.length} files
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={filePage === 0}
                  onClick={() => setFilePage((p) => Math.max(0, p - 1))}
                  className="px-4 py-1 text-xs font-semibold border border-[#c6c6cd] rounded-md hover:bg-[#eceef0] transition-colors disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={filePage >= totalPages - 1}
                  onClick={() => setFilePage((p) => Math.min(totalPages - 1, p + 1))}
                  className="px-4 py-1 text-xs font-semibold border border-[#c6c6cd] rounded-md hover:bg-[#eceef0] transition-colors disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          </section>
        )}

        <AddFileDialog
          open={showAddFile}
          onClose={() => setShowAddFile(false)}
          onSubmit={handleAddFile}
          academicDocs={academicDocs}
        />
        <ScanDialog
          open={showScan}
          onClose={() => setShowScan(false)}
          onSubmit={handleScanSubmit}
          folderName={selectedFolder.name}
          academicDocs={academicDocs}
        />
      </div>
    );
  }

  return (
    <div className="animate-fade-in text-[#191c1e]">
      {/* Dashboard Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-[32px] leading-10 font-bold tracking-[-0.02em] text-[#191c1e]">
            Documents
          </h2>
          <p className="text-sm leading-5 text-[#45464d]">Manage and organize your files.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowCreateFolder(true)}
          className="bg-black text-white px-6 py-3 rounded-lg text-xs font-medium tracking-[0.02em] flex items-center gap-2 hover:opacity-90 transition-opacity active:scale-95"
        >
          <Plus size={18} />
          Create Folder
        </button>
      </div>

      {loading ? (
        <SkeletonTable rows={4} />
      ) : (folders?.length ?? 0) === 0 ? (
        <div className="bg-white rounded-xl text-center py-20" style={softShadow}>
          <div className="w-20 h-20 mx-auto mb-4 rounded-lg bg-[#adc6ff] flex items-center justify-center">
            <Folder size={40} className="text-[#0058be]" fill="#0058be" strokeWidth={0} />
          </div>
          <p className="text-sm text-[#45464d] font-medium">No folders yet</p>
          <p className="text-xs text-[#76777d] mt-1">Create a folder to start organizing files</p>
          <button
            type="button"
            onClick={() => setShowCreateFolder(true)}
            className="bg-black text-white px-6 py-2.5 rounded-lg text-xs font-medium mt-5 inline-flex items-center gap-2 hover:opacity-90"
          >
            <FolderPlus size={14} />
            Create Your First Folder
          </button>
        </div>
      ) : (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl leading-7 font-semibold text-[#191c1e]">
              Recent <span className="text-[#c6c6cd] font-normal">{folders?.length ?? 0}</span>
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(folders ?? []).map((folder) => (
              <button
                key={folder.id}
                type="button"
                onClick={() => openFolder(folder)}
                className="bg-white p-6 rounded-xl text-left relative overflow-hidden border border-transparent hover:border-[#c6c6cd]/30 transition-all duration-300 group cursor-pointer"
                style={softShadow}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = activeShadow.boxShadow;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = softShadow.boxShadow;
                }}
              >
                {!folder.__studentId && (
                  <span
                    role="button"
                    tabIndex={0}
                    aria-label="Delete folder"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteFolder(folder.id);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.stopPropagation();
                        handleDeleteFolder(folder.id);
                      }
                    }}
                    className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-[#ffdad6] text-[#c6c6cd] hover:text-[#ba1a1a]"
                  >
                    <Trash2 size={16} />
                  </span>
                )}
                <FolderCardIcon student={!!folder.__studentId} />
                <h4 className="text-base font-semibold text-[#191c1e] mb-2 truncate">
                  {folder.name}
                </h4>
                <p className="text-xs font-medium tracking-[0.02em] text-[#45464d]">
                  {folder._count?.files ?? 0} Files
                  {folder.__studentId ? " • Student" : ""}
                </p>
                <div className="mt-4 flex -space-x-2">
                  <div className="w-6 h-6 rounded-full border-2 border-white bg-[#131b2e]" />
                  <div className="w-6 h-6 rounded-full border-2 border-white bg-[#2170e4]" />
                  <div className="w-6 h-6 rounded-full border-2 border-white bg-[#fcdeb5] flex items-center justify-center text-[8px] font-bold text-[#271901]">
                    +{Math.max(0, Math.min(9, folder._count?.files ?? 0))}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      <CreateFolderDialog
        open={showCreateFolder}
        onClose={() => setShowCreateFolder(false)}
        onSubmit={handleCreateFolder}
      />
    </div>
  );
}
