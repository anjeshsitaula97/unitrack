'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { 
  Search, 
  Loader2, 
  Download, 
  Folder, 
  ChevronRight, 
  X, 
  Mail, 
  Plus, 
  FileText,
  Trash2,
  Globe,
  PlusCircle,
  Settings,
  PlusSquare,
  Library,
  ArrowLeft,
  Check,
  Edit2
} from 'lucide-react';
import { toast } from 'sonner';

interface Country {
  id: string;
  name: string;
  code: string | null;
}

interface Category {
  id: string;
  name: string;
}

interface Resource {
  id: string;
  title: string;
  description: string | null;
  type: string;
  categoryId: string | null;
  countryId: string | null;
  category: Category | null;
  country: Country | null;
  url: string;
  thumbnail: string | null;
  fileSize: string | null;
  createdAt: string;
}

export default function LearningHubContent() {
  const [resources, setResources] = useState<Resource[] | undefined>(undefined);
  const [countries, setCountries] = useState<Country[] | undefined>(undefined);
  const [categories, setCategories] = useState<Category[] | undefined>(undefined);
  
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<'countries' | 'categories' | 'resources'>('countries');
  const [selectedCountryId, setSelectedCountryId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [showAddResourceModal, setShowAddResourceModal] = useState(false);
  const [showAddCountryModal, setShowAddCountryModal] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadType, setUploadType] = useState<'link' | 'upload'>('link');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const [resourceForm, setResourceForm] = useState({
    title: '',
    description: '',
    type: 'Document',
    categoryId: '',
    countryId: '',
    url: '',
    fileSize: ''
  });

  const [countryForm, setCountryForm] = useState({ name: '', code: '' });
  const [categoryForm, setCategoryForm] = useState({ name: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [resResources, resCountries, resCategories] = await Promise.all([
        fetch('/api/learning-resources'),
        fetch('/api/learning-hub/countries'),
        fetch('/api/learning-hub/categories')
      ]);

      const [dataResources, dataCountries, dataCategories] = await Promise.all([
        resResources.json(),
        resCountries.json(),
        resCategories.json()
      ]);

      setResources(dataResources);
      setCountries(dataCountries);
      setCategories(dataCategories);
    } catch (err) {
      toast.error('Failed to load hub data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddResource = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      
      let resourceData = { ...resourceForm };

      if (uploadType === 'upload' && selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (!uploadRes.ok) throw new Error('Upload failed');
        
        const uploadData = await uploadRes.json();
        resourceData.url = uploadData.url;
        resourceData.fileSize = uploadData.size;
      }

      if (!resourceData.url) {
        toast.error('Resource URL or File is required');
        return;
      }

      const res = await fetch('/api/learning-resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resourceData)
      });
      if (res.ok) {
        toast.success('Document published');
        setShowAddResourceModal(false);
        setResourceForm({
          title: '',
          description: '',
          type: 'Document',
          categoryId: '',
          countryId: '',
          url: '',
          fileSize: ''
        });
        setSelectedFile(null);
        setUploadType('link');
        fetchData();
      }
    } catch (err) {
      toast.error('Failed to add resource');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddCountry = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const res = await fetch('/api/learning-hub/countries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(countryForm)
      });
      if (res.ok) {
        toast.success('Country added');
        setShowAddCountryModal(false);
        fetchData();
        setCountryForm({ name: '', code: '' });
      }
    } catch (err) {
      toast.error('Failed to add country');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const res = await fetch('/api/learning-hub/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryForm)
      });
      if (res.ok) {
        toast.success('Category added');
        setShowAddCategoryModal(false);
        fetchData();
        setCategoryForm({ name: '' });
      }
    } catch (err) {
      toast.error('Failed to add category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteResource = async (id: string) => {
    if (!confirm('Delete this resource?')) return;
    try {
      const res = await fetch(`/api/learning-resources?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setResources(prev => prev.filter(r => r.id !== id));
        toast.success('Resource removed');
      }
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const res = await fetch('/api/learning-hub/categories', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingCategoryId, name: categoryForm.name })
      });
      if (res.ok) {
        toast.success('Category updated');
        setEditingCategoryId(null);
        fetchData();
        setCategoryForm({ name: '' });
      }
    } catch (err) {
      toast.error('Failed to update category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!confirm(`Delete category "${name}"? This will not delete the files but they will lose this category.`)) return;
    try {
      const res = await fetch(`/api/learning-hub/categories?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setCategories(prev => prev.filter(c => c.id !== id));
        if (selectedCategoryId === id) setSelectedCategoryId(null);
        toast.success('Category removed');
      }
    } catch (err) {
      toast.error('Failed to delete category');
    }
  };

  const handleUpdateResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingResource) return;
    try {
      setIsSubmitting(true);
      const res = await fetch('/api/learning-resources', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...resourceForm, id: editingResource.id })
      });
      if (res.ok) {
        toast.success('Document updated');
        setEditingResource(null);
        fetchData();
      }
    } catch (err) {
      toast.error('Failed to update document');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredResources = useMemo(() => {
    return (resources ?? []).filter(r => 
      r.countryId === selectedCountryId && 
      r.categoryId === selectedCategoryId &&
      (r.title.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [resources, selectedCountryId, selectedCategoryId, searchQuery]);

  return (
    <div className="flex flex-col h-full bg-slate-50 -m-8 animate-fade-in">
      {/* Top Header */}
      <div className="px-8 py-4 bg-white border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
          <span>Dashboard</span>
          <ChevronRight size={14} />
          <span className="text-slate-800 font-bold">Learning Hub</span>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" 
            onClick={() => setShowAddResourceModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#1e40af] text-white rounded-lg text-xs font-bold hover:bg-[#1d4ed8] transition-all shadow-md shadow-blue-100"
          >
            <Plus size={14} />
            Publish Document
          </button>
          <button type="button" className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-50 transition-all">
            <Mail size={14} />
            Email Updates
          </button>
        </div>
      </div>

      <div className="px-8 py-4 bg-slate-50 flex items-center justify-between">
         <div className="flex flex-col">
           <div className="flex items-center gap-2 mb-1">
             <h1 className="text-xl font-black text-[#1e293b]">Learning Hub</h1>
             {selectedCountryId && (
               <>
                 <ChevronRight size={16} className="text-slate-300" />
                 <button type="button" 
                  onClick={() => { setSelectedCountryId(null); setSelectedCategoryId(null); setView('countries'); }}
                  className="px-2 py-0.5 bg-blue-50 text-[#1e40af] text-[10px] font-black rounded uppercase hover:bg-blue-100 transition-all"
                 >
                   {(countries ?? []).find(c => c.id === selectedCountryId)?.name}
                 </button>
               </>
             )}
             {selectedCategoryId && (
               <>
                 <ChevronRight size={16} className="text-slate-300" />
                 <button type="button" 
                  onClick={() => { setSelectedCategoryId(null); setView('categories'); }}
                  className="px-2 py-0.5 bg-amber-50 text-amber-600 text-[10px] font-black rounded uppercase hover:bg-amber-100 transition-all"
                 >
                   {categories.find(c => c.id === selectedCategoryId)?.name}
                 </button>
               </>
             )}
           </div>
           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              {view === 'countries' && `${(countries?.length ?? 0)} countries available.`}
              {view === 'categories' && `Select a category for ${(countries ?? []).find(c => c.id === selectedCountryId)?.name}.`}
              {view === 'resources' && `${filteredResources.length} documents in ${(categories ?? []).find(c => c.id === selectedCategoryId)?.name}.`}
           </p>
         </div>
         <div className="flex gap-2">
            <button type="button" onClick={() => setShowAddCountryModal(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-black uppercase tracking-widest text-[#1e40af] hover:bg-blue-50 transition-all">
               <Globe size={12} /> Add Country
            </button>
            <button type="button" onClick={() => setShowAddCategoryModal(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-black uppercase tracking-widest text-amber-600 hover:bg-amber-50 transition-all">
               <Folder size={12} /> Add Category
            </button>
         </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden border-t border-slate-200 bg-white p-8">
        {view === 'countries' && <CountriesView countries={countries} setSelectedCountryId={setSelectedCountryId} setSelectedCategoryId={setSelectedCategoryId} setView={setView} />}

        {view === 'categories' && <CategoriesView setView={setView} selectedCountryId={selectedCountryId} countries={countries} categories={categories} setSelectedCategoryId={setSelectedCategoryId} setEditingCategoryId={setEditingCategoryId} setCategoryForm={setCategoryForm} handleDeleteCategory={handleDeleteCategory} />}

        {view === 'resources' && <ResourcesView setView={setView} selectedCategoryId={selectedCategoryId} categories={categories} searchQuery={searchQuery} setSearchQuery={setSearchQuery} setShowAddResourceModal={setShowAddResourceModal} isLoading={isLoading} filteredResources={filteredResources} setEditingResource={setEditingResource} setResourceForm={setResourceForm} deleteResource={deleteResource} />}
      </div>

      {/* Modals */}
      
      {/* Add Document Modal */}
      {showAddResourceModal && <AddResourceModal showAddResourceModal={showAddResourceModal} setShowAddResourceModal={setShowAddResourceModal} resourceForm={resourceForm} setResourceForm={setResourceForm} countries={countries} categories={categories} uploadType={uploadType} setUploadType={setUploadType} selectedFile={selectedFile} setSelectedFile={setSelectedFile} handleAddResource={handleAddResource} isSubmitting={isSubmitting} />}

      {/* Add Country Modal */}
      {showAddCountryModal && <AddCountryModal showAddCountryModal={showAddCountryModal} setShowAddCountryModal={setShowAddCountryModal} countryForm={countryForm} setCountryForm={setCountryForm} handleAddCountry={handleAddCountry} isSubmitting={isSubmitting} />}

      {/* Add Category Modal */}
      {showAddCategoryModal && <AddCategoryModal showAddCategoryModal={showAddCategoryModal} setShowAddCategoryModal={setShowAddCategoryModal} categoryForm={categoryForm} setCategoryForm={setCategoryForm} handleAddCategory={handleAddCategory} isSubmitting={isSubmitting} />}
      {/* Edit Category Modal */}
      {editingCategoryId && <EditCategoryModal editingCategoryId={editingCategoryId} setEditingCategoryId={setEditingCategoryId} categoryForm={categoryForm} setCategoryForm={setCategoryForm} handleUpdateCategory={handleUpdateCategory} isSubmitting={isSubmitting} />}

      {/* Edit Resource Modal */}
      {editingResource && <EditResourceModal editingResource={editingResource} setEditingResource={setEditingResource} resourceForm={resourceForm} setResourceForm={setResourceForm} countries={countries} categories={categories} handleUpdateResource={handleUpdateResource} isSubmitting={isSubmitting} />}
    </div>
  );
}

function CountriesView({ countries, setSelectedCountryId, setSelectedCategoryId, setView }: {
  countries: any[] | undefined;
  setSelectedCountryId: (id: string) => void;
  setSelectedCategoryId: (id: string | null) => void;
  setView: (v: 'countries' | 'categories' | 'resources') => void;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
      {(countries?.length ?? 0) === 0 ? (
        <div className="col-span-full py-24 text-center">
          <Globe size={48} className="mx-auto mb-4 text-slate-200" />
          <p className="text-sm font-bold text-slate-400">No countries added yet. Start by adding a country.</p>
        </div>
      ) : (countries ?? []).map(c => (
        <button type="button"
          key={c.id}
          onClick={() => { setSelectedCountryId(c.id); setSelectedCategoryId(null); setView('categories'); }}
          className="group flex flex-col items-center justify-center p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:border-blue-100 transition-all"
        >
          <div className="mb-4 transform group-hover:scale-110 transition-transform">
            {c.code ? (
              <div className="w-16 h-11 relative rounded-xl shadow-lg border-4 border-slate-50 overflow-hidden">
                <Image 
                  src={`https://flagcdn.com/w80/${c.code}.png`} 
                  alt={c.name} 
                  fill
                  className="object-cover"
                  unoptimized
                  sizes="64px"
                />
              </div>
            ) : <Globe size={48} className="text-slate-200" />}
          </div>
          <span className="text-lg font-black text-slate-800 text-center uppercase tracking-tight group-hover:text-[#1e40af] transition-colors">{c.name}</span>
          <div className="mt-4 px-4 py-1.5 bg-slate-50 rounded-full text-[9px] font-black text-white uppercase tracking-widest group-hover:bg-blue-50 group-hover:text-[#1e40af] transition-all">
            Open Library
          </div>
        </button>
      ))}
    </div>
  );
}

function CategoriesView({ setView, selectedCountryId, countries, categories, setSelectedCategoryId, setEditingCategoryId, setCategoryForm, handleDeleteCategory }: {
  setView: (v: 'countries' | 'categories' | 'resources') => void;
  selectedCountryId: string | null;
  countries: any[] | undefined;
  categories: any[] | undefined;
  setSelectedCategoryId: (id: string | null) => void;
  setEditingCategoryId: (id: string | null) => void;
  setCategoryForm: (v: any) => void;
  handleDeleteCategory: (id: string, name: string) => Promise<void>;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button type="button" onClick={() => setView('countries')} className="p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-400 hover:text-slate-600">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">Select a category for {(countries ?? []).find(c => c.id === selectedCountryId)?.name}</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {(categories?.length ?? 0) === 0 ? (
          <div className="col-span-full py-20 text-center text-slate-400 italic bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
            No categories added yet.
          </div>
        ) : (categories ?? []).map(cat => (
          <div key={cat.id} className="relative group">
            <button type="button"
              onClick={() => { setSelectedCategoryId(cat.id); setView('resources'); }}
              className="w-full flex flex-col items-center justify-center p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:border-amber-100 transition-all"
            >
              <div className="mb-4 text-amber-400 transform group-hover:scale-110 transition-transform">
                <Folder size={48} fill="#fbbf24" className="opacity-80" />
              </div>
              <span className="text-lg font-black text-slate-800 text-center uppercase tracking-tight group-hover:text-amber-600 transition-colors">{cat.name}</span>
              <div className="mt-4 px-4 py-1.5 bg-slate-50 rounded-full text-[9px] font-black text-white uppercase tracking-widest group-hover:bg-amber-50 group-hover:text-amber-600 transition-all">
                View Documents
              </div>
            </button>
            <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-all z-10">
              <button type="button" onClick={(e) => { e.stopPropagation(); setEditingCategoryId(cat.id); setCategoryForm({ name: cat.name }); }} className="p-2 bg-white shadow-md rounded-xl text-slate-400 hover:text-blue-600">
                <Edit2 size={14} />
              </button>
              <button type="button" onClick={(e) => { e.stopPropagation(); handleDeleteCategory(cat.id, cat.name); }} className="p-2 bg-white shadow-md rounded-xl text-slate-400 hover:text-red-600">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ResourcesView({ setView, selectedCategoryId, categories, searchQuery, setSearchQuery, setShowAddResourceModal, isLoading, filteredResources, setEditingResource, setResourceForm, deleteResource }: {
  setView: (v: 'countries' | 'categories' | 'resources') => void;
  selectedCategoryId: string | null;
  categories: any[] | undefined;
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  setShowAddResourceModal: (v: boolean) => void;
  isLoading: boolean;
  filteredResources: any[];
  setEditingResource: (v: any) => void;
  setResourceForm: (v: any) => void;
  deleteResource: (id: string) => Promise<void>;
}) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button type="button" onClick={() => setView('categories')} className="p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-400 hover:text-slate-600">
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">
            {(categories ?? []).find(c => c.id === selectedCategoryId)?.name}
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#1e40af] outline-none"
            />
          </div>
          <button type="button" 
            onClick={() => setShowAddResourceModal(true)}
            className="px-4 py-2 bg-[#1e40af] text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-md shadow-blue-100 flex items-center gap-2"
          >
            <PlusCircle size={14} /> Add New
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-slate-300" size={40} />
          </div>
        ) : filteredResources.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
            <Library size={48} className="mb-4 opacity-20" />
            <p className="text-sm font-medium">No documents found in this section.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredResources.map(resource => (
              <div key={resource.id} className="bg-white rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-xl transition-all group overflow-hidden flex flex-col h-full">
                <div className="p-8 flex flex-col items-center flex-1">
                  <div className="mb-6 relative">
                    <div className="w-16 h-20 bg-[#1e40af] rounded-lg relative flex items-center justify-center transform group-hover:scale-105 transition-transform shadow-md">
                      <FileText size={32} className="text-white" />
                      <div className="absolute top-0 right-0 size-4 bg-white/20 rounded-bl-lg" />
                    </div>
                  </div>
                  <h3 className="text-sm font-black text-slate-800 text-center mb-4 min-h-[40px] leading-snug uppercase tracking-tight">
                    {resource.title}
                  </h3>
                  <div className="w-full h-px bg-slate-50 mb-4" />
                  <div className="w-full flex items-center justify-between text-[9px] font-black text-slate-300 uppercase tracking-widest mb-6">
                    <span>{new Date(resource.createdAt).toLocaleDateString()}</span>
                    <span>{resource.fileSize || '--- MB'}</span>
                  </div>
                  
                  <div className="w-full flex gap-2">
                    <a 
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-slate-50 text-slate-600 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#1e40af] hover:text-white transition-all shadow-sm"
                    >
                      Get File
                      <Download size={14} />
                    </a>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button type="button" 
                        onClick={() => {
                          setEditingResource(resource);
                          setResourceForm({
                            title: resource.title,
                            description: resource.description || '',
                            type: resource.type,
                            categoryId: resource.categoryId || '',
                            countryId: resource.countryId || '',
                            url: resource.url,
                            fileSize: resource.fileSize || ''
                          });
                        }}
                        className="p-2.5 text-blue-800 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button type="button" 
                        onClick={() => deleteResource(resource.id)}
                        className="p-2.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AddResourceModal({ showAddResourceModal, setShowAddResourceModal, resourceForm, setResourceForm, countries, categories, uploadType, setUploadType, selectedFile, setSelectedFile, handleAddResource, isSubmitting }: {
  showAddResourceModal: boolean;
  setShowAddResourceModal: (v: boolean) => void;
  resourceForm: any;
  setResourceForm: (v: any) => void;
  countries: any[] | undefined;
  categories: any[] | undefined;
  uploadType: 'link' | 'upload';
  setUploadType: (v: 'link' | 'upload') => void;
  selectedFile: File | null;
  setSelectedFile: (v: File | null) => void;
  handleAddResource: (e: React.FormEvent) => Promise<void>;
  isSubmitting: boolean;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button type="button" aria-label="Close" className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowAddResourceModal(false)} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-slide-up overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-[#f8fafc] flex items-center justify-between">
          <h2 className="text-lg font-black text-[#1e293b]">Publish to Learning Hub</h2>
          <button type="button" aria-label="Close" onClick={() => setShowAddResourceModal(false)} className="p-2 hover:bg-slate-200 rounded-lg text-slate-400 transition-all">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleAddResource} className="p-6 space-y-4">
          <div>
            <label htmlFor="hub-resource-title" className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Document Title</label>
            <input 
              id="hub-resource-title"
              type="text"
              required
              placeholder="e.g. Visa Guidelines India..."
              value={resourceForm.title}
              onChange={(e) => setResourceForm({...resourceForm, title: e.target.value})}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1e40af] outline-none text-sm font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="hub-resource-country" className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Country</label>
              <select 
                id="hub-resource-country"
                required
                value={resourceForm.countryId}
                onChange={(e) => setResourceForm({...resourceForm, countryId: e.target.value})}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1e40af] outline-none text-sm font-bold"
              >
                <option value="">Select Country</option>
                {(countries ?? []).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="hub-resource-category" className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Category</label>
              <select
                id="hub-resource-category"
                required
                value={resourceForm.categoryId}
                onChange={(e) => setResourceForm({...resourceForm, categoryId: e.target.value})}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1e40af] outline-none text-sm font-bold"
              >
                <option value="">Select Category</option>
                {(categories ?? []).map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
            </div>
          </div>

          <div className="flex p-1 bg-slate-100 rounded-xl mb-4">
            <button type="button"
              onClick={() => setUploadType('link')}
              className={`flex-1 py-2 text-xs font-black rounded-lg transition-all ${uploadType === 'link' ? 'bg-white text-[#1e40af] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Document Link
            </button>
            <button type="button"
              onClick={() => setUploadType('upload')}
              className={`flex-1 py-2 text-xs font-black rounded-lg transition-all ${uploadType === 'upload' ? 'bg-white text-[#1e40af] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Upload File
            </button>
          </div>

          {uploadType === 'link' ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="hub-resource-url" className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Resource URL</label>
                <input 
                  id="hub-resource-url"
                  type="url"
                  required
                  placeholder="https://..."
                  value={resourceForm.url}
                  onChange={(e) => setResourceForm({...resourceForm, url: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1e40af] outline-none text-sm font-medium text-blue-600"
                />
              </div>
              <div>
                <label htmlFor="hub-resource-fileSize" className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">File Size (MB)</label>
                <input 
                  id="hub-resource-fileSize"
                  type="text"
                  placeholder="e.g. 5.38 MB"
                  value={resourceForm.fileSize}
                  onChange={(e) => setResourceForm({...resourceForm, fileSize: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1e40af] outline-none text-sm font-bold"
                />
              </div>
            </div>
          ) : (
            <div className="w-full">
              <label htmlFor="hub-resource-upload" className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Upload Document</label>
              <div className="relative group">
                <input 
                  id="hub-resource-upload"
                  type="file"
                  required
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="w-full px-4 py-6 bg-blue-50/50 border-2 border-dashed border-blue-200 rounded-2xl flex flex-col items-center justify-center gap-2 group-hover:border-[#1e40af] transition-all">
                  <div className="size-10 bg-blue-100 rounded-full flex items-center justify-center text-[#1e40af]">
                    <PlusCircle size={20} />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-black text-slate-700">
                      {selectedFile ? selectedFile.name : 'Click to upload or drag and drop'}
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold mt-1">
                      {selectedFile ? (selectedFile.size / (1024 * 1024)).toFixed(2) + ' MB' : 'PDF, DOC, DOCX, ZIP (Max 10MB)'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="pt-4 flex gap-3">
            <button type="button" 
              onClick={() => setShowAddResourceModal(false)}
              className="flex-1 px-6 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-all text-sm"
            >
              Cancel
            </button>
            <button type="button" 
              disabled={isSubmitting}
              className="flex-[2] px-6 py-3 bg-[#1e40af] text-white rounded-xl font-black hover:bg-[#1d4ed8] transition-all text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-100 disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : 'Confirm Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddCountryModal({ showAddCountryModal, setShowAddCountryModal, countryForm, setCountryForm, handleAddCountry, isSubmitting }: {
  showAddCountryModal: boolean;
  setShowAddCountryModal: (v: boolean) => void;
  countryForm: any;
  setCountryForm: (v: any) => void;
  handleAddCountry: (e: React.FormEvent) => Promise<void>;
  isSubmitting: boolean;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button type="button" aria-label="Close" className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowAddCountryModal(false)} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm animate-slide-up overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-blue-50/50 flex items-center justify-between">
          <h2 className="text-lg font-black text-[#1e293b]">Add New Country</h2>
          <button type="button" aria-label="Close" onClick={() => setShowAddCountryModal(false)} className="p-2 hover:bg-white rounded-lg text-slate-400 transition-all">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleAddCountry} className="p-6 space-y-4">
          <div>
            <label htmlFor="hub-country-name" className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Country Name</label>
            <input 
              id="hub-country-name"
              type="text"
              required
              placeholder="e.g. Australia..."
              value={countryForm.name}
              onChange={(e) => setCountryForm({...countryForm, name: e.target.value})}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1e40af] outline-none text-sm font-bold"
            />
          </div>
          <div>
            <label htmlFor="hub-country-code" className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">ISO Code (2-letter for Flag)</label>
            <input 
              id="hub-country-code"
              type="text"
              placeholder="e.g. au, ca, us..."
              maxLength={2}
              value={countryForm.code}
              onChange={(e) => setCountryForm({...countryForm, code: e.target.value})}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1e40af] outline-none text-sm font-bold uppercase"
            />
          </div>
          <button type="button" 
            disabled={isSubmitting}
            className="w-full px-6 py-3 bg-[#1e40af] text-white rounded-xl font-black hover:bg-[#1d4ed8] transition-all text-sm shadow-lg shadow-blue-100"
          >
            {isSubmitting ? <Loader2 size={18} className="animate-spin mx-auto" /> : 'Save Country'}
          </button>
        </form>
      </div>
    </div>
  );
}

function AddCategoryModal({ showAddCategoryModal, setShowAddCategoryModal, categoryForm, setCategoryForm, handleAddCategory, isSubmitting }: {
  showAddCategoryModal: boolean;
  setShowAddCategoryModal: (v: boolean) => void;
  categoryForm: any;
  setCategoryForm: (v: any) => void;
  handleAddCategory: (e: React.FormEvent) => Promise<void>;
  isSubmitting: boolean;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button type="button" aria-label="Close" className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowAddCategoryModal(false)} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm animate-slide-up overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-amber-50/50 flex items-center justify-between">
          <h2 className="text-lg font-black text-[#1e293b]">Add Category</h2>
          <button type="button" aria-label="Close" onClick={() => setShowAddCategoryModal(false)} className="p-2 hover:bg-white rounded-lg text-slate-400 transition-all">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleAddCategory} className="p-6 space-y-4">
          <div>
            <label htmlFor="hub-addCategory-name" className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Category Name</label>
            <input 
              id="hub-addCategory-name"
              type="text"
              required
              placeholder="e.g. Visa Documents..."
              value={categoryForm.name}
              onChange={(e) => setCategoryForm({ name: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-sm font-bold"
            />
          </div>
          <button type="button" 
            disabled={isSubmitting}
            className="w-full px-6 py-3 bg-amber-600 text-white rounded-xl font-black hover:bg-amber-700 transition-all text-sm shadow-lg shadow-amber-100"
          >
            {isSubmitting ? <Loader2 size={18} className="animate-spin mx-auto" /> : 'Save Category'}
          </button>
        </form>
      </div>
    </div>
  );
}

function EditCategoryModal({ editingCategoryId, setEditingCategoryId, categoryForm, setCategoryForm, handleUpdateCategory, isSubmitting }: {
  editingCategoryId: string | null;
  setEditingCategoryId: (id: string | null) => void;
  categoryForm: any;
  setCategoryForm: (v: any) => void;
  handleUpdateCategory: (e: React.FormEvent) => Promise<void>;
  isSubmitting: boolean;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button type="button" aria-label="Close" className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setEditingCategoryId(null)} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm animate-slide-up overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-blue-50/50 flex items-center justify-between">
          <h2 className="text-lg font-black text-[#1e293b]">Edit Category</h2>
          <button type="button" aria-label="Close" onClick={() => setEditingCategoryId(null)} className="p-2 hover:bg-white rounded-lg text-slate-400 transition-all">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleUpdateCategory} className="p-6 space-y-4">
          <div>
            <label htmlFor="hub-editCategory-name" className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Category Name</label>
            <input 
              id="hub-editCategory-name"
              type="text"
              required
              value={categoryForm.name}
              onChange={(e) => setCategoryForm({ name: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1e40af] outline-none text-sm font-bold"
            />
          </div>
          <div className="flex gap-3">
            <button type="button" 
              onClick={() => setEditingCategoryId(null)}
              className="flex-1 px-6 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-all text-sm"
            >
              Cancel
            </button>
            <button type="button" 
              disabled={isSubmitting}
              className="flex-[2] px-6 py-3 bg-[#1e40af] text-white rounded-xl font-black hover:bg-[#1d4ed8] transition-all text-sm shadow-lg shadow-blue-100"
            >
              {isSubmitting ? <Loader2 size={18} className="animate-spin mx-auto" /> : 'Update Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditResourceModal({ editingResource, setEditingResource, resourceForm, setResourceForm, countries, categories, handleUpdateResource, isSubmitting }: {
  editingResource: any;
  setEditingResource: (v: any) => void;
  resourceForm: any;
  setResourceForm: (v: any) => void;
  countries: any[] | undefined;
  categories: any[] | undefined;
  handleUpdateResource: (e: React.FormEvent) => Promise<void>;
  isSubmitting: boolean;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button type="button" aria-label="Close" className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setEditingResource(null)} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-slide-up overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-[#f8fafc] flex items-center justify-between">
          <h2 className="text-lg font-black text-[#1e293b]">Edit Document</h2>
          <button type="button" aria-label="Close" onClick={() => setEditingResource(null)} className="p-2 hover:bg-slate-200 rounded-lg text-slate-400 transition-all">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleUpdateResource} className="p-6 space-y-4">
          <div>
            <label htmlFor="hub-editResource-title" className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Document Title</label>
            <input 
              id="hub-editResource-title"
              type="text"
              required
              value={resourceForm.title}
              onChange={(e) => setResourceForm({...resourceForm, title: e.target.value})}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1e40af] outline-none text-sm font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="hub-editResource-country" className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Country</label>
              <select 
                id="hub-editResource-country"
                required
                value={resourceForm.countryId}
                onChange={(e) => setResourceForm({...resourceForm, countryId: e.target.value})}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1e40af] outline-none text-sm font-bold"
              >
                <option value="">Select Country</option>
                {(countries ?? []).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="hub-editResource-category" className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Category</label>
              <select
                id="hub-editResource-category"
                required
                value={resourceForm.categoryId}
                onChange={(e) => setResourceForm({...resourceForm, categoryId: e.target.value})}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1e40af] outline-none text-sm font-bold"
              >
                <option value="">Select Category</option>
                {(categories ?? []).map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="hub-editResource-url" className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Resource URL</label>
              <input 
                id="hub-editResource-url"
                type="url"
                required
                value={resourceForm.url}
                onChange={(e) => setResourceForm({...resourceForm, url: e.target.value})}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1e40af] outline-none text-sm font-medium text-blue-600"
              />
            </div>
            <div>
              <label htmlFor="hub-editResource-fileSize" className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">File Size (MB)</label>
              <input 
                id="hub-editResource-fileSize"
                type="text"
                value={resourceForm.fileSize}
                onChange={(e) => setResourceForm({...resourceForm, fileSize: e.target.value})}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1e40af] outline-none text-sm font-bold"
              />
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button type="button" 
              onClick={() => setEditingResource(null)}
              className="flex-1 px-6 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-all text-sm"
            >
              Cancel
            </button>
            <button type="button" 
              disabled={isSubmitting}
              className="flex-[2] px-6 py-3 bg-[#1e40af] text-white rounded-xl font-black hover:bg-[#1d4ed8] transition-all text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-100 disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : 'Update Document'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
