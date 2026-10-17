"use client";

import React, { useState, useEffect, useRef, useCallback, Suspense } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  GitBranch,
  Plus,
  Search,
  Loader2,
  X,
  Trash2,
  ChevronRight,
  Globe,
  FileText,
  ChevronLeft,
  Edit2,
} from "lucide-react";
import { toast } from "sonner";
import { COUNTRIES } from "@/lib/data/countries";
import VisaWorkflowDashboard from "./VisaWorkflowDashboard";

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: string | null;
  assignee: string | null;
  country: string | null;
  visaType: string | null;
}

interface WorkflowCountry {
  id: string;
  name: string;
  code: string | null;
}

interface VisaType {
  id: string;
  label: string;
  description: string | null;
}

type ViewMode = "countries" | "visas" | "workflow";

const Breadcrumbs = ({
  view,
  selectedCountry,
  selectedVisa,
  onBackToCountries,
  onBackToVisas,
}: {
  view: ViewMode;
  selectedCountry: string | null;
  selectedVisa: string | null;
  onBackToCountries: () => void;
  onBackToVisas: () => void;
}) => (
  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">
    <button
      type="button"
      onClick={onBackToCountries}
      className={`hover:text-indigo-600 transition-colors ${view === "countries" ? "text-indigo-600" : ""}`}
    >
      Countries
    </button>
    {selectedCountry && (
      <>
        <ChevronRight size={14} />
        <button
          type="button"
          onClick={onBackToVisas}
          className={`hover:text-indigo-600 transition-colors ${view === "visas" ? "text-indigo-600" : ""}`}
        >
          {selectedCountry}
        </button>
      </>
    )}
    {selectedVisa && (
      <>
        <ChevronRight size={14} />
        <span className="text-indigo-600">{selectedVisa} Workflow</span>
      </>
    )}
  </div>
);

