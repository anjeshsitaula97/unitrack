"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Camera,
  Scan,
  X,
  Upload,
  Download,
  RotateCw,
  Loader2,
  CheckCircle,
  AlertCircle,
  Image as ImageIcon,
  Sliders,
  Trash2,
  FileText,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";
import NextImage from "next/image";

const DPI_OPTIONS = [
  { label: "Screen (72 DPI)", value: 72, width: 1024 },
  { label: "Draft (150 DPI)", value: 150, width: 1600 },
  { label: "Standard (200 DPI)", value: 200, width: 2048 },
  { label: "High (300 DPI)", value: 300, width: 2560 },
];

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface ScannedDocument {
  id: string;
  filename: string;
  createdAt: string;
  dpi: number;
  fileSize: number;
  url: string;
}

export default function DocumentScanner() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const _previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [dpi, setDpi] = useState(200);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [documents, setDocuments] = useState<ScannedDocument[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(true);
  const [showHistory, setShowHistory] = useState(true);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<ScannedDocument | null>(null);

  const currentDpiConfig = DPI_OPTIONS.find((d) => d.value === dpi) || DPI_OPTIONS[2];

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
    setCameraError(null);
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await fetch("/api/documents");
      if (res.ok) {
        const data = await res.json();
        setDocuments(Array.isArray(data) ? data : []);
      }
    } catch {
      // silent
    } finally {
      setIsLoadingDocs(false);
    }
  };

  const fetchDocumentsRef = useRef(fetchDocuments);
  useEffect(() => {
    fetchDocumentsRef.current = fetchDocuments;
    fetchDocumentsRef.current();
    return stopCamera;
  }, [stopCamera]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: "environment",
          width: { ideal: currentDpiConfig.width },
          height: { ideal: Math.round(currentDpiConfig.width * 1.414) },
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setCameraActive(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "";
      if (message.includes("Permission") || message.includes("NotAllowed")) {
        setCameraError(
          "Camera access denied. Please allow camera permissions in your browser settings."
        );
      } else if (message.includes("NotFound")) {
        setCameraError("No camera found on this device.");
      } else {
        setCameraError("Could not access camera. Please ensure no other app is using it.");
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

  const recapture = () => {
    setCapturedImage(null);
    setUploadedUrl(null);
    startCamera();
  };

  const handleUpload = async () => {
    if (!capturedImage) return;

    setIsUploading(true);
    try {
      const imageRes = await fetch(capturedImage);
      if (!imageRes.ok) throw new Error("Failed to read captured image");
      const blob = await imageRes.blob();
      const timestamp = Date.now();
      const filename = `scan_${timestamp}.jpg`;

      const formData = new FormData();
      formData.append("file", blob, filename);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) throw new Error("Upload failed");

      const { url, size: _size } = await uploadRes.json();

      const docRes = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          filename,
          fileSize: blob.size,
          dpi,
        }),
      });

      if (!docRes.ok) throw new Error("Failed to save document");

      setUploadedUrl(url);
      toast.success("Document scanned and uploaded successfully");
      fetchDocuments();
    } catch (_err) {
      toast.error("Failed to upload scanned document");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/documents?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setDocuments((prev) => prev.filter((d) => d.id !== id));
        toast.success("Document deleted");
      }
    } catch {
      toast.error("Failed to delete document");
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 mb-1">Document Scanner</h1>
          <p className="text-sm text-slate-400">
            Scan documents directly from your browser. Nothing is stored on your device.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scanner Column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Scan size={16} className="text-indigo-600" />
                <span className="font-bold text-sm text-slate-700">
                  {capturedImage
                    ? "Captured Document"
                    : cameraActive
                      ? "Camera Preview"
                      : "Scanner"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {cameraActive && (
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="btn-secondary text-xs px-3 py-1.5"
                  >
                    <X size={13} />
                    Stop
                  </button>
                )}
              </div>
            </div>

            <CameraStage
              cameraActive={cameraActive}
              cameraError={cameraError}
              canvasRef={canvasRef}
              capturedImage={capturedImage}
              startCamera={startCamera}
              videoRef={videoRef}
            />

            <ScannerControls
              cameraActive={cameraActive}
              capturedImage={capturedImage}
              captureImage={captureImage}
              dpi={dpi}
              handleUpload={handleUpload}
              isUploading={isUploading}
              recapture={recapture}
              setDpi={setDpi}
              startCamera={startCamera}
            />
          </div>

          <PreviewInfo
            capturedImage={capturedImage}
            currentDpiConfig={currentDpiConfig}
            dpi={dpi}
            uploadedUrl={uploadedUrl}
          />
        </div>

        {/* History Column */}
        <ScanHistoryPanel
          documents={documents}
          isLoadingDocs={isLoadingDocs}
          onDelete={handleDelete}
          selectedDoc={selectedDoc}
          setSelectedDoc={setSelectedDoc}
          setShowHistory={setShowHistory}
          showHistory={showHistory}
        />
      </div>
    </div>
  );
}

