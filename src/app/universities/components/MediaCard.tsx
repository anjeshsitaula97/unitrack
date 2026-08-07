"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Upload, Building2, Globe, Plus, X, Loader2 } from "lucide-react";

interface MediaCardProps {
  form: any;
  update: (field: string, value: any) => void;
  dispatch: React.Dispatch<any>;
  toast: any;
}

async function uploadFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: formData });
  if (!res.ok) throw new Error("Upload failed");
  const data = await res.json();
  return data.url;
}

export default function MediaCard({ form, update, dispatch, toast }: MediaCardProps) {
  const [uploading, setUploading] = useState<string | null>(null);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading("logo");
    try {
      const url = await uploadFile(file);
      update("logo", url);
      toast.success("Logo uploaded");
    } catch {
      toast.error("Failed to upload logo");
    } finally {
      setUploading(null);
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading("banner");
    try {
      const url = await uploadFile(file);
      update("banner", url);
      toast.success("Banner uploaded");
    } catch {
      toast.error("Failed to upload banner");
    } finally {
      setUploading(null);
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploading("gallery");
    let count = 0;
    try {
      for (const file of files) {
        const url = await uploadFile(file);
        dispatch({ type: "addGalleryImage", image: url });
        count++;
      }
      toast.success(`${count} image${count > 1 ? "s" : ""} added`);
    } catch {
      toast.error("Failed to upload some images");
    } finally {
      setUploading(null);
    }
  };

  return (
    <div className="card p-6">
      <div className="flex items-center gap-2 mb-5">
        <div className="size-8 bg-amber-50 rounded-lg flex items-center justify-center">
          <Upload size={16} className="text-amber-600" />
        </div>
        <h2 className="text-base font-bold text-slate-700">Media & Assets</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <span className="block text-xs font-semibold text-slate-600 mb-2">University Logo</span>
          <div className="flex items-center gap-4">
            <div className="size-20 rounded-2xl bg-transparent border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden flex-shrink-0 relative">
              {uploading === "logo" ? (
                <Loader2 className="animate-spin text-indigo-500" size={24} />
              ) : form.logo ? (
                <Image
                  src={form.logo}
                  alt="Logo Preview"
                  fill
                  className="object-contain"
                  sizes="80px"
                />
              ) : (
                <Building2 className="text-slate-300" size={24} />
              )}
            </div>
            <div className="flex-1">
              <label
                htmlFor="logoUpload"
                className={`btn-secondary text-xs cursor-pointer inline-flex items-center gap-2 ${uploading === "logo" ? "opacity-50 pointer-events-none" : ""}`}
              >
                <Upload size={14} />
                {form.logo ? "Change Logo" : "Upload Logo"}
                <input
                  id="logoUpload"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  disabled={uploading !== null}
                  onChange={handleLogoUpload}
                />
              </label>
              <p className="text-[10px] text-slate-400 mt-2 italic">Recommended: 400x400 PNG/SVG</p>
            </div>
          </div>
        </div>

        <div>
          <span className="block text-xs font-semibold text-slate-600 mb-2">Banner Image</span>
          <div className="flex flex-col gap-3">
            <div className="h-20 w-full rounded-xl bg-slate-100 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden relative">
              {uploading === "banner" ? (
                <Loader2 className="animate-spin text-indigo-500" size={24} />
              ) : form.banner ? (
                <Image
                  src={form.banner}
                  alt="Banner Preview"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              ) : (
                <Globe className="text-slate-300" size={24} />
              )}
            </div>
            <label
              htmlFor="bannerUpload"
              className={`btn-secondary text-xs cursor-pointer inline-flex items-center justify-center gap-2 ${uploading === "banner" ? "opacity-50 pointer-events-none" : ""}`}
            >
              <Upload size={14} />
              {form.banner ? "Change Banner" : "Upload Banner"}
              <input
                id="bannerUpload"
                type="file"
                className="hidden"
                accept="image/*"
                disabled={uploading !== null}
                onChange={handleBannerUpload}
              />
            </label>
          </div>
        </div>

        <div className="md:col-span-2">
          <span className="block text-xs font-semibold text-slate-600 mb-3">
            Campus & Gallery Images
          </span>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {form.imagesList.map((img: string, idx: number) => (
              <div
                key={img}
                className="relative aspect-square rounded-xl bg-slate-100 overflow-hidden group"
              >
                <Image
                  src={img}
                  alt={`Gallery ${idx}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 20vw"
                />
                <button
                  type="button"
                  aria-label={`Remove image ${idx + 1}`}
                  onClick={() => {
                    const newList = form.imagesList.filter((_: string, i: number) => i !== idx);
                    update("imagesList", newList);
                  }}
                  className="absolute top-1 right-1 p-1 bg-rose-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
            <label
              className={`aspect-square rounded-xl border-2 border-dashed border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${uploading === "gallery" ? "opacity-50 pointer-events-none" : ""}`}
            >
              {uploading === "gallery" ? (
                <Loader2 className="animate-spin text-indigo-500" size={20} />
              ) : (
                <Plus className="text-slate-400" size={20} />
              )}
              <span className="text-[10px] font-bold text-slate-400">
                {uploading === "gallery" ? "Uploading…" : "Add Image"}
              </span>
              <input
                type="file"
                className="hidden"
                multiple
                accept="image/*"
                disabled={uploading !== null}
                onChange={handleGalleryUpload}
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
