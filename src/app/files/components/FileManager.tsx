'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Folder, FolderPlus, FileText, Upload, Scan, X, Camera,
  Trash2, Download, Loader2, ChevronLeft, Image as ImageIcon, File,
  AlertCircle, CheckCircle, Sliders, RotateCw
} from 'lucide-react';
import NextImage from 'next/image';
import { toast } from 'sonner';

const DPI_OPTIONS = [
  { label: 'Screen (72 DPI)', value: 72, width: 1024 },
  { label: 'Draft (150 DPI)', value: 150, width: 1600 },
  { label: 'Standard (200 DPI)', value: 200, width: 2048 },
  { label: 'High (300 DPI)', value: 300, width: 2560 },
];

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });
}

function getFileIcon(fileType: string) {
  if (fileType.startsWith('image/')) return <ImageIcon size={16} className="text-indigo-500" />;
  if (fileType.includes('pdf')) return <FileText size={16} className="text-red-500" />;
  return <File size={16} className="text-slate-500" />;
}

interface FolderData {
  id: string;
  name: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  _count: { files: number };
}

interface FileData {
  id: string;
  name: string;
  url: string;
  fileSize: number;
  fileType: string;
  folderId: string;
  userId: string;
  createdAt: string;
}

function CreateFolderDialog({ open, onClose, onSubmit }: {
  open: boolean; onClose: () => void; onSubmit: (name: string) => Promise<void>;
}) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const prevOpenRef = useRef(open);

  if (open && !prevOpenRef.current) {
    setName('');
  }
  prevOpenRef.current = open;

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => inputRef.current?.focus(), 100);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose} role="presentation" onKeyDown={e => { if (e.key === 'Escape') onClose(); }}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-800">Create Folder</h3>
          <button type="button" onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100" aria-label="Close dialog">
            <X size={18} className="text-slate-400" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <label htmlFor="folder-name" className="block text-sm font-medium text-slate-700 mb-1.5">Folder Name</label>
          <input
            id="folder-name"
            ref={inputRef}
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. John Doe"
            aria-label="Folder name"
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
          <div className="flex justify-end gap-2 mt-5">
            <button type="button" onClick={onClose} className="btn-secondary text-sm px-4 py-2">
              Cancel
            </button>
            <button type="submit" disabled={loading || !name.trim()} className="btn-primary text-sm px-4 py-2">
              {loading ? <Loader2 size={14} className="animate-spin" /> : <FolderPlus size={14} />}
              {loading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddFileDialog({ open, onClose, onSubmit }: {
  open: boolean; onClose: () => void; onSubmit: (file: File) => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => fileInputRef.current?.click(), 100);
      return () => clearTimeout(timer);
    }
  }, [open]);

  if (!open) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      await onSubmit(file);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose} role="presentation" onKeyDown={e => { if (e.key === 'Escape') onClose(); }}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-800">Add File</h3>
          <button type="button" onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100" aria-label="Close dialog">
            <X size={18} className="text-slate-400" />
          </button>
        </div>
        <div className="py-4 text-center">
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
  );
}

interface ScannerInfo {
  id: string;
  name: string;
  source?: string;
}