function CameraStage({
  cameraError,
  cameraActive,
  capturedImage,
  startCamera,
  videoRef,
  canvasRef,
}: {
  cameraError: string | null;
  cameraActive: boolean;
  capturedImage: string | null;
  startCamera: () => void;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}) {
  return (
    <div className="relative bg-slate-900 flex items-center justify-center min-h-[400px]">
      {cameraError && (
        <div className="text-center p-8">
          <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
          <p className="text-white/90 font-medium mb-2">Camera Error</p>
          <p className="text-white/60 text-sm max-w-md">{cameraError}</p>
          <button type="button" onClick={startCamera} className="btn-primary mt-4">
            Try Again
          </button>
        </div>
      )}

      {!cameraError && !cameraActive && !capturedImage && (
        <div className="text-center p-8">
          <Scan size={64} className="text-slate-600 mx-auto mb-4" />
          <p className="text-white/80 font-bold text-lg mb-2">Document Scanner</p>
          <p className="text-white/50 text-sm mb-6 max-w-sm mx-auto">
            Position your document in the frame and click Start Camera to begin. The scanned image
            will be uploaded directly (nothing is saved on your device).
          </p>
          <button type="button" onClick={startCamera} className="btn-primary text-base px-8 py-3">
            <Camera size={18} />
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
        className={`w-full max-h-[500px] object-contain ${cameraActive ? "block" : "hidden"}`}
      />

      {capturedImage && (
        <div className="relative w-full flex items-center justify-center p-4 bg-slate-800">
          <NextImage
            src={capturedImage}
            alt="Captured document"
            width={800}
            height={600}
            className="max-w-full max-h-[500px] rounded-lg shadow-2xl object-contain"
          />
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}

function ScannerControls({
  cameraActive,
  capturedImage,
  captureImage,
  dpi,
  handleUpload,
  isUploading,
  recapture,
  setDpi,
  startCamera,
}: {
  cameraActive: boolean;
  capturedImage: string | null;
  captureImage: () => void;
  dpi: number;
  handleUpload: () => void;
  isUploading: boolean;
  recapture: () => void;
  setDpi: (dpi: number) => void;
  startCamera: () => void;
}) {
  return (
    <div className="px-5 py-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        {!cameraActive && !capturedImage && (
          <button type="button" onClick={startCamera} className="btn-primary">
            <Camera size={15} />
            Start Camera
          </button>
        )}
        {cameraActive && (
          <button type="button" onClick={captureImage} className="btn-primary">
            <Camera size={15} />
            Capture
          </button>
        )}
        {capturedImage && (
          <>
            <button type="button" onClick={recapture} className="btn-secondary">
              <RotateCw size={15} />
              Recapture
            </button>
            <button
              type="button"
              onClick={handleUpload}
              disabled={isUploading}
              className="btn-primary"
            >
              {isUploading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
              {isUploading ? "Uploading..." : "Upload"}
            </button>
          </>
        )}
      </div>

      {/* DPI Settings */}
      <div className="flex items-center gap-2">
        <Sliders size={14} className="text-slate-400" />
        <span className="text-xs text-slate-500 font-medium">DPI:</span>
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
  );
}

function PreviewInfo({
  capturedImage,
  uploadedUrl,
  currentDpiConfig,
  dpi,
}: {
  capturedImage: string | null;
  uploadedUrl: string | null;
  currentDpiConfig: (typeof DPI_OPTIONS)[number];
  dpi: number;
}) {
  if (!capturedImage) return null;
  return (
    <div className="card px-5 py-3 flex items-center gap-4">
      <ImageIcon size={20} className="text-indigo-600" />
      <div className="text-xs text-slate-500">
        <span className="font-semibold text-slate-700">Resolution:</span> {currentDpiConfig.width} ×{" "}
        {Math.round(currentDpiConfig.width * 1.414)}px
        <span className="mx-2">·</span>
        <span className="font-semibold text-slate-700">DPI:</span> {dpi}
        <span className="mx-2">·</span>
        <span className="font-semibold text-slate-700">Format:</span> JPEG
      </div>
      {uploadedUrl && (
        <div className="ml-auto flex items-center gap-1.5 text-emerald-600 text-xs font-semibold">
          <CheckCircle size={14} />
          Uploaded successfully
        </div>
      )}
    </div>
  );
}

function ScanHistoryPanel({
  documents,
  isLoadingDocs,
  showHistory,
  setShowHistory,
  selectedDoc,
  setSelectedDoc,
  onDelete,
}: {
  documents: ScannedDocument[];
  isLoadingDocs: boolean;
  showHistory: boolean;
  setShowHistory: (show: boolean) => void;
  selectedDoc: ScannedDocument | null;
  setSelectedDoc: (doc: ScannedDocument | null) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="card overflow-hidden">
        <button
          type="button"
          onClick={() => setShowHistory(!showHistory)}
          className="w-full px-5 py-4 border-b border-slate-100 flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-indigo-600" />
            <span className="font-bold text-sm text-slate-700">Scan History</span>
            {!isLoadingDocs && (
              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">
                {documents.length}
              </span>
            )}
          </div>
          {showHistory ? (
            <ChevronUp size={14} className="text-slate-400" />
          ) : (
            <ChevronDown size={14} className="text-slate-400" />
          )}
        </button>

        {showHistory && (
          <div className="max-h-[500px] overflow-y-auto scrollbar-thin">
            {isLoadingDocs ? (
              <div className="p-8 text-center">
                <Loader2 size={24} className="animate-spin text-slate-300 mx-auto" />
              </div>
            ) : documents.length === 0 ? (
              <div className="p-8 text-center">
                <FileText size={32} className="text-slate-200 mx-auto mb-2" />
                <p className="text-xs text-slate-400 font-medium">No scanned documents yet</p>
              </div>
            ) : (
              documents.map((doc) => (
                <HistoryItem
                  key={doc.id}
                  doc={doc}
                  isSelected={selectedDoc?.id === doc.id}
                  onDelete={onDelete}
                  onToggle={() => setSelectedDoc(selectedDoc?.id === doc.id ? null : doc)}
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function HistoryItem({
  doc,
  isSelected,
  onToggle,
  onDelete,
}: {
  doc: ScannedDocument;
  isSelected: boolean;
  onToggle: () => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div
      className={`border-b border-slate-50 last:border-0 ${isSelected ? "bg-indigo-50/40" : ""}`}
    >
      <div className="flex items-start justify-between">
        <button
          type="button"
          className="min-w-0 flex-1 text-left px-5 py-3 hover:bg-slate-50 transition-colors cursor-pointer"
          onClick={onToggle}
        >
          <p className="text-xs font-semibold text-slate-700 truncate">{doc.filename}</p>
          <p className="text-[10px] text-slate-400 mt-0.5" suppressHydrationWarning>
            {formatDate(new Date(doc.createdAt))}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">
              {doc.dpi} DPI
            </span>
            <span className="text-[10px] text-slate-400">{formatSize(doc.fileSize)}</span>
          </div>
        </button>
        <div className="px-5 py-3 flex-shrink-0">
          <button
            type="button"
            aria-label="Delete document"
            onClick={() => onDelete(doc.id)}
            className="p-1 rounded-lg hover:bg-red-100 transition-colors cursor-pointer"
          >
            <Trash2 size={12} className="text-red-300 hover:text-red-500" />
          </button>
        </div>
      </div>

      {isSelected && (
        <div className="px-5 pb-4">
          <div className="pt-3 border-t border-slate-100">
            <div className="relative w-full h-32 rounded-lg overflow-hidden bg-slate-100">
              <NextImage
                src={doc.url}
                alt={doc.filename}
                fill
                className="object-contain"
                sizes="300px"
              />
            </div>
            <div className="flex items-center gap-2 mt-2">
              <a
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-1.5 rounded-lg bg-slate-900 text-white text-[10px] font-bold text-center hover:bg-indigo-600 transition uppercase tracking-wide"
              >
                <Download size={11} className="inline mr-1" />
                Download
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
