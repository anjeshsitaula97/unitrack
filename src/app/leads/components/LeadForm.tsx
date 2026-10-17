"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  User,
  UserCheck,
  Info,
  ClipboardList,
  Calendar,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/fetch-client";
import { COUNTRIES } from "@/lib/data/countries";

const statusConfig: Record<string, { label: string }> = {
  New: { label: "New Lead" },
  Contacted: { label: "Contacted" },
  Qualified: { label: "Qualified" },
  Converted: { label: "Converted" },
  Lost: { label: "Lost" },
};

interface LeadFormProps {
  leadId?: string;
}

interface LeadFormData {
  id?: string;
  name: string;
  email: string;
  phone: string;
  source: string;
  status: string;
  notes: string;
  uploadedBy: string;
  uploaderNotes: string;
  counselor: string;
  counselorNotes: string;
  assignedDate: string;
  nextFollowUp: string;
  interestedCountry: string;
  maritalStatus: string;
  childrenCount: number;
  referenceName: string;
}

interface LeadApiResponse extends Partial<LeadFormData> {
  error?: string;
}

interface LeadUser {
  name?: string;
  role?: string;
}

type FieldUpdate = (field: string, value: string | number) => void;

const inputClass =
  "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition text-sm font-medium";
const labelClass = "block text-[11px] font-bold text-slate-500 uppercase mb-1.5";