function ScanDialog({ open, onClose, onSubmit, folderName }: {
  open: boolean; onClose: () => void; onSubmit: (blob: Blob, filename: string) => Promise<void>;
  folderName: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const prevOpenRef = useRef(open);

  const [mode, setMode] = useState<'select' | 'camera' | 'scanner'>('select');
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [dpi, setDpi] = useState(200);
  const [isUploading, setIsUploading] = useState(false);
  const [scannerScanning, setScannerScanning] = useState(false);
  const [scanners, setScanners] = useState<ScannerInfo[]>([]);
  const [selectedScannerId, setSelectedScannerId] = useState<string>('');
  const [scannerStatus, setScannerStatus] = useState<'idle' | 'loading' | 'connected' | 'error'>('idle');
  const [scannerError, setScannerError] = useState<string | null>(null);

  if (open && !prevOpenRef.current) {
    setMode('select');
    setCameraActive(false);
    setCapturedImage(null);
    setCameraError(null);
    setScannerScanning(false);
    setScanners([]);
    setSelectedScannerId('');
    setScannerStatus('idle');
    setScannerError(null);
  }
  prevOpenRef.current = open;

  const currentDpiConfig = DPI_OPTIONS.find(d => d.value === dpi) || DPI_OPTIONS[2];

  useEffect(() => {
    const stream = streamRef.current;
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const fetchScanners = useCallback(async () => {
    setScannerStatus('loading');
    setScannerError(null);
    try {
      const res = await fetch('http://localhost:5899/scanners');
      if (!res.ok) throw new Error('Scanner agent not available');
      const data = await res.json();
      let list = data.scanners || [];
      if (!Array.isArray(list)) list = [list];
      list = list.filter((s: any) => s && s.id && s.name);
      setScanners(list);
      if (list.length > 0) {
        setSelectedScannerId(list[0].id);
        setScannerStatus('connected');
      } else {
        setScannerError('No scanners found on this system.');
        setScannerStatus('error');
      }
    } catch {
      setScannerError('Scanner agent is not running. Start it with: node scanner-agent/index.js');
      setScannerStatus('error');
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
    setCameraError(null);
  }, []);

  const startCamera = async () => {
    setCameraError(null);
    setMode('camera');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: currentDpiConfig.width } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err: any) {
      const msg = err?.message || '';
      if (msg.includes('Permission') || msg.includes('NotAllowed')) {
        setCameraError('Camera access denied. Please allow camera permissions.');
      } else if (msg.includes('NotFound')) {
        setCameraError('No camera found on this device.');
      } else {
        setCameraError('Could not access camera.');
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
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, targetWidth, targetHeight);
    const quality = dpi >= 300 ? 0.95 : dpi >= 200 ? 0.9 : 0.8;
    const dataUrl = canvas.toDataURL('image/jpeg', quality);
    setCapturedImage(dataUrl);
    stopCamera();
  };

  const handleUploadCapture = async () => {
    if (!capturedImage) return;
    setIsUploading(true);
    try {
      const blob = await (await fetch(capturedImage)).blob();
      const filename = `scan_${Date.now()}.jpg`;
      await onSubmit(blob, filename);
      toast.success('Document scanned successfully');
      onClose();
    } catch {
      toast.error('Failed to upload scanned document');
    } finally {
      setIsUploading(false);
    }
  };

  const handleScannerScan = async () => {
    if (!selectedScannerId) return;
    setScannerScanning(true);
    try {
      const res = await fetch('http://localhost:5899/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scannerId: selectedScannerId, dpi }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Scanner not available');
      }
      const data = await res.json();
      if (data.data) {
        const blob = await (await fetch(data.data)).blob();
        await onSubmit(blob, `scan_${Date.now()}.jpg`);
        toast.success('Document scanned from device');
        onClose();
      } else {
        throw new Error('No scan data received');
      }
    } catch (err: any) {
      toast.error(err.message || 'Scanner device failed');
    } finally {
      setScannerScanning(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose} role="presentation" onKeyDown={e => { if (e.key === 'Escape') onClose(); }}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scan size={16} className="text-indigo-600" />
            <h3 className="font-bold text-slate-800">
              {mode === 'camera' ? 'Camera Scan' : mode === 'scanner' ? 'Scanner Device' : `Scan to "${folderName}"`}
            </h3>
          </div>
          <button type="button" onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100" aria-label="Close dialog">
            <X size={18} className="text-slate-400" />
          </button>
        </div>

        <div className="p-5">
          {mode === 'select' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button type="button" onClick={startCamera}
                className="flex flex-col items-center gap-3 p-8 border-2 border-dashed border-slate-200 rounded-xl hover:border-indigo-300 hover:bg-indigo-50/40 transition-all"
              >
                <Camera size={40} className="text-indigo-500" />
                <div>
                  <p className="font-semibold text-slate-700">Camera Scan</p>
                  <p className="text-xs text-slate-400 mt-0.5">Use your device camera</p>
                </div>
              </button>
              <button type="button" onClick={() => { setMode('scanner'); fetchScanners(); }}
                className="flex flex-col items-center gap-3 p-8 border-2 border-dashed border-slate-200 rounded-xl hover:border-indigo-300 hover:bg-indigo-50/40 transition-all"
              >
                <Scan size={40} className="text-indigo-500" />
                <div>
                  <p className="font-semibold text-slate-700">Scanner Device</p>
                  <p className="text-xs text-slate-400 mt-0.5">Use connected scanner hardware</p>
                </div>
              </button>
            </div>
          )}

          {mode === 'camera' && (
            <div>
              <div className="relative bg-slate-900 rounded-xl overflow-hidden min-h-[300px] flex items-center justify-center">
                {cameraError && (
                  <div className="text-center p-6">
                    <AlertCircle size={40} className="text-red-400 mx-auto mb-3" />
                    <p className="text-white/80 font-medium mb-1">Camera Error</p>
                    <p className="text-white/50 text-xs max-w-sm">{cameraError}</p>
                    <button type="button" onClick={startCamera} className="btn-primary mt-3 text-sm">
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
                <video ref={videoRef} autoPlay playsInline muted aria-label="Camera preview"
                  className={`w-full max-h-[400px] object-contain ${cameraActive ? 'block' : 'hidden'}`}
                />
                {capturedImage && (
                  <NextImage src={capturedImage} alt="Captured" width={800} height={600}
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
                      <button type="button" onClick={() => { setCapturedImage(null); startCamera(); }} className="btn-secondary text-sm">
                        <RotateCw size={14} />
                        Recapture
                      </button>
                      <button type="button" onClick={handleUploadCapture} disabled={isUploading} className="btn-primary text-sm">
                        {isUploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                        {isUploading ? 'Uploading...' : 'Save to Folder'}
                      </button>
                    </>
                  )}
                  {!cameraActive && !capturedImage && (
                    <button type="button" onClick={() => setMode('select')} className="btn-secondary text-sm">
                      <ChevronLeft size={14} />
                      Back
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Sliders size={14} className="text-slate-400" />
                  <select value={dpi} onChange={e => setDpi(Number(e.target.value))} aria-label="DPI setting"
                    className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 cursor-pointer"
                  >
                    {DPI_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {mode === 'scanner' && (
            <div>
              {scannerStatus === 'loading' && (
                <div className="text-center py-8">
                  <Loader2 size={40} className="animate-spin text-indigo-500 mx-auto mb-3" />
                  <p className="text-sm text-slate-500">Discovering scanners&hellip;</p>
                </div>
              )}
              {scannerStatus === 'error' && (
                <div className="text-center py-8">
                  <AlertCircle size={40} className="text-red-300 mx-auto mb-3" />
                  <p className="font-semibold text-slate-700 mb-1">Scanner Agent Unavailable</p>
                  <p className="text-xs text-slate-400 mb-4 max-w-sm mx-auto">{scannerError}</p>
                  <div className="bg-slate-50 rounded-lg p-4 mb-4 text-left text-xs font-mono text-slate-500">
                    <p className="font-semibold text-slate-700 mb-1">To start the scanner agent:</p>
                    <p>cd scanner-agent</p>
                    <p>node index.js</p>
                  </div>
                  <button type="button" onClick={() => { setMode('select'); }}
                    className="btn-secondary text-sm px-4 py-2"
                  >
                    <ChevronLeft size={14} />
                    Back
                  </button>
                </div>
              )}
              {scannerStatus === 'connected' && (
                <div>
                  <div className="mb-5">
                    <p className="text-sm font-semibold text-slate-700 mb-3">Select Scanner</p>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {scanners.map(s => {
                        const isWia = s.source === 'WIA' || s.id.startsWith('{');
                        return (
                          <label key={s.id}
                            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                              selectedScannerId === s.id
                                ? 'border-indigo-300 bg-indigo-50/50'
                                : 'border-slate-200 hover:border-slate-300'
                            } ${!isWia ? 'opacity-50' : ''}`}
                          >
                            <input type="radio" name="scanner" value={s.id} checked={selectedScannerId === s.id}
                              onChange={() => isWia && setSelectedScannerId(s.id)}
                              disabled={!isWia}
                              aria-label={s.name}
                              className="accent-indigo-600"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-medium text-slate-700 truncate">{s.name}</p>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                                  isWia
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-slate-100 text-slate-400'
                                }`}>
                                  {isWia ? 'Ready' : s.source === 'Printer' ? 'Printer' : 'No driver'}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-400 font-mono truncate max-w-sm">{s.id}</p>
                            </div>
                          </label>
                        );})}
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3 mb-5">
                    <div className="flex items-center gap-2">
                      <Sliders size={14} className="text-slate-400" />
                      <select value={dpi} onChange={e => setDpi(Number(e.target.value))} aria-label="DPI setting"
                        className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 cursor-pointer"
                      >
                        {DPI_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                    <button type="button" onClick={fetchScanners}
                      className="text-xs text-indigo-600 hover:text-indigo-800 transition-colors"
                    >
                      Refresh list
                    </button>
                  </div>
                  {selectedScannerId && !selectedScannerId.startsWith('{') && (
                    <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2 mb-4">
                      This device needs a WIA scanner driver for scanning. Only devices marked <strong>Ready</strong> can be used.
                    </p>
                  )}
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={handleScannerScan}
                      disabled={scannerScanning || !selectedScannerId || !selectedScannerId.startsWith('{')}
                      className="btn-primary text-base px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {scannerScanning ? <Loader2 size={16} className="animate-spin" /> : <Scan size={16} />}
                      {scannerScanning ? 'Scanning...' : 'Scan Now'}
                    </button>
                    <button type="button" onClick={() => setMode('select')}
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

export default function FileManager() {
  const [folders, setFolders] = useState<FolderData[] | undefined>(undefined);
  const [selectedFolder, setSelectedFolder] = useState<FolderData | null>(null);
  const [files, setFiles] = useState<FileData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filesLoading, setFilesLoading] = useState(false);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [showAddFile, setShowAddFile] = useState(false);
  const [showScan, setShowScan] = useState(false);

  useEffect(() => {
    fetchFolders();
  }, []);

  const fetchFolders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/files/folders');
      if (res.ok) {
        const data = await res.json();
        setFolders(Array.isArray(data) ? data : []);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const fetchFiles = async (folderId: string) => {
    setFilesLoading(true);
    try {
      const res = await fetch(`/api/files?folderId=${folderId}`);
      if (res.ok) {
        const data = await res.json();
        setFiles(Array.isArray(data) ? data : []);
      }
    } catch {
      // silent
    } finally {
      setFilesLoading(false);
    }
  };

  const handleCreateFolder = async (name: string) => {
    const res = await fetch('/api/files/folders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) throw new Error('Failed to create folder');
    const folder = await res.json();
    setFolders(prev => [folder, ...prev]);
    toast.success('Folder created');
  };

  const handleDeleteFolder = async (id: string) => {
    const res = await fetch(`/api/files/folders?id=${id}`, { method: 'DELETE' });
    if (res.ok) {
      setFolders(prev => prev.filter(f => f.id !== id));
      if (selectedFolder?.id === id) {
        setSelectedFolder(null);
        setFiles([]);
      }
      toast.success('Folder deleted');
    } else {
      toast.error('Failed to delete folder');
    }
  };

  const handleAddFile = async (file: File) => {
    if (!selectedFolder) return;
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`/api/files/upload?folderId=${selectedFolder.id}`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error('Upload failed');
    const newFile = await res.json();
    setFiles(prev => [newFile, ...prev]);
    setFolders(prev => prev.map(f =>
      f.id === selectedFolder.id ? { ...f, _count: { files: f._count.files + 1 } } : f
    ));
    toast.success('File uploaded');
  };

  const handleScanSubmit = async (blob: Blob, filename: string) => {
    if (!selectedFolder) return;
    const formData = new FormData();
    formData.append('file', blob, filename);
    const res = await fetch(`/api/files/upload?folderId=${selectedFolder.id}`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error('Upload failed');
    const newFile = await res.json();
    setFiles(prev => [newFile, ...prev]);
    setFolders(prev => prev.map(f =>
      f.id === selectedFolder.id ? { ...f, _count: { files: f._count.files + 1 } } : f
    ));
  };

  const handleDeleteFile = async (id: string) => {
    const res = await fetch(`/api/files?id=${id}`, { method: 'DELETE' });
    if (res.ok) {
      setFiles(prev => prev.filter(f => f.id !== id));
      if (selectedFolder) {
        setFolders(prev => prev.map(f =>
          f.id === selectedFolder.id ? { ...f, _count: { files: Math.max(0, f._count.files - 1) } } : f
        ));
      }
      toast.success('File deleted');
    } else {
      toast.error('Failed to delete file');
    }
  };

  const openFolder = (folder: FolderData) => {
    setSelectedFolder(folder);
    fetchFiles(folder.id);
  };

  const goBack = () => {
    setSelectedFolder(null);
    setFiles([]);
    fetchFolders();
  };

  if (selectedFolder) {
    return (
      <div className="animate-fade-in">
        <div className="flex items-center gap-3 mb-6">
          <button type="button" onClick={goBack} aria-label="Go back"
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <ChevronLeft size={20} className="text-slate-500" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <Folder size={20} className="text-indigo-600" />
              <h1 className="text-2xl font-bold text-slate-800">{selectedFolder.name}</h1>
            </div>
            <p className="text-sm text-slate-400 mt-0.5">
              {files.length} file{files.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button type="button" onClick={() => setShowAddFile(true)}
              className="btn-primary text-sm px-4 py-2"
            >
              <Upload size={14} />
              Add File
            </button>
            <button type="button" onClick={() => setShowScan(true)}
              className="btn-secondary text-sm px-4 py-2"
            >
              <Scan size={14} />
              Scan
            </button>
          </div>
        </div>

        {filesLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-slate-300" />
          </div>
        ) : files.length === 0 ? (
          <div className="text-center py-20">
            <FileText size={48} className="text-slate-200 mx-auto mb-3" />
            <p className="text-sm text-slate-400 font-medium">This folder is empty</p>
            <p className="text-xs text-slate-300 mt-1">Add files or scan documents to get started</p>
            <div className="flex items-center justify-center gap-3 mt-5">
              <button type="button" onClick={() => setShowAddFile(true)} className="btn-primary text-sm">
                <Upload size={14} />
                Add File
              </button>
              <button type="button" onClick={() => setShowScan(true)} className="btn-secondary text-sm">
                <Scan size={14} />
                Scan
              </button>
            </div>
          </div>
        ) : (
          <div className="card overflow-hidden">
            <div className="divide-y divide-slate-100">
              {files.map(file => (
                <div key={file.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors">
                  {getFileIcon(file.fileType)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-700 truncate">{file.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-slate-400">{formatSize(file.fileSize)}</span>
                      <span className="text-[10px] text-slate-300">·</span>
                      <span className="text-[10px] text-slate-400">{formatDate(new Date(file.createdAt))}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <a href={file.url} target="_blank" rel="noopener noreferrer" aria-label="Download file"
                      className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      <Download size={14} className="text-slate-400 hover:text-indigo-600" />
                    </a>
                    <button type="button" onClick={() => handleDeleteFile(file.id)} aria-label="Delete file"
                      className="p-1.5 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <Trash2 size={14} className="text-slate-300 hover:text-red-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <AddFileDialog open={showAddFile} onClose={() => setShowAddFile(false)} onSubmit={handleAddFile} />
        <ScanDialog open={showScan} onClose={() => setShowScan(false)}
          onSubmit={handleScanSubmit} folderName={selectedFolder.name}
        />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 mb-1">Files</h1>
          <p className="text-sm text-slate-400">
            {(folders?.length ?? 0)} folder{(folders?.length ?? 0) !== 1 ? 's' : ''}
          </p>
        </div>
        <button type="button" onClick={() => setShowCreateFolder(true)} className="btn-primary text-sm px-4 py-2">
          <FolderPlus size={14} />
          Create Folder
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-slate-300" />
        </div>
      ) : (folders?.length ?? 0) === 0 ? (
        <div className="text-center py-20">
          <Folder size={48} className="text-slate-200 mx-auto mb-3" />
          <p className="text-sm text-slate-400 font-medium">No folders yet</p>
          <p className="text-xs text-slate-300 mt-1">Create a folder to start organizing files</p>
          <button type="button" onClick={() => setShowCreateFolder(true)} className="btn-primary text-sm mt-5 px-6 py-2.5">
            <FolderPlus size={14} />
            Create Your First Folder
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {(folders ?? []).map(folder => (
            <div
              key={folder.id}
              role="button"
              tabIndex={0}
              onClick={() => openFolder(folder)}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') openFolder(folder); }}
              className="card p-5 cursor-pointer hover:shadow-md hover:border-indigo-200 transition-all group text-left w-full"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="size-10 rounded-lg bg-indigo-50 flex items-center justify-center">
                  <Folder size={20} className="text-indigo-600" />
                </div>
                <button type="button" aria-label="Delete folder" onClick={e => { e.stopPropagation(); handleDeleteFolder(folder.id); }}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); handleDeleteFolder(folder.id); } }}
                  className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-100 transition-all"
                >
                  <Trash2 size={13} className="text-red-300 hover:text-red-500" />
                </button>
              </div>
              <h3 className="font-bold text-sm text-slate-800 truncate">{folder.name}</h3>
              <div className="flex items-center gap-3 mt-1.5">
                <span className="text-[11px] text-slate-400">
                  {folder._count.files} file{folder._count.files !== 1 ? 's' : ''}
                </span>
                <span className="text-[11px] text-slate-300">·</span>
                <span className="text-[11px] text-slate-400">
                  {formatDate(new Date(folder.updatedAt))}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <CreateFolderDialog open={showCreateFolder} onClose={() => setShowCreateFolder(false)}
        onSubmit={handleCreateFolder}
      />
    </div>
  );
}
