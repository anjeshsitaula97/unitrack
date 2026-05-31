'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, Camera, CheckCircle, XCircle, ArrowLeft, RefreshCw, User, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { loadModels, detectSingleFace, computeDescriptor, getFaceCenter, movementDistance, MOVEMENT_THRESHOLD, MOVEMENT_FRAMES } from '@/lib/face';

export default function FaceEnrollmentContent() {
  const params = useParams();
  const router = useRouter();
  const employeeId = params.id as string;
  const videoRef = useRef<HTMLVideoElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const stream = useRef<MediaStream | null>(null);
  const [loading, setLoading] = useState(true);
  const [employee, setEmployee] = useState<any>(null);
  const [status, setStatus] = useState<'init' | 'enrolling' | 'success' | 'error'>('init');
  const [movementCount, setMovementCount] = useState(0);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('Press "Start Enrollment" to begin');

  const animRef = useRef<number>(0);
  const runningRef = useRef(false);
  const movementCounterRef = useRef(0);
  const prevCenterRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    fetchEmployee();
    return () => stopCamera();
  }, [employeeId]);

  const fetchEmployee = async () => {
    try {
      const res = await fetch(`/api/hr/employees/${employeeId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.faceDescriptor) setStatus('success');
        setEmployee(data);
      } else {
        toast.error('Employee not found');
        router.push('/hr/employees');
      }
    } catch { toast.error('Failed to load employee'); }
    finally { setLoading(false); }
  };

  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 640, height: 480 } });
      stream.current = s;
      if (videoRef.current) videoRef.current.srcObject = s;
    } catch {
      setMessage('Camera access denied');
      setStatus('error');
    }
  };

  const stopCamera = () => {
    runningRef.current = false;
    if (stream.current) { stream.current.getTracks().forEach(t => t.stop()); stream.current = null; }
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
      ctx.fillRect(8, 8, 140, 22);
      ctx.fillStyle = movementCounterRef.current >= MOVEMENT_FRAMES ? '#22c55e' : '#fbbf24';
      ctx.font = 'bold 12px monospace';
      ctx.fillText(`Movement: ${movementCounterRef.current}/${MOVEMENT_FRAMES}`, 14, 24);
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

      if (result) {
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
          const descriptor = computeDescriptor(result);
          setCapturedDescriptor(descriptor);
          setStatus('success');
          setMessage('Face captured successfully!');
          runningRef.current = false;
          stopCamera();
          return;
        }
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

  const startEnrollment = async () => {
    await loadModels();
    await startCamera();
    setStatus('enrolling');
    setMessage('Move your head slightly side to side...');
    movementCounterRef.current = 0;
    prevCenterRef.current = null;
    setMovementCount(0);
    runningRef.current = true;
    animRef.current = requestAnimationFrame(detectionLoop);
  };

  const [capturedDescriptor, setCapturedDescriptor] = useState<number[] | null>(null);

  const saveDescriptor = async () => {
    if (!capturedDescriptor) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/hr/employees/${employeeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ faceDescriptor: JSON.stringify(capturedDescriptor) }),
      });
      if (res.ok) {
        toast.success('Face enrolled successfully');
        router.push('/hr/employees');
      } else {
        toast.error('Failed to save face data');
      }
    } catch { toast.error('Failed to save face data'); }
    finally { setSaving(false); }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="size-8 rounded-full bg-slate-200 animate-pulse" />
          <div className="w-40 h-5 bg-slate-200 rounded animate-pulse" />
        </div>
        <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-indigo-500" size={32} /></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in p-6 max-w-lg mx-auto">
      <button type="button" onClick={() => router.push('/hr/employees')} className="flex items-center gap-1.5 text-slate-400 hover:text-slate-600 mb-4 text-sm">
        <ArrowLeft size={15} /> Back to Employees
      </button>

      <div className="card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="size-12 rounded-full bg-indigo-50 flex items-center justify-center">
            <User size={20} className="text-indigo-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Face Enrollment</h2>
            <p className="text-sm text-slate-400">{employee?.name} ({employee?.employeeId})</p>
          </div>
        </div>

        <div className="relative bg-slate-900 rounded-xl overflow-hidden aspect-[4/3] mb-4">
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
          <canvas ref={overlayRef} className="absolute inset-0 w-full h-full" />
          {status === 'init' && !employee?.faceDescriptor && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/60">
              <Camera size={40} className="text-slate-500" />
            </div>
          )}
        </div>

        {status === 'enrolling' && (
          <div className="bg-indigo-50 text-indigo-700 text-xs p-3 rounded-lg mb-4 flex items-center gap-2">
            <Eye size={14} />
            <span>Movement detected: {movementCount}/{MOVEMENT_FRAMES}: move your head slightly</span>
          </div>
        )}

        {status === 'success' && employee?.faceDescriptor && (
          <div className="bg-emerald-50 text-emerald-700 text-xs p-3 rounded-lg mb-4 flex items-center gap-2">
            <CheckCircle size={14} /> Face already enrolled for this employee
          </div>
        )}

        {status === 'success' && capturedDescriptor && (
          <div className="bg-emerald-50 text-emerald-700 text-xs p-3 rounded-lg mb-4 flex items-center gap-2">
            <CheckCircle size={14} /> Face captured with liveness verification
          </div>
        )}

        {status === 'error' && (
          <div className="bg-rose-50 text-rose-700 text-xs p-3 rounded-lg mb-4 flex items-center gap-2">
            <XCircle size={14} /> {message}
          </div>
        )}

        <div className="space-y-2">
          {status === 'init' && !employee?.faceDescriptor && (
            <button type="button" onClick={startEnrollment} className="w-full btn-primary flex items-center justify-center gap-2">
              <Camera size={15} /> Start Enrollment
            </button>
          )}

          {status === 'enrolling' && (
            <button type="button" onClick={() => { runningRef.current = false; stopCamera(); setStatus('init'); setMessage('Press "Start Enrollment" to begin'); }} className="w-full btn-secondary flex items-center justify-center gap-2">
              <XCircle size={15} /> Cancel
            </button>
          )}

          {status === 'success' && capturedDescriptor && (
            <div className="flex gap-2">
              <button type="button" onClick={() => { setStatus('init'); setCapturedDescriptor(null); setMessage('Press "Start Enrollment" to begin'); }} className="flex-1 btn-secondary flex items-center justify-center gap-2">
                <RefreshCw size={15} /> Retake
              </button>
              <button type="button" onClick={saveDescriptor} disabled={saving} className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50">
                {saving ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle size={15} />}
                {saving ? 'Saving...' : 'Save & Complete'}
              </button>
            </div>
          )}

          {employee?.faceDescriptor && (
            <button type="button" onClick={() => router.push('/hr/employees')} className="w-full btn-primary flex items-center justify-center gap-2">
              <ArrowLeft size={15} /> Back to Employees
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
