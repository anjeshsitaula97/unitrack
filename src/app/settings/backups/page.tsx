"use client";

import React, { useState } from "react";
import AppLayoutWrapper from "@/components/AppLayoutWrapper";
import {
  Download,
  Upload,
  RefreshCw,
  ShieldCheck,
  Database,
  AlertTriangle,
  FileJson,
  Loader2,
  Settings2,
  FileText,
  Users,
  GraduationCap,
  Building2,
  BookOpen,
  Library,
  Settings,
  ArrowLeft,
  Lock,
  Unlock,
} from "lucide-react";
import ConfirmDialog from "@/components/ConfirmDialog";
import { toast } from "sonner";

const DATA_SECTIONS = [
  {
    id: "universities",
    label: "Universities",
    icon: <Building2 size={14} />,
    tables: ["universities"],
  },
  { id: "courses", label: "Courses", icon: <BookOpen size={14} />, tables: ["courses"] },
  {
    id: "students",
    label: "Students & Docs",
    icon: <GraduationCap size={14} />,
    tables: ["students", "studentDocuments"],
  },
  {
    id: "leads",
    label: "Leads & CRM",
    icon: <Users size={14} />,
    tables: ["leads", "activityLogs", "partners", "loginLogs"],
  },
  {
    id: "applications",
    label: "Applications",
    icon: <FileText size={14} />,
    tables: ["applications"],
  },
  {
    id: "finance",
    label: "Payments & Expenses",
    icon: <Database size={14} />,
    tables: ["payments", "expenses"],
  },
  {
    id: "management",
    label: "Tasks & Branches",
    icon: <ShieldCheck size={14} />,
    tables: ["tasks", "branches"],
  },
  {
    id: "access",
    label: "Access & Security",
    icon: <Settings2 size={14} />,
    tables: ["users", "roles", "apiKeys"],
  },
  {
    id: "hr",
    label: "HR & Payroll",
    icon: <Users size={14} />,
    tables: [
      "departments",
      "designations",
      "employeeDocuments",
      "attendance",
      "leaveTypes",
      "leaveBalances",
      "leaveRequests",
      "payrolls",
      "payrollItems",
    ],
  },
  {
    id: "support",
    label: "Support & Tickets",
    icon: <ShieldCheck size={14} />,
    tables: ["tickets", "emailSettings"],
  },
  {
    id: "visa",
    label: "Visa & Embassy",
    icon: <FileText size={14} />,
    tables: ["visaTypes", "embassyDetails", "visaChecklists", "workflowStages"],
  },
  {
    id: "chat",
    label: "Chat & Messages",
    icon: <Database size={14} />,
    tables: ["chatRooms", "chatMessages"],
  },
  {
    id: "learning",
    label: "Learning Hub",
    icon: <Library size={14} />,
    tables: ["countries", "learningCategories", "learningResources"],
  },
  {
    id: "system",
    label: "System Settings",
    icon: <Settings size={14} />,
    tables: [
      "systemSettings",
      "quickFilters",
      "faculties",
      "degreeTypes",
      "intakes",
      "qualifications",
      "academicDocuments",
      "notifications",
    ],
  },
];

interface BackupData {
  encrypted?: boolean;
  timestamp?: string;
  password?: string;
  selectedTables?: string[];
  data?: Record<string, unknown[]>;
}