function WorkflowHeader({
  view,
  selectedCountry,
  selectedVisa,
  countriesCount,
  tasksCount,
  onAddCountry,
  onBackToCountries,
  onAddVisaType,
}: {
  view: ViewMode;
  selectedCountry: string | null;
  selectedVisa: string | null;
  countriesCount: number;
  tasksCount: number;
  onAddCountry: () => void;
  onBackToCountries: () => void;
  onAddVisaType: () => void;
}) {
  const subtitle =
    view === "countries"
      ? `${countriesCount.toLocaleString()} countries enabled for workflow.`
      : view === "visas"
        ? `Select a visa type for ${selectedCountry}.`
        : `${tasksCount.toLocaleString()} tasks matching your current filters for ${selectedCountry} ${selectedVisa}.`;

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <GitBranch className="text-indigo-600" />
          Country Workflow
        </h1>
        <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
      </div>

      <div className="flex items-center gap-3">
        {view === "countries" && (
          <button
            type="button"
            onClick={onAddCountry}
            className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition flex items-center gap-2 shadow-lg shadow-indigo-100"
          >
            <Plus size={18} />
            Add Country
          </button>
        )}
        {view === "visas" && (
          <>
            <button
              type="button"
              onClick={onBackToCountries}
              className="bg-slate-100 text-slate-600 px-6 py-2.5 rounded-xl font-bold hover:bg-slate-200 transition flex items-center gap-2"
            >
              <ChevronLeft size={18} />
              Back to Countries
            </button>
            <button
              type="button"
              onClick={onAddVisaType}
              className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition flex items-center gap-2 shadow-lg shadow-indigo-100"
            >
              <Plus size={18} />
              New Visa Type
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function CountryCard({
  country,
  onSelect,
}: {
  country: WorkflowCountry;
  onSelect: (name: string) => void;
}) {
  return (
    <button
      type="button"
      key={country.id}
      onClick={() => onSelect(country.name)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(country.name);
        }
      }}
      className="bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-12px_rgba(79,70,229,0.15)] hover:border-indigo-100 transition group text-center flex flex-col items-center relative cursor-pointer outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-400/20 via-violet-300/10 to-transparent pointer-events-none rounded-2xl" />
      <div className="absolute -top-12 -right-12 size-24 bg-indigo-50/50 rounded-full blur-3xl group-hover:bg-indigo-100/50 transition-colors" />

      <div className="w-20 h-14 rounded-xl overflow-hidden mb-4 shadow-md border-2 border-white group-hover:scale-110 transition duration-500 ring-1 ring-slate-100 relative">
        {country.code ? (
          <Image
            src={`https://flagcdn.com/w160/${country.code.toLowerCase()}.png`}
            alt={country.name}
            fill
            className="object-contain"
            unoptimized
            sizes="80px"
          />
        ) : (
          <Globe size={32} className="m-auto mt-3 text-slate-200" />
        )}
      </div>

      <h3 className="text-base font-bold text-slate-800 uppercase tracking-tight group-hover:text-indigo-600 transition-colors mb-1.5">
        {country.name}
      </h3>
      <div className="flex items-center gap-1.5 mb-3">
        <div className="size-1.5 rounded-full bg-green-500 animate-pulse" />
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Active
        </span>
      </div>

      <div className="w-full h-px bg-slate-50 mb-3" />

      <div className="flex items-center justify-center gap-2 text-indigo-600 font-bold text-[10px] uppercase tracking-[0.2em] group-hover:gap-4 transition">
        Configure Workflow <ChevronRight size={14} />
      </div>
    </button>
  );
}

function CountriesView({
  countries,
  onAddCountry,
  onSelectCountry,
}: {
  countries: WorkflowCountry[];
  onAddCountry: () => void;
  onSelectCountry: (name: string) => void;
}) {
  if (countries.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
        <div className="col-span-full py-24 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100 shadow-inner">
          <div className="size-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Globe size={48} className="text-slate-200" />
          </div>
          <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-2">
            Global Network Empty
          </h3>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest max-w-xs mx-auto leading-relaxed">
            No countries enabled for workflow automation yet.
          </p>
          <button
            type="button"
            onClick={onAddCountry}
            className="mt-8 px-8 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-indigo-700 transition shadow-lg shadow-indigo-100"
          >
            Enable Your First Country
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
      {countries.map((country) => (
        <CountryCard key={country.id} country={country} onSelect={onSelectCountry} />
      ))}
    </div>
  );
}

function VisaTypeCard({
  type,
  onSelect,
  onEdit,
  onDelete,
}: {
  type: VisaType;
  onSelect: (type: VisaType) => void;
  onEdit: (type: VisaType) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="relative group">
      <button
        type="button"
        tabIndex={0}
        onClick={() => onSelect(type)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelect(type);
          }
        }}
        className="w-full bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-12px_rgba(79,70,229,0.15)] hover:border-indigo-100 transition group text-center flex flex-col items-center relative cursor-pointer outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-rose-400/20 via-pink-300/10 to-transparent pointer-events-none rounded-2xl" />
        <div className="absolute -top-12 -right-12 size-24 bg-rose-50/50 rounded-full blur-3xl group-hover:bg-rose-100/50 transition-colors" />

        <div className="w-20 h-14 rounded-xl overflow-hidden mb-4 shadow-md border-2 border-white group-hover:scale-110 transition duration-500 ring-1 ring-slate-100 relative flex items-center justify-center bg-slate-50">
          <FileText size={28} className="text-rose-500" />
        </div>

        <h3 className="text-base font-bold text-slate-800 uppercase tracking-tight group-hover:text-rose-600 transition-colors mb-1.5">
          {type.label}
        </h3>
        <div className="flex items-center gap-1.5 mb-3">
          <div className="size-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Active
          </span>
        </div>

        <div className="w-full h-px bg-slate-50 mb-3" />

        <div className="flex items-center justify-center gap-2 text-indigo-600 font-bold text-[10px] uppercase tracking-[0.2em] group-hover:gap-4 transition">
          Launch Visa Workflow <ChevronRight size={14} />
        </div>
      </button>

      {/* Edit/Delete buttons – siblings so they aren't nested in the card button */}
      <div className="absolute top-3 right-3 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition">
        <button
          type="button"
          aria-label={`Edit ${type.label}`}
          onClick={() => onEdit(type)}
          className="p-2 bg-white/80 backdrop-blur-sm text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-white transition-colors cursor-pointer inline-flex items-center justify-center shadow-sm"
        >
          <Edit2 size={13} />
        </button>
        <button
          type="button"
          aria-label={`Delete ${type.label}`}
          onClick={() => onDelete(type.id)}
          className="p-2 bg-white/80 backdrop-blur-sm text-slate-400 hover:text-red-600 rounded-lg hover:bg-white transition-colors cursor-pointer inline-flex items-center justify-center shadow-sm"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}

