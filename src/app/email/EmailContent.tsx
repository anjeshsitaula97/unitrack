"use client";

import React, { useState, useEffect, useRef } from "react";
import { Send, Settings, Loader2, AlertTriangle } from "lucide-react";
import ComposeTab, { type EmailStudent } from "./ComposeTab";
import SmtpSettingsForm, { type SmtpSettings } from "./SmtpSettingsForm";
import { toast } from "sonner";
import { api } from "@/lib/fetch-client";

export default function EmailContent() {
  const [tab, setTab] = useState<"compose" | "settings">("compose");
  const [configured, setConfigured] = useState(false);
  const [checking, setChecking] = useState(true);
  const [studentSearch, setStudentSearch] = useState("");
  const [students, setStudents] = useState<EmailStudent[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<EmailStudent | null>(null);

  // Compose form
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const sendingRef = useRef(false);

  // Settings form
  const [smtpHost, setSmtpHost] = useState("");
  const [smtpPort, setSmtpPort] = useState("587");
  const [smtpUser, setSmtpUser] = useState("");
  const [smtpPass, setSmtpPass] = useState("");
  const [fromEmail, setFromEmail] = useState("");
  const [fromName, setFromName] = useState("");
  const [encryption, setEncryption] = useState("TLS");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await api.get<{
          configured: boolean;
          host?: string;
          fromEmail?: string;
          fromName?: string;
        }>("/api/email/send", { showError: false });
        if (cancelled) return;
        setConfigured(!!data?.configured);
        if (data?.configured) {
          setSmtpHost(data.host || "");
          setFromEmail(data.fromEmail || "");
          setFromName(data.fromName || "");
        }
      } catch {
        // ignore — fall through to the not-configured state
      } finally {
        if (!cancelled) setChecking(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!studentSearch || studentSearch.length < 2) return;
    const timer = setTimeout(async () => {
      try {
        const data = await api.get<{ data?: EmailStudent[] }>(
          `/api/students?search=${encodeURIComponent(studentSearch)}&perPage=10`,
          { showError: false }
        );
        setStudents(data?.data || []);
      } catch {}
    }, 300);
    return () => clearTimeout(timer);
  }, [studentSearch]);

  const selectStudent = (s: EmailStudent) => {
    setSelectedStudent(s);
    setTo(s.email);
    setStudentSearch("");
    setStudents([]);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sendingRef.current) return;
    if (!to || !subject || !body) {
      toast.error("Please fill in all fields");
      return;
    }
    sendingRef.current = true;
    setSending(true);
    try {
      const res = await api.post("/api/email/send", {
        to,
        subject,
        body,
        studentId: selectedStudent?.id,
        type: "manual",
      });
      if (res) {
        toast.success("Email sent successfully");
        setSubject("");
        setBody("");
        setSelectedStudent(null);
        setTo("");
      }
    } catch {
      // error handled by api helper
    } finally {
      sendingRef.current = false;
      setSending(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!smtpHost || !smtpPort || !smtpUser || !smtpPass || !fromEmail) {
      toast.error("Please fill in all SMTP fields");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/email-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          smtpHost,
          smtpPort: parseInt(smtpPort),
          smtpUser,
          smtpPass,
          fromEmail,
          fromName,
          smtpEncryption: encryption,
        }),
      });
      if (res.ok) {
        toast.success("Email settings saved");
        setConfigured(true);
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to save settings");
      }
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (checking) {
    return (
      <div className="py-20 flex items-center justify-center">
        <Loader2 className="animate-spin text-slate-400" size={32} />
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">Email</h1>
      </div>

      <div className="flex gap-2 mb-6">
        {(
          [
            { id: "compose", label: "Compose", icon: Send },
            { id: "settings", label: "SMTP Settings", icon: Settings },
          ] as const
        ).map((t) => (
          <button
            type="button"
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-1.5 ${
              tab === t.id
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <t.icon size={16} />
            {t.label}
          </button>
        ))}
      </div>

      {!configured && tab === "compose" && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-center gap-3">
          <AlertTriangle size={18} className="text-amber-500 flex-shrink-0" />
          <div className="text-sm text-amber-800">
            SMTP not configured.{" "}
            <button
              type="button"
              onClick={() => setTab("settings")}
              className="font-semibold underline"
            >
              Configure now
            </button>
          </div>
        </div>
      )}

      {tab === "compose" ? (
        <ComposeTab
          to={to}
          setTo={setTo}
          subject={subject}
          setSubject={setSubject}
          body={body}
          setBody={setBody}
          sending={sending}
          configured={configured}
          selectedStudent={selectedStudent}
          studentSearch={studentSearch}
          setStudentSearch={setStudentSearch}
          students={students}
          onSelectStudent={selectStudent}
          onSend={handleSend}
        />
      ) : (
        <SmtpSettingsForm
          settings={{
            host: smtpHost,
            port: smtpPort,
            user: smtpUser,
            pass: smtpPass,
            fromEmail,
            fromName,
            encryption,
          }}
          onChange={(next: SmtpSettings) => {
            setSmtpHost(next.host);
            setSmtpPort(next.port);
            setSmtpUser(next.user);
            setSmtpPass(next.pass);
            setFromEmail(next.fromEmail);
            setFromName(next.fromName);
            setEncryption(next.encryption);
          }}
          saving={saving}
          onSubmit={handleSaveSettings}
        />
      )}
    </>
  );
}