export default function BackupsPage() {
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [showBackupConfig, setShowBackupConfig] = useState(false);
  const [selectedBackupSections, setSelectedBackupSections] = useState<string[]>(() =>
    DATA_SECTIONS.map((s) => s.id)
  );

  const [uploadedBackup, setUploadedBackup] = useState<BackupData | null>(null);
  const [selectedRestoreSections, setSelectedRestoreSections] = useState<string[]>([]);
  const [lastBackup, setLastBackup] = useState<string | null>(null);
  const [encryptBackup, setEncryptBackup] = useState(false);
  const [backupPassword, setBackupPassword] = useState("");
  const [restorePassword, setRestorePassword] = useState("");
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);

  const toggleBackupSection = (id: string) => {
    setSelectedBackupSections((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const toggleRestoreSection = (id: string) => {
    setSelectedRestoreSections((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleBackup = async () => {
    if (selectedBackupSections.length === 0) {
      toast.error("Please select at least one data section to backup");
      return;
    }
    if (encryptBackup && !backupPassword) {
      toast.error("Please enter an encryption password");
      return;
    }

    setIsBackingUp(true);
    try {
      const allTables = DATA_SECTIONS.reduce((acc: string[], s) => {
        if (selectedBackupSections.includes(s.id)) acc.push(...s.tables);
        return acc;
      }, []);

      let url = `/api/backup?tables=${allTables.join(",")}`;
      if (encryptBackup && backupPassword) {
        url += `&password=${encodeURIComponent(backupPassword)}`;
      }

      const response = await fetch(url);
      if (!response.ok) throw new Error("Backup failed");

      const blob = await response.blob();
      const urlBlob = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = urlBlob;
      a.download = `unitrack-backup-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(urlBlob);
      document.body.removeChild(a);

      setLastBackup(new Date().toLocaleString());
      toast.success(
        encryptBackup
          ? "Encrypted backup generated and downloaded successfully"
          : "Backup generated and downloaded successfully"
      );
      setShowBackupConfig(false);
      setBackupPassword("");
      setEncryptBackup(false);
    } catch (_error) {
      toast.error("Failed to generate backup. Please try again.");
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const backupData = JSON.parse(content);

        if (backupData.encrypted) {
          setUploadedBackup(backupData);
          setSelectedRestoreSections([]);
          setRestorePassword("");
          return;
        }

        if (!backupData.data || !backupData.timestamp) {
          throw new Error("Invalid backup file format");
        }
        setUploadedBackup(backupData);
        // Automatically select sections that exist in the backup
        const availableSections: string[] = [];
        for (const section of DATA_SECTIONS) {
          if (
            section.tables.some((table) => {
              const records = backupData.data?.[table];
              return !!records && records.length > 0;
            })
          ) {
            availableSections.push(section.id);
          }
        }
        setSelectedRestoreSections(availableSections);
      } catch (error: unknown) {
        toast.error(error instanceof Error ? error.message : "Failed to parse backup file");
      }
    };
    reader.readAsText(file);
    event.target.value = ""; // Reset input
  };

  const handleRestore = async () => {
    if (!uploadedBackup) {
      toast.error("Please upload a backup file first");
      return;
    }

    if (uploadedBackup.encrypted) {
      if (!restorePassword) {
        toast.error("Please enter the decryption password");
        return;
      }
    } else if (selectedRestoreSections.length === 0) {
      toast.error("Please select at least one section to restore");
      return;
    }

    setShowRestoreConfirm(true);
  };

  const confirmRestore = async () => {
    setShowRestoreConfirm(false);
    if (!uploadedBackup) return;
    setIsRestoring(true);
    try {
      const allTables = uploadedBackup.encrypted
        ? undefined
        : DATA_SECTIONS.reduce((acc: string[], s) => {
            if (selectedRestoreSections.includes(s.id)) acc.push(...s.tables);
            return acc;
          }, []);

      const body: BackupData = { ...uploadedBackup };
      if (uploadedBackup.encrypted) {
        body.password = restorePassword;
      }
      if (allTables) {
        body.selectedTables = allTables;
      }

      const response = await fetch("/api/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        toast.success("Data restored successfully! Reloading...");
        setTimeout(() => window.location.reload(), 2000);
      } else {
        const err = await response.json();
        throw new Error(err.error || "Restore failed");
      }
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to restore data");
      setIsRestoring(false);
    }
  };

  return (
    <AppLayoutWrapper>
      <div className="animate-fade-in relative block">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800 mb-1 flex items-center gap-2">
            <Database className="text-indigo-600" size={24} />
            Data Management
          </h1>
          <p className="text-sm text-slate-400 font-medium">
            Create granular backups and restore specific system datasets.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Backup Section */}
          <div className="card p-0 border-none shadow-xl shadow-slate-200/50 overflow-hidden min-h-[480px] flex flex-col">
            {!showBackupConfig ? (
              <div className="p-12 flex-1 flex flex-col items-center justify-center text-center">
                <div className="size-24 bg-indigo-50 text-indigo-600 rounded-[2.5rem] flex items-center justify-center mb-8 relative group shadow-inner">
                  <Download size={40} className="group-hover:-translate-y-1 transition-transform" />
                  <div className="absolute inset-0 bg-indigo-600/5 rounded-[2.5rem] animate-pulse" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-3">Backup Snapshot</h2>
                <p className="text-sm text-slate-500 mb-10 max-w-xs leading-relaxed">
                  Securely export your system data. You can choose to backup the entire system or
                  select specific categories.
                </p>
                <button
                  type="button"
                  onClick={() => setShowBackupConfig(true)}
                  className="btn-primary px-10 py-4 text-base flex items-center gap-3 shadow-lg shadow-indigo-100"
                >
                  <RefreshCw size={20} className="animate-spin-slow" />
                  Start New Backup
                </button>
                {lastBackup && (
                  <p className="mt-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Latest Activity: {lastBackup}
                  </p>
                )}
              </div>
            ) : (
              <BackupConfigPanel
                showBackupConfig={showBackupConfig}
                setShowBackupConfig={setShowBackupConfig}
                selectedBackupSections={selectedBackupSections}
                setSelectedBackupSections={setSelectedBackupSections}
                toggleBackupSection={toggleBackupSection}
                encryptBackup={encryptBackup}
                setEncryptBackup={setEncryptBackup}
                backupPassword={backupPassword}
                setBackupPassword={setBackupPassword}
                handleBackup={handleBackup}
                isBackingUp={isBackingUp}
                lastBackup={lastBackup}
              />
            )}
          </div>

          {/* Restore Section */}
          <div className="card p-0 border-none shadow-xl shadow-slate-200/50 overflow-hidden min-h-[480px] flex flex-col">
            {!uploadedBackup ? (
              <div className="p-12 flex-1 flex flex-col items-center justify-center text-center">
                <div className="size-24 bg-rose-50 text-rose-600 rounded-[2.5rem] flex items-center justify-center mb-8 relative group shadow-inner">
                  <Upload size={40} className="group-hover:translate-y-1 transition-transform" />
                  <div className="absolute inset-0 bg-rose-600/5 rounded-[2.5rem] animate-pulse" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-3">System Restore</h2>
                <p className="text-sm text-slate-500 mb-10 max-w-xs leading-relaxed">
                  Recover your data from a previous backup file. You can choose exactly which parts
                  of the system to overwrite.
                </p>

                <div className="relative">
                  <input
                    type="file"
                    aria-label="Upload Backup File"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                  />
                  <button
                    type="button"
                    className="btn-secondary border-rose-200 text-rose-600 hover:bg-rose-50 px-10 py-4 text-base flex items-center gap-3"
                    aria-label="FileJson"
                  >
                    {" "}
                    <FileJson size={20} />
                    Upload Backup File
                  </button>
                </div>
              </div>
            ) : (
              <RestoreConfigPanel
                uploadedBackup={uploadedBackup}
                setUploadedBackup={setUploadedBackup}
                selectedRestoreSections={selectedRestoreSections}
                setSelectedRestoreSections={setSelectedRestoreSections}
                toggleRestoreSection={toggleRestoreSection}
                restorePassword={restorePassword}
                setRestorePassword={setRestorePassword}
                handleRestore={handleRestore}
                isRestoring={isRestoring}
                showRestoreConfirm={showRestoreConfirm}
                setShowRestoreConfirm={setShowRestoreConfirm}
                confirmRestore={confirmRestore}
              />
            )}
          </div>
        </div>

        {/* Security Warning */}
        <div className="mt-12 p-6 bg-amber-50 border border-amber-100 rounded-3xl flex items-start gap-4">
          <div className="size-10 bg-white rounded-xl flex items-center justify-center text-amber-600 shadow-sm flex-shrink-0">
            <AlertTriangle size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-amber-900 mb-1">Important Security Note</h3>
            <p className="text-xs text-amber-700 leading-relaxed">
              Backup files contain sensitive system information, including student records and user
              data. Always store these files in a secure, encrypted location. Avoid sharing backup
              files via insecure channels.
            </p>
          </div>
        </div>
      </div>
    </AppLayoutWrapper>
  );
}

function BackupConfigPanel({
  showBackupConfig: _showBackupConfig,
  setShowBackupConfig,
  selectedBackupSections,
  setSelectedBackupSections,
  toggleBackupSection,
  encryptBackup,
  setEncryptBackup,
  backupPassword,
  setBackupPassword,
  handleBackup,
  isBackingUp,
  lastBackup: _lastBackup,
}: {
  showBackupConfig: boolean;
  setShowBackupConfig: (v: boolean) => void;
  selectedBackupSections: string[];
  setSelectedBackupSections: (v: string[] | ((prev: string[]) => string[])) => void;
  toggleBackupSection: (id: string) => void;
  encryptBackup: boolean;
  setEncryptBackup: (v: boolean) => void;
  backupPassword: string;
  setBackupPassword: (v: string) => void;
  handleBackup: () => Promise<void>;
  isBackingUp: boolean;
  lastBackup: string | null;
}) {
  return (
    <div className="p-8 flex-1 flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <button
          type="button"
          onClick={() => setShowBackupConfig(false)}
          className="p-2 -ml-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setSelectedBackupSections(DATA_SECTIONS.map((s) => s.id))}
            className="text-[10px] font-bold text-indigo-600 hover:underline uppercase tracking-widest"
          >
            Select All
          </button>
          <span className="text-slate-300">|</span>
          <button
            type="button"
            onClick={() => setSelectedBackupSections([])}
            className="text-[10px] font-bold text-slate-400 hover:underline uppercase tracking-widest"
          >
            Deselect All
          </button>
        </div>
      </div>

      <div className="flex-1">
        <h2 className="text-xl font-bold text-slate-800 mb-2">Configure Export</h2>
        <p className="text-xs text-slate-500 mb-6">Choose datasets to include in the snapshot.</p>

        <div className="grid grid-cols-2 gap-3 mb-8">
          {DATA_SECTIONS.map((section) => (
            <button
              type="button"
              key={section.id}
              onClick={() => toggleBackupSection(section.id)}
              className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                selectedBackupSections.includes(section.id)
                  ? "border-indigo-600 bg-indigo-50/50 text-indigo-700"
                  : "border-slate-100 hover:border-slate-200 text-slate-500"
              }`}
            >
              <div
                className={`${selectedBackupSections.includes(section.id) ? "text-indigo-600" : "text-slate-400"}`}
              >
                {section.icon}
              </div>
              <span className="text-[11px] font-bold truncate">{section.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Encryption toggle */}
      <div className="mb-6">
        <button
          type="button"
          onClick={() => setEncryptBackup(!encryptBackup)}
          className={`flex items-center gap-3 w-full p-4 rounded-2xl border-2 transition-all ${
            encryptBackup
              ? "border-emerald-400 bg-emerald-50 text-emerald-700"
              : "border-slate-100 hover:border-slate-200 text-slate-400"
          }`}
        >
          <div className={`p-2 rounded-xl ${encryptBackup ? "bg-emerald-100" : "bg-slate-50"}`}>
            {encryptBackup ? <Lock size={18} /> : <Unlock size={18} />}
          </div>
          <div className="text-left flex-1">
            <p className="text-sm font-bold">Encrypt Backup</p>
            <p className="text-[10px] leading-tight opacity-70">
              Password-protect the backup file with AES-256 encryption
            </p>
          </div>
          <div
            className={`w-10 h-6 rounded-full transition-all ${encryptBackup ? "bg-emerald-500" : "bg-slate-200"} relative`}
          >
            <div
              className={`absolute top-0.5 size-5 bg-white rounded-full shadow transition-all ${encryptBackup ? "left-[18px]" : "left-0.5"}`}
            />
          </div>
        </button>
        {encryptBackup && (
          <div className="mt-3">
            <input
              type="password"
              aria-label="Enter encryption password"
              placeholder="Enter encryption password"
              value={backupPassword}
              onChange={(e) => setBackupPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border-2 border-emerald-200 bg-emerald-50/50 text-sm font-medium outline-none focus:border-emerald-400 transition-colors"
            />
            <p className="mt-1.5 text-[10px] text-slate-400">
              Keep this password safe; it cannot be recovered if lost.
            </p>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={handleBackup}
        disabled={
          isBackingUp || selectedBackupSections.length === 0 || (encryptBackup && !backupPassword)
        }
        className="w-full btn-primary py-4 flex items-center justify-center gap-2 group disabled:opacity-50 mt-auto"
      >
        {isBackingUp ? (
          <Loader2 className="animate-spin" size={20} />
        ) : (
          <Download size={20} className="group-hover:-translate-y-1 transition-transform" />
        )}
        <span className="font-bold">
          {encryptBackup ? "Generate & Download Encrypted Backup" : "Generate & Download JSON"}
        </span>
      </button>
    </div>
  );
}

function RestoreConfigPanel({
  uploadedBackup,
  setUploadedBackup,
  selectedRestoreSections,
  setSelectedRestoreSections,
  toggleRestoreSection,
  restorePassword,
  setRestorePassword,
  handleRestore,
  isRestoring,
  showRestoreConfirm,
  setShowRestoreConfirm,
  confirmRestore,
}: {
  uploadedBackup: BackupData;
  setUploadedBackup: (v: BackupData | null) => void;
  selectedRestoreSections: string[];
  setSelectedRestoreSections: (v: string[] | ((prev: string[]) => string[])) => void;
  toggleRestoreSection: (id: string) => void;
  restorePassword: string;
  setRestorePassword: (v: string) => void;
  handleRestore: () => Promise<void>;
  isRestoring: boolean;
  showRestoreConfirm: boolean;
  setShowRestoreConfirm: (v: boolean) => void;
  confirmRestore: () => Promise<void>;
}) {
  return (
    <div className="p-8 flex-1 flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <button
          type="button"
          onClick={() => {
            setUploadedBackup(null);
            setSelectedRestoreSections([]);
          }}
          className="p-2 -ml-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex items-center gap-3">
          <div
            className={`size-8 rounded-lg flex items-center justify-center ${uploadedBackup.encrypted ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"}`}
          >
            {uploadedBackup.encrypted ? <Lock size={16} /> : <FileJson size={16} />}
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-800 uppercase tracking-tighter">
              {uploadedBackup.encrypted ? "Encrypted File" : "File Loaded"}
            </p>
            <p className="text-[9px] text-slate-400 font-medium leading-none">
              {uploadedBackup.timestamp
                ? new Date(uploadedBackup.timestamp).toLocaleDateString()
                : "Password required"}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1">
        <h2 className="text-xl font-bold text-slate-800 mb-2">Configure Restore</h2>
        <p className="text-xs text-slate-500 mb-6">
          {uploadedBackup.encrypted
            ? "Enter the password used during backup to decrypt and restore all data."
            : "Select which datasets to recover from the file."}
        </p>

        {uploadedBackup.encrypted ? (
          <div className="mb-8">
            <div className="p-6 bg-amber-50 border border-amber-100 rounded-2xl mb-4">
              <div className="flex items-start gap-3">
                <Lock size={18} className="text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-bold text-amber-900 mb-1">Encrypted Backup Detected</p>
                  <p className="text-[11px] text-amber-700 leading-relaxed">
                    This backup file is encrypted with AES-256. All data will be restored: section
                    selection happens automatically after decryption on the server.
                  </p>
                </div>
              </div>
            </div>
            <input
              type="password"
              aria-label="Enter decryption password"
              placeholder="Enter decryption password"
              value={restorePassword}
              onChange={(e) => setRestorePassword(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border-2 border-amber-200 bg-amber-50/50 text-sm font-medium outline-none focus:border-amber-400 transition-colors"
            />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 mb-8">
            {DATA_SECTIONS.map((section) => {
              const isAvailable = section.tables.some((table) => {
                const records = uploadedBackup.data?.[table];
                return !!records && records.length > 0;
              });

              return (
                <button
                  type="button"
                  key={section.id}
                  disabled={!isAvailable}
                  onClick={() => toggleRestoreSection(section.id)}
                  className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all text-left group ${
                    !isAvailable
                      ? "border-slate-50 bg-slate-50 opacity-50 cursor-not-allowed"
                      : selectedRestoreSections.includes(section.id)
                        ? "border-rose-500 bg-rose-50/50 text-rose-700"
                        : "border-slate-100 hover:border-slate-200 text-slate-500"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`${!isAvailable ? "text-slate-300" : selectedRestoreSections.includes(section.id) ? "text-rose-500" : "text-slate-400"}`}
                    >
                      {section.icon}
                    </div>
                    <span className="text-[11px] font-bold truncate">{section.label}</span>
                  </div>
                  {!isAvailable && (
                    <span className="text-[7px] font-black bg-slate-200 text-slate-500 px-1 py-0.5 rounded uppercase">
                      Empty
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={handleRestore}
        disabled={
          isRestoring ||
          (uploadedBackup.encrypted ? !restorePassword : selectedRestoreSections.length === 0)
        }
        className="w-full bg-rose-600 hover:bg-rose-700 text-white py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-rose-200 transition-all disabled:opacity-50 mt-auto"
      >
        {isRestoring ? <Loader2 className="animate-spin" size={20} /> : <RefreshCw size={20} />}
        <span className="font-bold">
          {uploadedBackup.encrypted ? "Decrypt & Restore All Data" : "Restore Selected Data"}
        </span>
      </button>

      <ConfirmDialog
        open={showRestoreConfirm}
        title="Confirm Restore"
        message="WARNING: Restoring will OVERWRITE the selected data sections. This action cannot be undone. Are you sure you want to proceed?"
        confirmLabel="Restore"
        variant="danger"
        onConfirm={confirmRestore}
        onCancel={() => setShowRestoreConfirm(false)}
      />
    </div>
  );
}