function VisaTypesView({
  selectedCountry,
  visaTypes,
  onAddCategory,
  onSelectVisa,
  onEditVisa,
  onDeleteVisa,
}: {
  selectedCountry: string;
  visaTypes: VisaType[];
  onAddCategory: () => void;
  onSelectVisa: (type: VisaType) => void;
  onEditVisa: (type: VisaType) => void;
  onDeleteVisa: (id: string) => void;
}) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Select Visa Category</h2>
          <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
            <Globe size={14} className="text-indigo-400" /> {selectedCountry} Workflow Management
          </p>
        </div>
        <button
          type="button"
          onClick={onAddCategory}
          className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition flex items-center gap-2 shadow-lg shadow-indigo-100"
        >
          <Plus size={18} /> New Category
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {visaTypes.length === 0 ? (
          <div className="col-span-full py-24 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100 shadow-inner">
            <FileText size={48} className="mx-auto mb-4 text-slate-200" />
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
              No visa types defined for {selectedCountry}.
            </p>
          </div>
        ) : (
          visaTypes.map((type) => (
            <VisaTypeCard
              key={type.id}
              type={type}
              onSelect={onSelectVisa}
              onEdit={onEditVisa}
              onDelete={onDeleteVisa}
            />
          ))
        )}
      </div>
    </div>
  );
}

function ModalHeader({
  title,
  subtitle,
  onClose,
}: {
  title: string;
  subtitle: string;
  onClose: () => void;
}) {
  return (
    <div className="p-8 border-b border-slate-100 bg-indigo-50/30">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-black text-slate-800">{title}</h2>
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="p-2 text-slate-400 hover:bg-white rounded-xl transition shadow-sm"
        >
          <X size={20} />
        </button>
      </div>
      <p className="text-sm text-slate-500 font-medium">{subtitle}</p>
    </div>
  );
}

async function saveVisaType(
  form: { label: string; description: string },
  editingId: string | null,
  onSuccess: () => void
) {
  if (editingId) {
    const res = await fetch("/api/visa-types", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: editingId, ...form }),
    });
    if (res.ok) {
      toast.success("Visa type updated");
      onSuccess();
    } else {
      toast.error("Failed to update visa type");
    }
    return;
  }
  const res = await fetch("/api/visa-types", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(form),
  });
  if (res.ok) {
    toast.success("Visa type added");
    onSuccess();
  } else {
    const err = await res.json();
    toast.error(err.error || "Failed to add visa type");
  }
}

