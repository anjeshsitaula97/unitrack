"use client";

import React, { useState, useEffect } from "react";
import { Send, Settings, Mail, Loader2, AlertTriangle, Search } from "lucide-react";
import { toast } from "sonner";
import { api, safeJson } from "@/lib/fetch-client";

interface Student {
  id: string;
  name: string;
  email: string;
}

export default function EmailContent() {
  const [tab, setTab] = useState<"compose" | "settings">("compose");
  const [configured, setConfigured] = useState(false);
  const [checking, setChecking] = useState(true);
  const [studentSearch, setStudentSearch] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Compose form
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

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
    fetch("/api/email/send")
      .then(safeJson)
      .then((data) => {
        setConfigured(data.configured);
        if (data.configured) {
          setSmtpHost(data.host || "");
          setFromEmail(data.fromEmail || "");
          setFromName(data.fromName || "");
        }
        setChecking(false);
      })
      .catch(() => setChecking(false));
  }, []);

  useEffect(() => {
    if (!studentSearch || studentSearch.length < 2) return;
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/students?search=${encodeURIComponent(studentSearch)}&perPage=10`
        );
        const data = await res.json();
        setStudents(data?.data || []);
      } catch {}
    }, 300);
    return () => clearTimeout(timer);
  }, [studentSearch]);

  const selectStudent = (s: Student) => {
    setSelectedStudent(s);
    setTo(s.email);
    setStudentSearch("");
    setStudents([]);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!to || !subject || !body) {
      toast.error("Please fill in all fields");
      return;
    }
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
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 ${
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
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <form
              onSubmit={handleSend}
              className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  To
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    size={16}
                  />
                  <input
                    type="email"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    placeholder="recipient@email.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Subject
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Email subject"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Message
                </label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={10}
                  placeholder="Write your email message here... (HTML supported)"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm resize-y"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={sending || !configured}
                  className="px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {sending ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                  {sending ? "Sending..." : "Send Email"}
                </button>
                {selectedStudent && (
                  <span className="text-xs text-slate-400">
                    To: {selectedStudent.name} ({selectedStudent.email})
                  </span>
                )}
              </div>
            </form>
          </div>

          <div>
            <div className="bg-white rounded-2xl border border-slate-100 p-4">
              <h3 className="font-bold text-slate-800 text-sm mb-3">Quick Select Student</h3>
              <div className="relative mb-3">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={14}
                />
                <input
                  type="text"
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  placeholder="Search students..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-xs"
                />
              </div>
              <div className="space-y-1 max-h-[300px] overflow-y-auto">
                {studentSearch.length >= 2 &&
                  students.map((s) => (
                    <button
                      type="button"
                      key={s.id}
                      onClick={() => selectStudent(s)}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <div className="text-sm font-medium text-slate-700">{s.name}</div>
                      <div className="text-xs text-slate-400">{s.email}</div>
                    </button>
                  ))}
                {studentSearch.length >= 2 && students.length === 0 && (
                  <p className="text-xs text-slate-400 text-center py-4">No students found</p>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-lg">
          <form
            onSubmit={handleSaveSettings}
            className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  SMTP Host
                </label>
                <input
                  type="text"
                  value={smtpHost}
                  onChange={(e) => setSmtpHost(e.target.value)}
                  placeholder="smtp.gmail.com"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Port
                </label>
                <input
                  type="number"
                  value={smtpPort}
                  onChange={(e) => setSmtpPort(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                SMTP Username
              </label>
              <input
                type="text"
                value={smtpUser}
                onChange={(e) => setSmtpUser(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                SMTP Password
              </label>
              <input
                type="password"
                value={smtpPass}
                onChange={(e) => setSmtpPass(e.target.value)}
                placeholder="App password or SMTP password"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  From Email
                </label>
                <input
                  type="email"
                  value={fromEmail}
                  onChange={(e) => setFromEmail(e.target.value)}
                  placeholder="sender@email.com"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  From Name
                </label>
                <input
                  type="text"
                  value={fromName}
                  onChange={(e) => setFromName(e.target.value)}
                  placeholder="UniTrack"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Encryption
              </label>
              <select
                value={encryption}
                onChange={(e) => setEncryption(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
              >
                <option value="TLS">TLS</option>
                <option value="SSL">SSL</option>
                <option value="None">None</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 className="animate-spin" size={18} /> : <Settings size={18} />}
              {saving ? "Saving..." : "Save SMTP Settings"}
            </button>
          </form>
        </div>
      )}
    </>
  );
}
