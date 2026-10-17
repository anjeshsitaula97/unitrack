"use client";

import { useEffect, useState } from "react";
import { Edit2, Mail } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { loadProfile, type ProfileData } from "./settings-shared";

export default function ProfileSettings() {
  const [profile, setProfile] = useState<ProfileData>({
    name: "",
    email: "",
    role: "",
    avatar: "",
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  useEffect(() => {
    const ac = new AbortController();
    loadProfile(ac.signal)
      .then((data) => {
        if (data) setProfile(data);
      })
      .catch(() => {});
    return () => ac.abort();
  }, []);

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: profile.name, avatar: profile.avatar }),
      });
      if (res.ok) {
        toast.success("Profile updated successfully");
      } else {
        toast.error("Failed to update profile");
      }
    } catch (_err) {
      toast.error("Error connecting to server");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image size must be less than 2MB");
      return;
    }
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setProfile({ ...profile, avatar: data.url });
    } catch {
      toast.error("Failed to upload avatar");
    }
  };

  return (
    <div className="card p-10 max-w-2xl mx-auto animate-fade-in relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-indigo-500/10 to-violet-500/10" />

      <div className="relative mt-8 text-center">
        <div className="relative inline-block group">
          <div className="size-32 rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-4xl font-bold shadow-2xl shadow-indigo-200 border-4 border-white overflow-hidden relative">
            {profile.avatar ? (
              <Image
                src={profile.avatar}
                alt={profile.name}
                width={128}
                height={128}
                className="object-cover size-full"
                unoptimized
              />
            ) : profile.name ? (
              profile.name.substring(0, 2).toUpperCase()
            ) : (
              "??"
            )}
          </div>
          <label
            htmlFor="avatar-upload"
            className="absolute -bottom-2 -right-2 size-10 bg-white rounded-2xl shadow-lg flex items-center justify-center text-indigo-600 cursor-pointer hover:bg-indigo-50 transition border border-slate-100 group-hover:scale-110"
          >
            <Edit2 size={18} />
            <input
              id="avatar-upload"
              type="file"
              aria-label="Upload profile photo"
              className="hidden"
              accept="image/*"
              onChange={handleAvatarChange}
            />
          </label>
        </div>
        <h2 className="text-2xl font-black text-slate-800 mt-6">{profile.name || "Loading..."}</h2>
        <div className="flex items-center justify-center gap-2 mt-1">
          <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest border border-indigo-100">
            {profile.role || "System User"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 text-left pt-8 border-t border-slate-50">
        <div className="space-y-6">
          <div>
            <label
              htmlFor="settings-profile-name"
              className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1"
            >
              Full Name
            </label>
            <input
              id="settings-profile-name"
              type="text"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 font-semibold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition shadow-sm"
            />
          </div>
          <div>
            <label
              htmlFor="settings-profile-email"
              className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1"
            >
              Email Address
            </label>
            <input
              id="settings-profile-email"
              type="text"
              value={profile.email}
              readOnly
              className="w-full px-5 py-3 bg-slate-100/50 border border-slate-200 rounded-2xl text-slate-500 font-medium outline-none cursor-not-allowed shadow-sm"
            />
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label
              htmlFor="settings-profile-role"
              className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1"
            >
              Account Role
            </label>
            <input
              id="settings-profile-role"
              type="text"
              value={profile.role}
              readOnly
              className="w-full px-5 py-3 bg-slate-100/50 border border-slate-200 rounded-2xl text-slate-500 font-medium outline-none cursor-not-allowed shadow-sm"
            />
          </div>
          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
              Avatar Source
            </span>
            <div className="px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] text-slate-400 font-medium flex items-center gap-2 italic truncate">
              <Mail size={14} className="flex-shrink-0" />
              {profile.avatar
                ? profile.avatar.startsWith("data:")
                  ? "Custom Uploaded Image"
                  : profile.avatar
                : "System Default Initials"}
            </div>
          </div>
        </div>

        <div className="md:col-span-2 pt-6 flex justify-end">
          <button
            type="button"
            onClick={handleSaveProfile}
            disabled={isSavingProfile}
            className="btn-primary px-12 py-3 rounded-2xl shadow-xl shadow-indigo-100 disabled:opacity-50 hover:scale-105 transition-transform"
          >
            {isSavingProfile ? "Saving Changes..." : "Save Profile Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