function AddCountryModal({
  isOpen,
  onClose,
  searchQuery,
  onSearchChange,
  existingNames,
  onAdd,
}: {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  existingNames: string[];
  onAdd: (name: string) => void;
}) {
  if (!isOpen) return null;

  const available = COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) && !existingNames.includes(c.name)
  );

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close add country dialog"
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg animate-slide-up overflow-hidden border border-white/20">
        <ModalHeader
          title="Add Workflow Country"
          subtitle="Enable operations for a new destination."
          onClose={onClose}
        />

        <div className="p-8 space-y-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              aria-label="Find country to add"
              placeholder="Find country to add..."
              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none text-sm font-black transition"
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>

          <div className="max-h-60 overflow-y-auto space-y-1 pr-2 custom-scrollbar">
            {available.map((c) => (
              <button
                type="button"
                key={c.code}
                onClick={() => onAdd(c.name)}
                className="w-full flex items-center justify-between p-3 hover:bg-indigo-50 rounded-2xl transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-7 rounded bg-slate-100 overflow-hidden border border-slate-200 shadow-sm flex-shrink-0 relative">
                    <Image
                      src={`https://flagcdn.com/w40/${c.code.toLowerCase()}.png`}
                      alt={c.name}
                      fill
                      className="object-cover"
                      unoptimized
                      sizes="40px"
                    />
                  </div>
                  <span className="font-bold text-slate-700 group-hover:text-indigo-600">
                    {c.name}
                  </span>
                </div>
                <Plus size={16} className="text-slate-300 group-hover:text-indigo-500" />
              </button>
            ))}
          </div>

          <div className="pt-4">
            <button
              type="button"
              onClick={onClose}
              className="w-full px-8 py-4 border border-slate-200 rounded-2xl font-black text-slate-500 hover:bg-slate-50 transition text-sm uppercase tracking-widest"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AddVisaTypeModal({
  isOpen,
  onClose,
  form,
  setForm,
  onSubmit,
  isSubmitting,
}: {
  isOpen: boolean;
  onClose: () => void;
  form: { label: string; description: string };
  setForm: React.Dispatch<React.SetStateAction<{ label: string; description: string }>>;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close add visa type dialog"
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md animate-slide-up overflow-hidden border border-white/20">
        <ModalHeader
          title="Add Visa Type"
          subtitle="Create a new visa type category."
          onClose={onClose}
        />

        <form onSubmit={onSubmit} className="p-8 space-y-6">
          <div>
            <label
              htmlFor="workflow-visaName"
              className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1"
            >
              Visa Name
            </label>
            <input
              id="workflow-visaName"
              type="text"
              required
              placeholder="e.g. Tourist Visa"
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
              className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none text-sm font-black transition"
            />
          </div>

          <div>
            <label
              htmlFor="workflow-description"
              className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1"
            >
              Description
            </label>
            <textarea
              id="workflow-description"
              rows={3}
              placeholder="Provide a brief description..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none text-sm resize-none font-medium leading-relaxed transition"
            />
          </div>

          <div className="pt-4 flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-8 py-4 border border-slate-200 rounded-2xl font-black text-slate-500 hover:bg-slate-50 transition text-sm uppercase tracking-widest"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-[2] px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-200 transition text-sm flex items-center justify-center gap-2 disabled:opacity-50 uppercase tracking-widest"
            >
              {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : "Save Visa Type"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function WorkflowContentInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlView = searchParams.get("view") as ViewMode | null;
  const urlCountry = searchParams.get("country");
  const urlVisa = searchParams.get("visa");

  const [view, setView] = useState<ViewMode>(urlView || "countries");
  const [selectedCountry, setSelectedCountry] = useState<string | null>(urlCountry || null);
  const [selectedVisa, setSelectedVisa] = useState<string | null>(urlVisa || null);
  const [searchQuery, setSearchQuery] = useState("");

  const syncUrl = useCallback(
    (v: string, country: string | null, visa: string | null) => {
      const params = new URLSearchParams();
      if (v !== "countries") params.set("view", v);
      if (country) params.set("country", country);
      if (visa) params.set("visa", visa);
      const qs = params.toString();
      router.replace(qs ? `/tasks?${qs}` : "/tasks", { scroll: false });
    },
    [router]
  );

  const setViewAndUrl = useCallback(
    (v: ViewMode) => {
      setView(v);
      if (v === "countries") {
        setSelectedCountry(null);
        setSelectedVisa(null);
        syncUrl(v, null, null);
      } else {
        syncUrl(v, selectedCountry, selectedVisa);
      }
    },
    [selectedCountry, selectedVisa, syncUrl]
  );

  const setCountryAndUrl = useCallback(
    (country: string | null) => {
      setSelectedCountry(country);
      setSelectedVisa(null);
      syncUrl(country ? "visas" : "countries", country, null);
      if (country) setView("visas");
      else setView("countries");
    },
    [syncUrl]
  );

  const setVisaAndUrl = useCallback(
    (visa: string | null) => {
      setSelectedVisa(visa);
      if (visa) {
        setView("workflow");
        syncUrl("workflow", selectedCountry, visa);
      } else {
        syncUrl("visas", selectedCountry, null);
      }
    },
    [selectedCountry, syncUrl]
  );

  const [workflowCountries, setWorkflowCountries] = useState<WorkflowCountry[] | undefined>(
    undefined
  );
  const [visaTypes, setVisaTypes] = useState<VisaType[] | undefined>(undefined);
  const [tasks, setTasks] = useState<Task[]>([]);
  const isLoading = useRef(true);
  const [showAddCountryModal, setShowAddCountryModal] = useState(false);
  const [showAddVisaModal, setShowAddVisaModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newVisaForm, setNewVisaForm] = useState({ label: "", description: "" });
  const editingVisaId = useRef<string | null>(null);

  const fetchWorkflowCountries = async () => {
    try {
      const res = await fetch("/api/learning-hub/countries");
      if (res.ok) setWorkflowCountries(await res.json());
    } catch (_err) {
      toast.error("Failed to load countries");
    } finally {
      isLoading.current = false;
    }
  };

  const fetchVisaTypes = async () => {
    try {
      const res = await fetch("/api/visa-types");
      if (res.ok) {
        const data = await res.json();
        setVisaTypes(data);
      }
    } catch (err) {
      console.error("Failed to load visa types:", err);
    }
  };

  const fetchWorkflowCountriesRef = useRef(fetchWorkflowCountries);
  const fetchVisaTypesRef = useRef(fetchVisaTypes);

  useEffect(() => {
    fetchWorkflowCountriesRef.current();
    fetchVisaTypesRef.current();
  }, []);

  const addVisaType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVisaForm.label) {
      toast.error("Visa label is required");
      return;
    }
    try {
      setIsSubmitting(true);
      await saveVisaType(newVisaForm, editingVisaId.current, () => {
        setShowAddVisaModal(false);
        editingVisaId.current = null;
        setNewVisaForm({ label: "", description: "" });
        fetchVisaTypes();
      });
    } catch (_err) {
      toast.error("Failed to save visa type");
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteVisaType = (id: string) => {
    if (!confirm("Are you sure you want to delete this visa type?")) return;
    (async () => {
      try {
        const res = await fetch(`/api/visa-types?id=${id}`, { method: "DELETE" });
        if (res.ok) {
          toast.success("Visa type deleted");
          fetchVisaTypes();
        } else {
          toast.error("Failed to delete visa type");
        }
      } catch (_err) {
        toast.error("Failed to delete visa type");
      }
    })();
  };

  const openEditVisaModal = (type: VisaType) => {
    setNewVisaForm({ label: type.label, description: type.description || "" });
    editingVisaId.current = type.id;
    setShowAddVisaModal(true);
  };

  const fetchTasks = useCallback(
    async (overrideCountry?: string, overrideVisa?: string) => {
      try {
        isLoading.current = true;
        const country = overrideCountry || selectedCountry;
        const visa = overrideVisa || selectedVisa;
        const res = await fetch(
          `/api/tasks?country=${encodeURIComponent(country!)}&visaType=${encodeURIComponent(visa!)}`
        );
        if (res.ok) setTasks(await res.json());
      } catch (_err) {
        toast.error("Failed to load tasks");
      } finally {
        isLoading.current = false;
      }
    },
    [selectedCountry, selectedVisa]
  );

  const addWorkflowCountry = async (countryName: string) => {
    const countryData = COUNTRIES.find((c) => c.name === countryName);
    try {
      setIsSubmitting(true);
      const res = await fetch("/api/learning-hub/countries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: countryName, code: countryData?.code }),
      });
      if (res.ok) {
        toast.success(`${countryName} added to workflow`);
        setShowAddCountryModal(false);
        fetchWorkflowCountries();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to add country");
      }
    } catch (_err) {
      toast.error("Failed to add country");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredWorkflowCountries = (workflowCountries ?? []).filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const existingCountryNames = (workflowCountries ?? []).map((wc) => wc.name);

  const handleSelectVisa = (type: VisaType) => {
    setVisaAndUrl(type.label);
    fetchTasks(selectedCountry!, type.label);
  };

  return (
    <div className="animate-fade-in space-y-6">
      <WorkflowHeader
        view={view}
        selectedCountry={selectedCountry}
        selectedVisa={selectedVisa}
        countriesCount={filteredWorkflowCountries.length}
        tasksCount={tasks.length}
        onAddCountry={() => setShowAddCountryModal(true)}
        onBackToCountries={() => setViewAndUrl("countries")}
        onAddVisaType={() => {
          setNewVisaForm({ label: "", description: "" });
          editingVisaId.current = null;
          setShowAddVisaModal(true);
        }}
      />

      <Breadcrumbs
        view={view}
        selectedCountry={selectedCountry}
        selectedVisa={selectedVisa}
        onBackToCountries={() => setViewAndUrl("countries")}
        onBackToVisas={() => setCountryAndUrl(selectedCountry)}
      />

      {/* Sequential View Content */}
      <div className="flex-1">
        {view === "countries" && (
          <CountriesView
            countries={filteredWorkflowCountries}
            onAddCountry={() => setShowAddCountryModal(true)}
            onSelectCountry={setCountryAndUrl}
          />
        )}

        {view === "visas" && (
          <VisaTypesView
            selectedCountry={selectedCountry!}
            visaTypes={visaTypes ?? []}
            onAddCategory={() => setShowAddVisaModal(true)}
            onSelectVisa={handleSelectVisa}
            onEditVisa={openEditVisaModal}
            onDeleteVisa={deleteVisaType}
          />
        )}

        {view === "workflow" && selectedVisa && (
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
            <VisaWorkflowDashboard country={selectedCountry!} visaType={selectedVisa} />
          </div>
        )}
      </div>

      {/* Add Country Modal */}
      <AddCountryModal
        isOpen={showAddCountryModal}
        onClose={() => setShowAddCountryModal(false)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        existingNames={existingCountryNames}
        onAdd={addWorkflowCountry}
      />

      {/* Add Visa Type Modal */}
      <AddVisaTypeModal
        isOpen={showAddVisaModal}
        onClose={() => setShowAddVisaModal(false)}
        form={newVisaForm}
        setForm={setNewVisaForm}
        onSubmit={addVisaType}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}

export default function WorkflowContent() {
  return (
    <Suspense fallback={null}>
      <WorkflowContentInner />
    </Suspense>
  );
}
