'use client';

import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { Loader2, ShieldCheck, MapPin, Camera, AlertTriangle, Eye } from 'lucide-react';
import { loadModels, detectSingleFace, computeDescriptor, compareDescriptors, getFaceCenter, movementDistance, MOVEMENT_THRESHOLD, MOVEMENT_FRAMES } from '@/lib/face';

interface FaceVerificationModalProps {
  action: 'checkin' | 'checkout';
  onComplete: (data: { photoUrl: string; latitude: number; longitude: number }) => void;
  onCancel: () => void;
  enrolledDescriptor: number[];
}

export default function FaceVerificationModal({ action, onComplete, onCancel, enrolledDescriptor }: FaceVerificationModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [step, setStep] = useState<'location' | 'face' | 'capturing' | 'verifying' | 'error' | 'complete'>('location');
  const [message, setMessage] = useState('Getting your location…');
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locError, setLocError] = useState<string | null>(null);
  const [movementCount, setMovementCount] = useState(0);
  const [similarity, setSimilarity] = useState<number | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  const animRef = useRef<number>(0);
  const runningRef = useRef(false);
  const prevCenterRef = useRef<{ x: number; y: number } | null>(null);
  const movementCounterRef = useRef(0);
  const livenessPassedRef = useRef(false);
  const locationRef = useRef<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    getLocation();
    return () => { runningRef.current = false; stopCamera(); };
  }, []);

  const getLocation = () => {
    if (!navigator.geolocation) {
      setLocError('Geolocation not supported');
      initFaceCapture();
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setLocation(loc);
        locationRef.current = loc;
        initFaceCapture();
      },
      (err) => {
        setLocError(err.message);
        setStep('error');
        setMessage(`Location required: ${err.message}. Please enable location access.`);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const initFaceCapture = async () => {
    try {
      setStep('face');
      setMessage('Look at the camera...');
      await loadModels();
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 640, height: 480 } });
      setStream(s);
      if (videoRef.current) videoRef.current.srcObject = s;
      prevCenterRef.current = null;
      movementCounterRef.current = 0;
      livenessPassedRef.current = false;
      setMovementCount(0);
      setStep('capturing');
      runningRef.current = true;
      animRef.current = requestAnimationFrame(detectionLoop);
    } catch {
      setStep('error');
      setMessage('Camera access denied. Please allow camera permissions.');
    }
  };

  const stopCamera = () => {
    runningRef.current = false;
    if (stream) { stream.getTracks().forEach(t => t.stop()); setStream(null); }
    cancelAnimationFrame(animRef.current);
  };

  const drawOverlay = (detection: faceapi.FaceDetection | null, center?: { x: number; y: number }) => {
    const canvas = overlayRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    if (detection) {
      const box = detection.box;
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 3;
      ctx.strokeRect(box.x, box.y, box.width, box.height);
      if (center) {
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.arc(center.x, center.y, 4, 0, 2 * Math.PI);
        ctx.fill();
      }
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(8, 8, 170, 22);
      ctx.fillStyle = movementCounterRef.current >= MOVEMENT_FRAMES ? '#22c55e' : '#fbbf24';
      ctx.font = 'bold 12px monospace';
      ctx.fillText(`Liveness: ${movementCounterRef.current}/${MOVEMENT_FRAMES}`, 14, 24);
    }
  };

  const detectionLoop = async () => {
    if (!runningRef.current) return;
    const video = videoRef.current;
    if (!video || !video.videoWidth) {
      animRef.current = requestAnimationFrame(detectionLoop);
      return;
    }

    try {
      const detectPromise = detectSingleFace(video);
      if (!runningRef.current) return;
      const result = await detectPromise;

      if (result && !livenessPassedRef.current) {
        const center = getFaceCenter(result.detection);
        drawOverlay(result.detection, center);

        if (prevCenterRef.current) {
          const dist = movementDistance(prevCenterRef.current, center);
          if (dist >= MOVEMENT_THRESHOLD) {
            movementCounterRef.current += 1;
            setMovementCount(movementCounterRef.current);
          }
        }
        prevCenterRef.current = center;

        if (movementCounterRef.current >= MOVEMENT_FRAMES) {
          livenessPassedRef.current = true;
          runningRef.current = false;
          setStep('verifying');
          setMessage('Verifying identity…');

          const descriptor = computeDescriptor(result);
          const dist = compareDescriptors(descriptor, enrolledDescriptor);
          setSimilarity(Math.round((1 - dist) * 100));

          if (dist <= 0.5) {
            await new Promise(r => setTimeout(r, 200));
            const cap = document.createElement('canvas');
            cap.width = video.videoWidth;
            cap.height = video.videoHeight;
            const ctx = cap.getContext('2d');
            if (ctx) {
              ctx.drawImage(video, 0, 0);
              const blob = await new Promise<Blob>(resolve => cap.toBlob(b => resolve(b!), 'image/jpeg', 0.8));
              const fd = new FormData();
              fd.append('file', blob, `${action}-${Date.now()}.jpg`);
              const uploadRes = await fetch('/api/upload', { method: 'POST', body: fd });
              if (uploadRes.ok) {
                const data = await uploadRes.json();
                setPhotoUrl(data.url);
                setStep('complete');
                setMessage('Identity verified!');
                stopCamera();
                return;
              }
            }
            setStep('error');
            setMessage('Photo upload failed. Please try again.');
          } else {
            setStep('error');
            setMessage(`Face does not match enrolled profile (${Math.round((1 - dist) * 100)}% match).`);
            stopCamera();
          }
          return;
        }
      } else if (result && livenessPassedRef.current) {
        if (runningRef.current) animRef.current = requestAnimationFrame(detectionLoop);
        return;
      } else {
        drawOverlay(null);
        prevCenterRef.current = null;
      }
    } catch {
      drawOverlay(null);
      prevCenterRef.current = null;
    }

    if (runningRef.current) {
      animRef.current = requestAnimationFrame(detectionLoop);
    }
  };

  const handleConfirm = () => {
    if (!photoUrl || !location) return;
    onComplete({ photoUrl, latitude: location.lat, longitude: location.lng });
  };

  const handleRetry = () => {
    setMovementCount(0);
    movementCounterRef.current = 0;
    prevCenterRef.current = null;
    livenessPassedRef.current = false;
    setSimilarity(null);
    setPhotoUrl(null);
    setStep('location');
    setMessage('Getting your location…');
    locationRef.current = null;
    getLocation();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-scale-in overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="font-bold text-slate-800">{action === 'checkin' ? 'Check In' : 'Check Out'}: Face Verification</h3>
          <button type="button" onClick={onCancel} className="text-slate-400 hover:text-slate-600 p-1">✕</button>
        </div>
        <div className="p-6 space-y-4">
          {step === 'location' && (
            <div className="text-center py-6">
              <Loader2 className="animate-spin text-indigo-500 mx-auto mb-2" size={24} />
              <p className="text-sm text-slate-500">Getting your location…</p>
            </div>
          )}

          {(step === 'face' || step === 'capturing') && (
            <div className="relative bg-slate-900 rounded-xl overflow-hidden aspect-[4/3]">
              {!stream && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="animate-spin text-white" size={24} />
                </div>
              )}
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              <canvas ref={overlayRef} className="absolute inset-0 w-full h-full" />
              {step === 'capturing' && (
                <div className="absolute bottom-3 left-3 bg-black/60 text-white text-xs px-3 py-1.5 rounded-lg flex items-center gap-2">
                  <Eye size={12} /> Move head slightly: {movementCount}/{MOVEMENT_FRAMES}
                </div>
              )}
            </div>
          )}

          {step === 'verifying' && (
            <div className="relative bg-slate-900 rounded-xl overflow-hidden aspect-[4/3]">
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              <canvas ref={overlayRef} className="absolute inset-0 w-full h-full" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="animate-spin text-white mx-auto mb-2" size={28} />
                  <p className="text-white text-sm font-medium">Verifying identity…</p>
                </div>
              </div>
            </div>
          )}

          {step === 'complete' && (
            <div className="space-y-3">
              <div className="bg-emerald-50 text-emerald-700 text-xs p-3 rounded-lg flex items-center gap-2">
                <ShieldCheck size={14} /> Face verified: {similarity}% match
              </div>
              {photoUrl && (
                <div className="w-full rounded-xl aspect-[4/3] overflow-hidden relative">
                  <Image src={photoUrl} alt="Verification" fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
                </div>
              )}
              {location && (
                <div className="bg-emerald-50 text-emerald-700 text-xs p-3 rounded-lg flex items-center gap-2">
                  <MapPin size={14} /> Location captured
                </div>
              )}
            </div>
          )}

          {step === 'error' && (
            <div>
              <div className="bg-rose-50 text-rose-700 text-xs p-3 rounded-lg flex items-start gap-2 mb-2">
                <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold mb-1">Verification failed</p>
                  <p>{message}</p>
                </div>
              </div>
              {locError && (
                <div className="bg-amber-50 text-amber-700 text-xs p-3 rounded-lg flex items-start gap-2">
                  <MapPin size={14} className="mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold mb-1">Location error</p>
                    <p>{locError}. Please enable location access.</p>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            {step !== 'complete' && (
              <>
                <button type="button" onClick={onCancel} className="flex-1 btn-secondary">Cancel</button>
                {step === 'error' && (
                  <button type="button" onClick={handleRetry} className="flex-1 btn-primary flex items-center justify-center gap-2" aria-label="Camera"> <Camera size={15} /> Retry
                  </button>
                )}
              </>
            )}
            {step === 'complete' && (
              <>
                <button type="button" onClick={handleRetry} className="flex-1 btn-secondary">Retake</button>
                <button type="button" onClick={handleConfirm} className="flex-1 btn-primary flex items-center justify-center gap-2" aria-label="ShieldCheck"> <ShieldCheck size={15} /> Confirm {action === 'checkin' ? 'Check In' : 'Check Out'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
