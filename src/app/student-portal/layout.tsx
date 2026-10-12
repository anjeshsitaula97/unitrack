"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import StudentSidebar from "@/components/StudentSidebar";
import StudentTopbar from "@/components/StudentTopbar";
import { Loader2 } from "lucide-react";

interface PortalStudent {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  nationality?: string | null;
  studyLevel?: string | null;
  interestedCountry?: string | null;
  status?: string | null;
  counselor?: string | null;
  _count?: {
    applications: number;
    payments: number;
    documents: number;
  };
}

export default function StudentPortalLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [student, setStudent] = useState<PortalStudent | null>(null);
  const [ready, setReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    fetch("/api/student-portal/me", { credentials: "include", cache: "no-store" })
      .then((r) => {
        if (!r.ok) {
          router.replace("/login");
          return null;
        }
        return r.json();
      })
      .then((s) => {
        if (cancelled) return;
        if (s) {
          setStudent(s);
          setReady(true);
        }
      })
      .catch(() => {
        if (!cancelled) router.replace("/login");
      });

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (!ready) {
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
