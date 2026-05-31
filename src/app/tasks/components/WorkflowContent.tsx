'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { 
  GitBranch, 
  Plus, 
  Search, 
  Loader2, 
  Calendar, 
  X,
  CheckCircle2,
  Clock,
  AlertCircle,
  MoreVertical,
  User,
  Trash2,
  ChevronRight,
  Layout,
  Globe,
  FileText,
  ChevronLeft,
  Filter,
  Edit2
} from 'lucide-react';
import { toast } from 'sonner';
import { COUNTRIES } from '@/lib/data/countries';
import VisaWorkflowDashboard from './VisaWorkflowDashboard';

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


const priorityColors: Record<string, string> = {
  'Low': 'text-slate-400',
  'Medium': 'text-blue-500',
  'High': 'text-amber-500',
  'Urgent': 'text-red-500',
};

const statuses = ['Todo', 'In Progress', 'Review', 'Done'];

const Breadcrumbs = ({
  view,
  selectedCountry,
  selectedVisa,
  setView,
  setSelectedCountry,
  setSelectedVisa,
}: {
  view: 'countries' | 'visas' | 'workflow';
  selectedCountry: string | null;
  selectedVisa: string | null;
  setView: (view: 'countries' | 'visas' | 'workflow') => void;
  setSelectedCountry: (country: string | null) => void;
  setSelectedVisa: (visa: string | null) => void;
}) => (
  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">
    <button type="button"
      onClick={() => { setView('countries'); setSelectedCountry(null); setSelectedVisa(null); }}
      className={`hover:text-indigo-600 transition-colors ${view === 'countries' ? 'text-indigo-600' : ''}`}
    >
      Countries
    </button>
    {selectedCountry && (
      <>
        <ChevronRight size={14} />
        <button type="button"
          onClick={() => { setView('visas'); setSelectedVisa(null); }}
          className={`hover:text-indigo-600 transition-colors ${view === 'visas' ? 'text-indigo-600' : ''}`}
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

export default function WorkflowContent() {
  const [view, setView] = useState<'countries' | 'visas' | 'workflow'>('countries');
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedVisa, setSelectedVisa] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [workflowCountries, setWorkflowCountries] = useState<WorkflowCountry[] | undefined>(undefined);
  const [visaTypes, setVisaTypes] = useState<VisaType[] | undefined>(undefined);
  const [tasks, setTasks] = useState<Task[]>([]);
  const isLoading = useRef(true);
  const showModal = useRef(false);
  const [showAddCountryModal, setShowAddCountryModal] = useState(false);
  const [showAddVisaModal, setShowAddVisaModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [newVisaForm, setNewVisaForm] = useState({ label: '', description: '' });
  const editingVisaId = useRef<string | null>(null);
  
  const formData = useRef({
    title: '',
    description: '',
    status: 'Todo',
    priority: 'Medium',
    dueDate: '',
    assignee: ''
  });

  useEffect(() => {
    fetchWorkflowCountries();
    fetchVisaTypes();
  }, []);

  const fetchWorkflowCountries = async () => {
    try {
      const res = await fetch('/api/learning-hub/countries');
      if (res.ok) setWorkflowCountries(await res.json());
    } catch (err) {
      toast.error('Failed to load countries');
    } finally {
      isLoading.current = false;
    }
  };

  const fetchVisaTypes = async () => {
    try {
      const res = await fetch('/api/visa-types');
      if (res.ok) {
        const data = await res.json();
        setVisaTypes(data);
      }
    } catch (err) {
      console.error('Failed to load visa types:', err);
    }
  };

  const addVisaType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVisaForm.label) {
      toast.error('Visa label is required');
      return;
    }
    try {
      setIsSubmitting(true);
      if (editingVisaId.current) {
        const res = await fetch('/api/visa-types', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingVisaId.current, ...newVisaForm })
        });
        if (res.ok) {
          toast.success('Visa type updated');
          setShowAddVisaModal(false);
          editingVisaId.current = null;
          setNewVisaForm({ label: '', description: '' });
          fetchVisaTypes();
        } else {
          toast.error('Failed to update visa type');
        }
      } else {
        const res = await fetch('/api/visa-types', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newVisaForm)
        });
        if (res.ok) {
          toast.success('Visa type added');
          setShowAddVisaModal(false);
          setNewVisaForm({ label: '', description: '' });
          fetchVisaTypes();
        } else {
          const err = await res.json();
          toast.error(err.error || 'Failed to add visa type');
        }
      }
    } catch (err) {
      toast.error('Failed to save visa type');
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteVisaType = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this visa type?')) return;
    try {
      const res = await fetch(`/api/visa-types?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Visa type deleted');
        fetchVisaTypes();
      } else {
        toast.error('Failed to delete visa type');
      }
    } catch (err) {
      toast.error('Failed to delete visa type');
    }
  };

  const openEditVisaModal = (e: React.MouseEvent, type: VisaType) => {
    e.stopPropagation();
    setNewVisaForm({ label: type.label, description: type.description || '' });
    editingVisaId.current = type.id;
    setShowAddVisaModal(true);
  };

  const fetchTasks = useCallback(async (overrideCountry?: string, overrideVisa?: string) => {
    try {
      isLoading.current = true;
      const country = overrideCountry || selectedCountry;
      const visa = overrideVisa || selectedVisa;
      const res = await fetch(`/api/tasks?country=${encodeURIComponent(country!)}&visaType=${encodeURIComponent(visa!)}`);
      if (res.ok) setTasks(await res.json());
    } catch (err) {
      toast.error('Failed to load tasks');
    } finally {
      isLoading.current = false;
    }
  }, [selectedCountry, selectedVisa]);

  const addWorkflowCountry = async (countryName: string) => {
    const countryData = COUNTRIES.find(c => c.name === countryName);
    try {
      setIsSubmitting(true);
      const res = await fetch('/api/learning-hub/countries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: countryName, code: countryData?.code })
      });
      if (res.ok) {
        toast.success(`${countryName} added to workflow`);
        setShowAddCountryModal(false);
        fetchWorkflowCountries();
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to add country');
      }
    } catch (err) {
      toast.error('Failed to add country');
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteWorkflowCountry = async (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    if (!confirm(`Are you sure you want to remove ${name} from workflow?`)) return;
    try {
      const res = await fetch(`/api/learning-hub/countries?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success(`${name} removed`);
        fetchWorkflowCountries();
      }
    } catch (err) {
      toast.error('Failed to remove country');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.current.title) {
      toast.error('Title is required');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData.current,
          country: selectedCountry,
          visaType: selectedVisa
        })
      });

      if (res.ok) {
        toast.success('Task created successfully');
        showModal.current = false;
        fetchTasks();
        formData.current = {
          title: '',
          description: '',
          status: 'Todo',
          priority: 'Medium',
          dueDate: '',
          assignee: ''
        };
      }
    } catch (err) {
      toast.error('Failed to create task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      });
      if (res.ok) {
        fetchTasks();
        toast.success(`Moved to ${status}`);
      }
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const deleteTask = async (id: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      const res = await fetch(`/api/tasks?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchTasks();
        toast.success('Task deleted');
      }
    } catch (err) {
      toast.error('Failed to delete task');
    }
  };

  const filteredWorkflowCountries = (workflowCountries ?? []).filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <GitBranch className="text-indigo-600" />
            Country Workflow
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {view === 'countries' && `${filteredWorkflowCountries.length.toLocaleString()} countries enabled for workflow.`}
            {view === 'visas' && `Select a visa type for ${selectedCountry}.`}
            {view === 'workflow' && `${tasks.length.toLocaleString()} tasks matching your current filters for ${selectedCountry} ${selectedVisa}.`}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {view === 'countries' && (
            <button type="button" 
              onClick={() => setShowAddCountryModal(true)}
              className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-black hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-100"
            >
              <Plus size={18} />
              Add Country
            </button>
          )}
          {view === 'visas' && (
            <>
              <button type="button" 
                onClick={() => setView('countries')}
                className="bg-slate-100 text-slate-600 px-6 py-2.5 rounded-xl font-black hover:bg-slate-200 transition-all flex items-center gap-2"
              >
                <ChevronLeft size={18} />
                Back to Countries
              </button>
              <button type="button" 
                onClick={() => {
                  setNewVisaForm({ label: '', description: '' });
                  editingVisaId.current = null;
                  setShowAddVisaModal(true);
                }}
                className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-black hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-100"
              >
                <Plus size={18} />
                New Visa Type
              </button>
            </>
          )}

        </div>
      </div>

      <Breadcrumbs view={view} selectedCountry={selectedCountry} selectedVisa={selectedVisa} setView={setView} setSelectedCountry={setSelectedCountry} setSelectedVisa={setSelectedVisa} />

      {/* Sequential View Content */}
      <div className="flex-1">
        {view === 'countries' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
            {(workflowCountries?.length ?? 0) === 0 ? (
              <div className="col-span-full py-24 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100 shadow-inner">
                <div className="size-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Globe size={48} className="text-slate-200" />
                </div>
                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-2">Global Network Empty</h3>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest max-w-xs mx-auto leading-relaxed">No countries enabled for workflow automation yet.</p>
                <button type="button" 
                  onClick={() => setShowAddCountryModal(true)}
                  className="mt-8 px-8 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                >
                  Enable Your First Country
                </button>
              </div>
            ) : filteredWorkflowCountries.map(country => (
                <button type="button"
                  key={country.id}
                onClick={() => { 
                  setSelectedCountry(country.name); 
                  setSelectedVisa(null);
                  setView('visas');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedCountry(country.name); 
                    setSelectedVisa(null);
                    setView('visas');
                  }
                }}
                className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-12px_rgba(79,70,229,0.15)] hover:border-indigo-100 transition-all group text-center flex flex-col items-center relative overflow-hidden cursor-pointer outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                {/* Decorative background element */}
                <div className="absolute -top-12 -right-12 size-32 bg-indigo-50/50 rounded-full blur-3xl group-hover:bg-indigo-100/50 transition-colors" />
                
                <div className="w-24 h-16 rounded-[1.25rem] overflow-hidden mb-8 shadow-xl border-4 border-white group-hover:scale-110 transition-all duration-500 ring-1 ring-slate-100">
                  {country.code ? (
                    <Image src={`https://flagcdn.com/w160/${country.code.toLowerCase()}.png`} alt={country.name} fill className="object-cover" unoptimized sizes="96px" />
                  ) : <Globe size={40} className="m-auto mt-3 text-slate-200" />}
                </div>
                
                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight group-hover:text-indigo-600 transition-colors mb-2">{country.name}</h3>
                <div className="flex items-center gap-1.5 mb-6">
                   <div className="size-1.5 rounded-full bg-green-500 animate-pulse" />
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Pipeline</span>
                </div>

                <div className="w-full h-px bg-slate-50 mb-6" />

                <div className="flex items-center justify-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-[0.2em] group-hover:gap-4 transition-all">
                  Configure Workflow <ChevronRight size={14} />
                </div>
              </button>
            ))}
          </div>
        )}

        {view === 'visas' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-10">
               <div>
                  <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter mb-2">Select Visa Category</h2>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Globe size={14} className="text-indigo-400" /> {selectedCountry} Workflow Management
                  </p>
               </div>
               <button type="button" 
                  onClick={() => setShowAddVisaModal(true)}
                  className="bg-white border-2 border-slate-100 text-slate-800 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:border-indigo-600 hover:text-indigo-600 transition-all shadow-sm flex items-center gap-2"
               >
                  <Plus size={16} /> New Category
               </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {(visaTypes?.length ?? 0) === 0 ? (
                <div className="col-span-full py-24 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100 shadow-inner">
                  <FileText size={48} className="mx-auto mb-4 text-slate-200" />
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No visa types defined for {selectedCountry}.</p>
                </div>
              ) : (visaTypes ?? []).map(type => (
                <div
                  key={type.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    setSelectedVisa(type.label);
                    setView('workflow');
                    fetchTasks(selectedCountry!, type.label);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedVisa(type.label);
                      setView('workflow');
                      fetchTasks(selectedCountry!, type.label);
                    }
                  }}
                  className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:border-indigo-100 transition-all group text-left relative overflow-hidden flex flex-col h-full cursor-pointer outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  <div className="size-16 bg-slate-50 rounded-[1.5rem] flex items-center justify-center mb-8 text-white group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 shadow-inner">
                    <FileText size={32} />
                  </div>
                  
                  <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight mb-4 group-hover:text-indigo-600 transition-colors">{type.label}</h3>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed mb-10 line-clamp-3">{type.description || 'Define specific tasks, documents, and automation stages for this visa category.'}</p>
                  
                  <div className="mt-auto flex items-center justify-between">
                     <div className="flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-[0.2em]">
                        Launch Portal <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                     </div>
                     <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <button type="button" onClick={(e) => openEditVisaModal(e, type)} className="p-3 bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-xl transition-colors cursor-pointer inline-flex items-center justify-center">
                           <Edit2 size={16} />
                        </button>
                        <button type="button" onClick={(e) => deleteVisaType(e, type.id)} className="p-3 bg-slate-50 text-slate-400 hover:text-red-600 rounded-xl transition-colors cursor-pointer inline-flex items-center justify-center">
                           <Trash2 size={16} />
                        </button>
                     </div>
                  </div>

                  {/* Aesthetic progress indicator */}
                  <div className="absolute bottom-0 left-0 h-1 bg-indigo-600 w-0 group-hover:w-full transition-all duration-700" />
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'workflow' && selectedVisa && (
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
            <VisaWorkflowDashboard country={selectedCountry!} visaType={selectedVisa} />
          </div>
        )}
      </div>

      {/* Add Country Modal */}
      {showAddCountryModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <button type="button" className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setShowAddCountryModal(false)} />
          <div className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg animate-slide-up overflow-hidden border border-white/20">
            <div className="p-8 border-b border-slate-100 bg-indigo-50/30">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-black text-slate-800">Add Workflow Country</h2>
                <button type="button" onClick={() => setShowAddCountryModal(false)} className="p-2 text-slate-400 hover:bg-white rounded-xl transition-all shadow-sm">
                  <X size={20} />
                </button>
              </div>
              <p className="text-sm text-slate-500 font-medium">Enable operations for a new destination.</p>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text"
                  placeholder="Find country to add..."
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none text-sm font-black transition-all"
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="max-h-60 overflow-y-auto space-y-1 pr-2 custom-scrollbar">
                {(() => {
                  const result = [];
                  for (const c of COUNTRIES) {
                    if (c.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
                        !(workflowCountries ?? []).some(wc => wc.name === c.name)) {
                      result.push(
                        <button type="button"
                          key={c.code}
                          onClick={() => addWorkflowCountry(c.name)}
                          className="w-full flex items-center justify-between p-3 hover:bg-indigo-50 rounded-2xl transition-all group"
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
                            <span className="font-bold text-slate-700 group-hover:text-indigo-600">{c.name}</span>
                          </div>
                          <Plus size={16} className="text-slate-300 group-hover:text-indigo-500" />
                        </button>
                      );
                    }
                  }
                  return result;
                })()}
              </div>

              <div className="pt-4">
                <button type="button" 
                  onClick={() => setShowAddCountryModal(false)}
                  className="w-full px-8 py-4 border border-slate-200 rounded-2xl font-black text-slate-500 hover:bg-slate-50 transition-all text-sm uppercase tracking-widest"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}



      {/* Add Visa Type Modal */}
      {showAddVisaModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <button type="button" className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setShowAddVisaModal(false)} />
          <div className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md animate-slide-up overflow-hidden border border-white/20">
            <div className="p-8 border-b border-slate-100 bg-indigo-50/30">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-black text-slate-800">Add Visa Type</h2>
                <button type="button" onClick={() => setShowAddVisaModal(false)} className="p-2 text-slate-400 hover:bg-white rounded-xl transition-all shadow-sm">
                  <X size={20} />
                </button>
              </div>
              <p className="text-sm text-slate-500 font-medium">Create a new visa type category.</p>
            </div>
            
            <form onSubmit={addVisaType} className="p-8 space-y-6">
              <div>
                <label htmlFor="workflow-visaName" className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Visa Name</label>
                <input 
                  id="workflow-visaName"
                  type="text"
                  required
                  placeholder="e.g. Tourist Visa"
                  value={newVisaForm.label}
                  onChange={(e) => setNewVisaForm({...newVisaForm, label: e.target.value})}
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none text-sm font-black transition-all"
                />
              </div>

              <div>
                <label htmlFor="workflow-description" className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Description</label>
                <textarea 
                  id="workflow-description"
                  rows={3}
                  placeholder="Provide a brief description..."
                  value={newVisaForm.description}
                  onChange={(e) => setNewVisaForm({...newVisaForm, description: e.target.value})}
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none text-sm resize-none font-medium leading-relaxed transition-all"
                />
              </div>

              <div className="pt-4 flex gap-4">
                <button type="button" 
                  onClick={() => setShowAddVisaModal(false)}
                  className="flex-1 px-8 py-4 border border-slate-200 rounded-2xl font-black text-slate-500 hover:bg-slate-50 transition-all text-sm uppercase tracking-widest"
                >
                  Cancel
                </button>
                <button type="button" 
                  disabled={isSubmitting}
                  className="flex-[2] px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-200 transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50 uppercase tracking-widest"
                >
                  {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : 'Save Visa Type'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
