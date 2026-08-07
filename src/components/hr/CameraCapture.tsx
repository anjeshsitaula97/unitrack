"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Camera, RefreshCw, Check, Loader2 } from "lucide-react";

interface CameraCaptureProps {
  onCapture: (url: string) => void;
  onClose: () => void;
}

export default function CameraCapture({ onCapture, onClose: _onClose }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [captured, setCaptured] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      setStream(null);
    }
  }, []);

  const startCamera = useCallback(async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
      });
      streamRef.current = s;
      setStream(s);
      if (videoRef.current) videoRef.current.srcObject = s;
    } catch {
      setError("Camera access denied. Please allow camera permissions.");
    }
  }, []);

  useEffect(() => {
    Promise.resolve().then(startCamera);
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  const capture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    setCaptured(canvas.toDataURL("image/jpeg", 0.8));
    stopCamera();
  };

  const retake = () => {
    setCaptured(null);
    startCamera();
  };

  const confirm = async () => {
    if (!captured) return;
    setUploading(true);
    try {
      const blob = await (await fetch(captured)).blob();
      const fd = new FormData();
      fd.append("file", blob, `checkin-${Date.now()}.jpg`);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (res.ok) {
        const data = await res.json();
        onCapture(data.url);
      } else {
        setError("Upload failed");
      }
    } catch {
      setError("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      {error && <div className="bg-rose-50 text-rose-700 text-xs p-3 rounded-lg">{error}</div>}

      <div className="relative bg-slate-900 rounded-xl overflow-hidden aspect-[4/3] flex items-center justify-center">
        {!captured ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            aria-label="Camera preview"
            className="w-full h-full object-cover"
          />
        ) : (
          <Image
            src={captured}
            alt="Captured"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        )}
        {!stream && !captured && !error && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="animate-spin text-white" size={24} />
          </div>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />

      <div className="flex gap-2">
        {!captured ? (
          <button
            type="button"
            onClick={capture}
            disabled={!stream}
            className="flex-1 bg-indigo-600 text-white rounded-lg py-2 text-sm font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors disabled:opacity-50"
            aria-label="Camera"
          >
            {" "}
            <Camera size={15} /> Capture Photo
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={retake}
              className="flex-1 bg-slate-100 text-slate-700 rounded-lg py-2 text-sm font-bold flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors"
              aria-label="RefreshCw"
            >
              {" "}
              <RefreshCw size={15} /> Retake
            </button>
            <button
              type="button"
              onClick={confirm}
              disabled={uploading}
              className="flex-1 bg-emerald-600 text-white rounded-lg py-2 text-sm font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition-colors disabled:opacity-50"
              aria-label="Use Photo"
            >
              {uploading ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
              {uploading ? "Uploading..." : "Use Photo"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
