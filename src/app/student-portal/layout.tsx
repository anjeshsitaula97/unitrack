"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import StudentSidebar from "@/components/StudentSidebar";
import StudentTopbar from "@/components/StudentTopbar";
import { isSessionActive } from "@/lib/client-session";
import { Loader2 } from "lucide-react";

export default function StudentPortalLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [student, setStudent] = useState<any>(null);
  const [sessionReady, setSessionReady] = useState<boolean>(isSessionActive());
  const router = useRouter();

  useEffect(() => {
    if (!isSessionActive()) {
      fetch("/api/auth/logout", { method: "POST" })
        .catch(() => {})
        .finally(() => {
          router.replace("/login");
        });
      return;
    }

    fetch("/api/student-portal/me")
      .then((r) => {
        if (!r.ok) {
          router.push("/login");
          return null;
        }
        return r.json();
      })
      .then((s) => {
        if (s) setStudent(s);
      })
      .catch(() => router.push("/login"));
  }, [router]);

  if (!sessionReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <StudentSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <StudentTopbar sidebarCollapsed={collapsed} student={student} />
      <main
        className={`transition-all duration-300 pt-14 min-h-screen ${collapsed ? "ml-16" : "ml-60"}`}
      >
        <div className="p-6 max-w-screen-2xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