function BasicInfoSection({ formData, update }: { formData: LeadFormData; update: FieldUpdate }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
        <User size={16} className="text-indigo-500" />
        <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          Basic Information
        </h4>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="lead-name" className={labelClass}>
            Full Name *
          </label>
          <input
            id="lead-name"
            type="text"
            required
            value={formData.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="e.g. David Smith"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="lead-email" className={labelClass}>
            Email Address *
          </label>
          <input
            id="lead-email"
            type="email"
            required
            value={formData.email}
            onChange={(e) => update("email", e.target.value)}
            placeholder="david@example.com"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="lead-phone" className={labelClass}>
            Phone
          </label>
          <input
            id="lead-phone"
            type="text"
            value={formData.phone}
            onChange={(e) => update("phone", e.target.value)}
            placeholder="+1 234..."
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="lead-status" className={labelClass}>
            Lead Status
          </label>
          <select
            id="lead-status"
            value={formData.status}
            onChange={(e) => update("status", e.target.value)}
            className={inputClass}
          >
            {Object.keys(statusConfig).map((s) => (
              <option key={s} value={s}>
                {statusConfig[s].label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label
          htmlFor="lead-followup"
          className={`${labelClass} text-indigo-600 flex items-center gap-1`}
        >
          <Calendar size={12} /> Next Follow-up Reminder
        </label>
        <input
          id="lead-followup"
          type="date"
          value={formData.nextFollowUp}
          onChange={(e) => update("nextFollowUp", e.target.value)}
          className={`w-full px-4 py-2.5 bg-indigo-50/30 border border-indigo-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition text-sm ${
            formData.nextFollowUp ? "font-bold text-indigo-700" : "font-medium text-gray-400"
          }`}
        />
      </div>
    </div>
  );
}

function PreferencesSection({ formData, update }: { formData: LeadFormData; update: FieldUpdate }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
        <Info size={16} className="text-indigo-500" />
        <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          Preferences &amp; Status
        </h4>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="lead-country" className={labelClass}>
            Interested Country
          </label>
          <select
            id="lead-country"
            value={formData.interestedCountry}
            onChange={(e) => update("interestedCountry", e.target.value)}
            className={inputClass}
          >
            <option value="">Select a country</option>
            {COUNTRIES.map((country) => (
              <option key={country.name} value={country.name}>
                {country.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="lead-marital" className={labelClass}>
            Marital Status
          </label>
          <select
            id="lead-marital"
            value={formData.maritalStatus}
            onChange={(e) => update("maritalStatus", e.target.value)}
            className={inputClass}
          >
            <option value="Single">Single</option>
            <option value="Dependent">Dependent</option>
          </select>
        </div>
        {formData.maritalStatus === "Dependent" && (
          <div>
            <label htmlFor="lead-children" className={labelClass}>
              No. of Children
            </label>
            <input
              id="lead-children"
              type="number"
              min="0"
              value={formData.childrenCount}
              onChange={(e) => update("childrenCount", parseInt(e.target.value) || 0)}
              className={inputClass}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function CounselorSection({ formData, update }: { formData: LeadFormData; update: FieldUpdate }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
        <UserCheck size={16} className="text-indigo-500" />
        <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          Counselor Assignment
        </h4>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="lead-counselor" className={labelClass}>
            Assigned Counselor
          </label>
          <input
            id="lead-counselor"
            type="text"
            value={formData.counselor}
            onChange={(e) => update("counselor", e.target.value)}
            placeholder="Search for counselor..."
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="lead-assigned-date" className={labelClass}>
            Date Assigned
          </label>
          <input
            id="lead-assigned-date"
            type="date"
            value={formData.assignedDate}
            onChange={(e) => update("assignedDate", e.target.value)}
            className={`w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition text-sm font-medium ${
              formData.assignedDate ? "" : "text-gray-400"
            }`}
          />
        </div>
      </div>
      <div>
        <label htmlFor="lead-counselor-notes" className={labelClass}>
          Counselor Remarks
        </label>
        <textarea
          id="lead-counselor-notes"
          value={formData.counselorNotes}
          onChange={(e) => update("counselorNotes", e.target.value)}
          placeholder="Counselor's feedback and follow-up notes..."
          rows={2}
          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition text-sm resize-none font-medium"
        />
      </div>
    </div>
  );
}

function OriginSection({
  formData,
  update,
  isAdmin,
}: {
  formData: LeadFormData;
  update: FieldUpdate;
  isAdmin: boolean;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
        <ClipboardList size={16} className="text-slate-400" />
        <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          Origin Details
        </h4>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="lead-uploaded-by" className={labelClass}>
            Uploaded By
          </label>
          <input
            id="lead-uploaded-by"
            type="text"
            value={formData.uploadedBy}
            readOnly={!isAdmin}
            onChange={(e) => isAdmin && update("uploadedBy", e.target.value)}
            className={`w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl outline-none text-sm font-medium ${isAdmin ? "focus:ring-2 focus:ring-indigo-500" : "cursor-not-allowed text-slate-400"}`}
          />
        </div>
        <div>
          <label htmlFor="lead-source" className={labelClass}>
            Source
          </label>
          <select
            id="lead-source"
            value={formData.source}
            onChange={(e) => update("source", e.target.value)}
            className={inputClass}
          >
            <option value="Website">Website</option>
            <option value="Tiktok">Tiktok</option>
            <option value="Facebook">Facebook</option>
            <option value="Whatsapp">Whatsapp</option>
            <option value="Email">Email</option>
            <option value="Promotions">Promotions</option>
            <option value="Instagram">Instagram</option>
            <option value="Reference">Reference</option>
          </select>
        </div>
      </div>
      {formData.source === "Reference" && (
        <div>
          <label htmlFor="lead-reference-name" className={labelClass}>
            Reference Name
          </label>
          <input
            id="lead-reference-name"
            type="text"
            value={formData.referenceName}
            onChange={(e) => update("referenceName", e.target.value)}
            placeholder="Who referred this lead?"
            className={inputClass}
          />
        </div>
      )}
      <div>
        <label htmlFor="lead-uploader-notes" className={labelClass}>
          Uploader Notes
        </label>
        <textarea
          id="lead-uploader-notes"
          value={formData.uploaderNotes}
          onChange={(e) => update("uploaderNotes", e.target.value)}
          placeholder="Notes from the uploader..."
          rows={2}
          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition text-sm resize-none font-medium"
        />
      </div>
    </div>
  );
}

export default function LeadForm({ leadId }: LeadFormProps) {
  const router = useRouter();
  const isEdit = !!leadId;
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState<LeadUser | null>(null);
  const [_allUsers, setAllUsers] = useState<unknown[]>([]);

  const [formData, setFormData] = useState<LeadFormData>({
    name: "",
    email: "",
    phone: "",
    source: "Website",
    status: "New",
    notes: "",
    uploadedBy: "",
    uploaderNotes: "",
    counselor: "",
    counselorNotes: "",
    assignedDate: "",
    nextFollowUp: "",
    interestedCountry: "",
    maritalStatus: "Single",
    childrenCount: 0,
    referenceName: "",
  });

  useEffect(() => {
    let active = true;
    const init = async () => {
      const [userData, usersData] = await Promise.all([
        api.get<LeadUser>("/api/auth/me", { showError: false }).catch(() => null),
        api.get<unknown[]>("/api/users", { showError: false }).catch(() => null),
      ]);
      if (active && userData) {
        setCurrentUser(userData);
        if (!isEdit) setFormData((prev) => ({ ...prev, uploadedBy: userData.name ?? "" }));
      }
      if (active && usersData) setAllUsers(Array.isArray(usersData) ? usersData : []);

      if (isEdit && leadId) {
        const lead = await api
          .get<LeadApiResponse>(`/api/leads/${leadId}`, { showError: false })
          .catch(() => {
            if (active) toast.error("Failed to load lead");
            return null;
          });
        if (active) {
          if (lead && !lead.error) {
            setFormData((prev) => ({
              ...prev,
              name: lead.name ?? "",
              email: lead.email ?? "",
              phone: lead.phone ?? "",
              source: lead.source ?? "Website",
              status: lead.status ?? "New",
              notes: lead.notes ?? "",
              uploadedBy: lead.uploadedBy ?? "",
              uploaderNotes: lead.uploaderNotes ?? "",
              counselor: lead.counselor ?? "",
              counselorNotes: lead.counselorNotes ?? "",
              assignedDate: lead.assignedDate
                ? new Date(lead.assignedDate).toISOString().split("T")[0]
                : "",
              nextFollowUp: lead.nextFollowUp
                ? new Date(lead.nextFollowUp).toISOString().split("T")[0]
                : "",
              interestedCountry: lead.interestedCountry ?? "",
              maritalStatus: lead.maritalStatus ?? "Single",
              childrenCount: lead.childrenCount ?? 0,
              referenceName: lead.referenceName ?? "",
            }));
          }
        }
      }
      if (active) setLoading(false);
    };
    init();
    return () => {
      active = false;
    };
  }, [leadId, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      const url = isEdit ? `/api/leads/${leadId}` : "/api/leads";
      try {
        if (isEdit) {
          await api.put(url, formData, { showError: false });
        } else {
          await api.post(url, formData, { showError: false });
        }
        if (formData.status === "Converted" && !isEdit) {
          toast.success("Lead converted and migrated to Students tab!");
        } else {
          toast.success(isEdit ? "Lead updated" : "Lead added successfully");
        }
        router.push("/leads");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Operation failed");
      }
    } catch {
      toast.error("Error connecting to server");
    } finally {
      setSubmitting(false);
    }
  };

  const update = (field: string, value: string | number) =>
    setFormData((prev) => ({ ...prev, [field]: value }));
  const isAdmin = ["Admin", "Super Admin"].includes(currentUser?.role ?? "");

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-indigo-500" size={32} />
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-4">
        <button
          type="button"
          aria-label="Go back"
          title="Go back"
          onClick={() => router.back()}
          className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 hover:text-slate-600"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{isEdit ? "Edit Lead" : "New Lead"}</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {isEdit ? "Update lead information" : "Add a new lead to the pipeline"}
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-8"
      >
        <BasicInfoSection formData={formData} update={update} />
        <PreferencesSection formData={formData} update={update} />
        <CounselorSection formData={formData} update={update} />
        <OriginSection formData={formData} update={update} isAdmin={isAdmin} />
      </form>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-indigo-100"
        >
          {submitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
          {submitting ? "Saving..." : isEdit ? "Update Lead" : "Add Lead"}
        </button>
      </div>
    </div>
  );
}
