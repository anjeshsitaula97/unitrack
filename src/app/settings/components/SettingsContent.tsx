'use client';

import React, { useState, useRef } from 'react';
import { 
  User, 
  Users,
  Shield, 
  Lock, 
  Bell, 
  Globe, 
  Plus, 
  Trash2, 
  Edit2, 
  Check, 
  X,
  ChevronRight,
  ShieldCheck,
  Key,
  MapPin,
  Mail,
  Phone,
  LayoutGrid,
  BookOpen,
  MoreHorizontal,
  Building2,
  GraduationCap
} from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';

type SettingsTab = 'profile' | 'roles' | 'permissions' | 'localization' | 'notifications' | 'security' | 'branches' | 'qualifications' | 'email' | 'partners' | 'academics';

interface Role {
  id: string;
  name: string;
  description: string;
  userCount: number;
  color: string;
}

interface Permission {
  id: string;
  name: string;
  description: string;
  module: string;
}

const INITIAL_ROLES: Role[] = [
  { id: 'role-1', name: 'Administrator', description: 'Full access to all modules and settings.', userCount: 3, color: 'text-rose-600 bg-rose-50 border-rose-200' },
  { id: 'role-2', name: 'Moderator', description: 'Can manage courses and universities but cannot edit system settings.', userCount: 8, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
  { id: 'role-3', name: 'Editor', description: 'Can edit content but cannot approve or delete.', userCount: 15, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  { id: 'role-4', name: 'Viewer', description: 'Read-only access to all modules.', userCount: 142, color: 'text-slate-600 bg-slate-50 border-slate-200' },
];

const PERMISSIONS: Permission[] = [
  { id: 'p1', name: 'view_dashboard', description: 'Access to main dashboard and metrics', module: 'General' },
  { id: 'p2', name: 'manage_universities', description: 'Create, update and delete universities', module: 'Universities' },
  { id: 'p3', name: 'manage_courses', description: 'Create, update and delete courses', module: 'Courses' },
  { id: 'p4', name: 'manage_users', description: 'Add and remove users from the platform', module: 'Access Control' },
  { id: 'p5', name: 'manage_roles', description: 'Edit role permissions and create new roles', module: 'Access Control' },
  { id: 'p6', name: 'export_data', description: 'Export platform data to Excel/CSV', module: 'Reports' },
  { id: 'p7', name: 'system_settings', description: 'Access and edit global system configuration', module: 'Settings' },
];

import { COUNTRIES } from '@/lib/data/countries';

interface SystemSettings {
  country: string;
  currencyCode: string;
  phoneCode: string;
  language: string;
  enableBranches: boolean;
  officeLatitude?: number | null;
  officeLongitude?: number | null;
  officeRadius?: number | null;
}

interface Branch {
  id: string;
  name: string;
  location: string;
  manager: string;
  latitude?: number | null;
  longitude?: number | null;
  phone: string;
  email: string;
  status: string;
}

export function SettingsContentInternal() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabFromUrl = searchParams.get('tab') as SettingsTab;
  
  const [activeTab, setActiveTab] = useState<SettingsTab>(tabFromUrl || 'roles');

  React.useEffect(() => {
    if (tabFromUrl) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  const handleTabChange = (tab: SettingsTab) => {
    setActiveTab(tab);
    router.push(`/settings?tab=${tab}`, { scroll: false });
  };
  const [roles, setRoles] = useState<Role[]>([]);
  const isLoadingRoles = useRef(true);
  const [showAddRole, setShowAddRole] = useState(false);
  const [newRole, setNewRole] = useState({ name: '', description: '' });
  
  // Localization states
  const [locSettings, setLocSettings] = useState<SystemSettings>({
    country: 'United States',
    currencyCode: 'USD',
    phoneCode: '+1',
    language: 'English',
    enableBranches: false,
    officeLatitude: null,
    officeLongitude: null,
    officeRadius: 100,
  });
  const [isSavingLoc, setIsSavingLoc] = useState(false);
  const [branches, setBranches] = useState<Branch[]>([]);
  const isLoadingBranches = useRef(false);
  const [showAddBranch, setShowAddBranch] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [newBranch, setNewBranch] = useState({ name: '', location: '', manager: '', phone: '', email: '', status: 'Active', latitude: '', longitude: '' });
  
  // Qualifications states
  const [qualifications, setQualifications] = useState<{id: string, name: string}[]>([]);
  const [isLoadingQuals, setIsLoadingQuals] = useState(false);
  const [newQualName, setNewQualName] = useState('');

  // Academic settings states
  const [faculties, setFaculties] = useState<{id: string, name: string}[] | undefined>(undefined);
  const [degreeTypes, setDegreeTypes] = useState<{id: string, name: string}[] | undefined>(undefined);
  const [isLoadingAcademics, setIsLoadingAcademics] = useState(true);
  const [newFacultyName, setNewFacultyName] = useState('');
  const [newDegreeTypeName, setNewDegreeTypeName] = useState('');
  const [editingFaculty, setEditingFaculty] = useState<{id: string, name: string} | null>(null);
  const [editingDegreeType, setEditingDegreeType] = useState<{id: string, name: string} | null>(null);

  React.useEffect(() => {
    const ac = new AbortController();
    const opts = { signal: ac.signal };

    fetch('/api/roles', opts)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setRoles(data);
          const perms: Record<string, string[]> = {};
          data.forEach(r => {
            perms[r.id] = r.permissions || [];
          });
          setRolePermissions(perms);
        }
        setIsLoadingRoles(false);
      })
      .catch((err) => { if (err?.name !== 'AbortError') setIsLoadingRoles(false); });

    fetch('/api/settings/localization', opts)
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) setLocSettings(data);
      });
    
    fetch('/api/branches', opts)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setBranches(data);
      });

    fetch('/api/qualifications', opts)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setQualifications(data);
      });

    fetchEmailSettings();
    fetchUniversities();
    fetchPartners();
    fetchAcademics();
    return () => ac.abort();
  }, []);

  const fetchAcademics = async () => {
    try {
      const [fRes, dRes] = await Promise.all([
        fetch('/api/faculties'),
        fetch('/api/degree-types')
      ]);
      const [fData, dData] = await Promise.all([fRes.json(), dRes.json()]);
      if (Array.isArray(fData)) setFaculties(fData);
      if (Array.isArray(dData)) setDegreeTypes(dData);
    } catch (err) {
      toast.error('Failed to load academic data');
    } finally {
      setIsLoadingAcademics(false);
    }
  };

  const [universities, setUniversities] = useState<any[] | undefined>(undefined);
  const [isLoadingUniversities, setIsLoadingUniversities] = useState(true);

  const [partners, setPartners] = useState<any[] | undefined>(undefined);
  const [isLoadingPartners, setIsLoadingPartners] = useState(true);
  const [showAddPartner, setShowAddPartner] = useState(false);
  const [newPartner, setNewPartner] = useState({ name: '', contactPerson: '', email: '', phone: '', address: '', description: '' });

  const fetchPartners = () => {
    fetch('/api/partners')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setPartners(data);
        setIsLoadingPartners(false);
      })
      .catch(() => setIsLoadingPartners(false));
  };

  const handleAddPartner = async () => {
    if (!newPartner.name) {
      toast.error('Partner name is required');
      return;
    }
    try {
      const res = await fetch('/api/partners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPartner),
      });
      const data = await res.json();
      if (res.ok) {
        setPartners([data, ...partners]);
        setNewPartner({ name: '', contactPerson: '', email: '', phone: '', address: '', description: '' });
        setShowAddPartner(false);
        toast.success('Partner added successfully');
      } else {
        toast.error(data.error || 'Failed to add partner');
      }
    } catch (err) {
      toast.error('Error adding partner');
    }
  };

  const fetchUniversities = () => {
    fetch('/api/universities')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setUniversities(data);
        setIsLoadingUniversities(false);
      })
      .catch(() => setIsLoadingUniversities(false));
  };

  const [emailSettings, setEmailSettings] = useState<any[] | undefined>(undefined);
  const isLoadingEmail = useRef(true);
  const [showAddEmail, setShowAddEmail] = useState(false);
  const [editingEmail, setEditingEmail] = useState<any>(null);
  const [newEmail, setNewEmail] = useState({
    type: 'Global',
    branchId: '',
    smtpHost: '',
    smtpPort: '587',
    smtpUser: '',
    smtpPass: '',
    smtpEncryption: 'TLS',
    fromEmail: '',
    fromName: '',
    isActive: true
  });

  const fetchEmailSettings = () => {
    fetch('/api/settings/email')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setEmailSettings(data);
        isLoadingEmail.current = false;
      })
      .catch(() => isLoadingEmail.current = false);
  };

  const handleSaveEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = editingEmail || newEmail;
    
    try {
      const res = await fetch('/api/settings/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (res.ok) {
        toast.success(editingEmail ? 'Settings updated' : 'Settings added');
        fetchEmailSettings();
        setShowAddEmail(false);
        setEditingEmail(null);
        setNewEmail({
          type: 'Global',
          branchId: '',
          smtpHost: '',
          smtpPort: '587',
          smtpUser: '',
          smtpPass: '',
          smtpEncryption: 'TLS',
          fromEmail: '',
          fromName: '',
          isActive: true
        });
      } else {
        toast.error(result.error || 'Failed to save settings');
      }
    } catch (error) {
      toast.error('Error saving settings');
    }
  };

  const handleDeleteEmail = async (id: string) => {
    if (!confirm('Are you sure you want to delete these SMTP settings?')) return;
    try {
      const res = await fetch(`/api/settings/email?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Settings deleted');
        fetchEmailSettings();
      } else {
        toast.error('Failed to delete');
      }
    } catch (error) {
      toast.error('Error deleting');
    }
  };

  const fetchBranches = () => {
    isLoadingBranches.current = true;
    fetch('/api/branches')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setBranches(data);
        isLoadingBranches.current = false;
      })
      .catch(() => setIsLoadingBranches(false));
  };

  const handleCountryChange = (countryName: string) => {
    const data = COUNTRIES.find(c => c.name === countryName);
    if (data) {
      setLocSettings({
        ...locSettings,
        country: data.name,
        currencyCode: data.currency,
        phoneCode: data.phoneCode,
        // language is not present in the new COUNTRIES data, keeping previous or default
      });
    } else {
      setLocSettings({ ...locSettings, country: countryName });
    }
  };

  const handleSaveLocalization = async () => {
    setIsSavingLoc(true);
    try {
      const res = await fetch('/api/settings/localization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(locSettings),
      });
      if (res.ok) {
        toast.success('Localization settings saved successfully');
      } else {
        toast.error('Failed to save settings');
      }
    } catch (err) {
      toast.error('Error connecting to server');
    } finally {
      setIsSavingLoc(false);
    }
  };

  // Profile states
  const [profile, setProfile] = useState({ name: '', email: '', role: '', avatar: '' });
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  React.useEffect(() => {
    const ac = new AbortController();
    fetch('/api/profile', { signal: ac.signal })
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) setProfile(data);
      });
    return () => ac.abort();
  }, []);

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: profile.name, avatar: profile.avatar }),
      });
      if (res.ok) {
        toast.success('Profile updated successfully');
      } else {
        toast.error('Failed to update profile');
      }
    } catch (err) {
      toast.error('Error connecting to server');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size must be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile({ ...profile, avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  // Permissions mapping
  const [rolePermissions, setRolePermissions] = useState<Record<string, string[]>>({});

  const togglePermission = async (roleId: string, permissionId: string) => {
    const current = rolePermissions[roleId] || [];
    let updated: string[];
    
    if (current.includes(permissionId)) {
      updated = current.filter(id => id !== permissionId);
    } else {
      updated = [...current, permissionId];
    }

    // Optimistic update
    setRolePermissions(prev => ({ ...prev, [roleId]: updated }));

    try {
      const res = await fetch(`/api/roles/${roleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissions: updated }),
      });
      if (res.ok) {
        toast.success('Permission updated');
      } else {
        throw new Error();
      }
    } catch (err) {
      // Revert on error
      setRolePermissions(prev => ({ ...prev, [roleId]: current }));
      toast.error('Failed to update permission');
    }
  };

  const handleAddRole = async () => {
    if (!newRole.name) {
      toast.error('Role name is required');
      return;
    }
    
    try {
      const res = await fetch('/api/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newRole,
          permissions: []
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setRoles([...roles, data]);
        setRolePermissions({ ...rolePermissions, [data.id]: [] });
        setNewRole({ name: '', description: '' });
        setShowAddRole(false);
        toast.success('New role created');
      } else {
        toast.error(data.error || 'Failed to create role');
      }
    } catch (err) {
      toast.error('Error creating role');
    }
  };

  const handleDeleteRole = async (id: string) => {
    if (confirm('Are you sure you want to delete this role?')) {
      try {
        const res = await fetch(`/api/roles/${id}`, { method: 'DELETE' });
        const data = await res.json();
        if (res.ok) {
          setRoles(roles.filter(r => r.id !== id));
          toast.success('Role deleted');
        } else {
          toast.error(data.error || 'Failed to delete role');
        }
      } catch (err) {
        toast.error('Error deleting role');
      }
    }
  };

  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const handleUpdateRole = async () => {
    if (!editingRole || !editingRole.name) return;
    
    console.log('Updating role:', editingRole);
    try {
      const res = await fetch(`/api/roles/${editingRole.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editingRole.name,
          description: editingRole.description
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setRoles(roles.map(r => r.id === editingRole.id ? data : r));
        setEditingRole(null);
        toast.success('Role updated');
      } else {
        toast.error(data.error || 'Failed to update role');
      }
    } catch (err) {
      toast.error('Error updating role');
    }
  };

  const handleAddBranch = async () => {
    if (!newBranch.name) {
      toast.error('Branch name is required');
      return;
    }
    try {
      const res = await fetch('/api/branches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBranch),
      });
      const data = await res.json();
      if (res.ok) {
        setBranches([data, ...branches]);
        setNewBranch({ name: '', location: '', manager: '', phone: '', email: '', status: 'Active', latitude: '', longitude: '' });
        setShowAddBranch(false);
        toast.success('Branch added successfully');
      } else {
        toast.error(data.error || 'Failed to add branch');
      }
    } catch (err) {
      toast.error('Error adding branch');
    }
  };

  const handleUpdateBranch = async () => {
    if (!editingBranch || !editingBranch.name) return;
    try {
      const res = await fetch(`/api/branches/${editingBranch.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingBranch),
      });
      const data = await res.json();
      if (res.ok) {
        setBranches(branches.map(b => b.id === editingBranch.id ? data : b));
        setEditingBranch(null);
        toast.success('Branch updated successfully');
      } else {
        toast.error(data.error || 'Failed to update branch');
      }
    } catch (err) {
      toast.error('Error updating branch');
    }
  };

  const handleDeleteBranch = async (id: string) => {
    if (confirm('Are you sure you want to delete this branch?')) {
      try {
        const res = await fetch(`/api/branches/${id}`, { method: 'DELETE' });
        if (res.ok) {
          setBranches(branches.filter(b => b.id !== id));
          toast.success('Branch deleted');
        } else {
          toast.error('Failed to delete branch');
        }
      } catch (err) {
        toast.error('Error deleting branch');
      }
    }
  };

  const handleAddQual = async () => {
    if (!newQualName.trim()) return;
    try {
      const res = await fetch('/api/qualifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newQualName }),
      });
      const data = await res.json();
      if (res.ok) {
        setQualifications([...qualifications, data]);
        setNewQualName('');
        toast.success('Qualification added');
      } else {
        toast.error(data.error || 'Failed to add qualification');
      }
    } catch (err) {
      toast.error('Error adding qualification');
    }
  };

  const handleDeleteQual = async (id: string) => {
    if (confirm('Are you sure?')) {
      try {
        const res = await fetch(`/api/qualifications/${id}`, { method: 'DELETE' });
        if (res.ok) {
          setQualifications(qualifications.filter(q => q.id !== id));
          toast.success('Qualification deleted');
        }
      } catch (err) {
        toast.error('Error deleting');
      }
    }
  };

  const handleAddFaculty = async () => {
    if (!newFacultyName.trim()) return;
    try {
      const res = await fetch('/api/faculties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newFacultyName }),
      });
      const data = await res.json();
      if (res.ok) {
        setFaculties([...faculties, data]);
        setNewFacultyName('');
        toast.success('Faculty added');
      } else {
        toast.error(data.error || 'Failed to add faculty');
      }
    } catch (err) {
      toast.error('Error adding faculty');
    }
  };

  const handleUpdateFaculty = async () => {
    if (!editingFaculty || !editingFaculty.name.trim()) return;
    try {
      const res = await fetch('/api/faculties', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingFaculty),
      });
      const data = await res.json();
      if (res.ok) {
        setFaculties(faculties.map(f => f.id === editingFaculty.id ? data : f));
        setEditingFaculty(null);
        toast.success('Faculty updated');
      } else {
        toast.error(data.error || 'Failed to update faculty');
      }
    } catch (err) {
      toast.error('Error updating faculty');
    }
  };

  const handleDeleteFaculty = async (id: string) => {
    if (!confirm('Are you sure you want to delete this faculty?')) return;
    try {
      const res = await fetch(`/api/faculties?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setFaculties(faculties.filter(f => f.id !== id));
        toast.success('Faculty deleted');
      } else {
        toast.error('Failed to delete faculty');
      }
    } catch (err) {
      toast.error('Error deleting faculty');
    }
  };

  const handleAddDegreeType = async () => {
    if (!newDegreeTypeName.trim()) return;
    try {
      const res = await fetch('/api/degree-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newDegreeTypeName }),
      });
      const data = await res.json();
      if (res.ok) {
        setDegreeTypes([...degreeTypes, data]);
        setNewDegreeTypeName('');
        toast.success('Degree type added');
      } else {
        toast.error(data.error || 'Failed to add degree type');
      }
    } catch (err) {
      toast.error('Error adding degree type');
    }
  };

  const handleUpdateDegreeType = async () => {
    if (!editingDegreeType || !editingDegreeType.name.trim()) return;
    try {
      const res = await fetch('/api/degree-types', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingDegreeType),
      });
      const data = await res.json();
      if (res.ok) {
        setDegreeTypes(degreeTypes.map(d => d.id === editingDegreeType.id ? data : d));
        setEditingDegreeType(null);
        toast.success('Degree type updated');
      } else {
        toast.error(data.error || 'Failed to update degree type');
      }
    } catch (err) {
      toast.error('Error updating degree type');
    }
  };

  const handleDeleteDegreeType = async (id: string) => {
    if (!confirm('Are you sure you want to delete this degree type?')) return;
    try {
      const res = await fetch(`/api/degree-types?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setDegreeTypes(degreeTypes.filter(d => d.id !== id));
        toast.success('Degree type deleted');
      } else {
        toast.error('Failed to delete degree type');
      }
    } catch (err) {
      toast.error('Error deleting degree type');
    }
  };

  return (
    <div className="animate-fade-in py-6">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left Sidebar Tabs */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="sticky top-24">
            <h1 className="text-2xl font-bold text-slate-800 mb-6">Settings</h1>
            <nav className="space-y-1">
              {[
                { id: 'profile', label: 'Profile', icon: <User size={18} /> },
                { id: 'roles', label: 'Roles', icon: <Shield size={18} /> },
                { id: 'permissions', label: 'Role Permissions', icon: <ShieldCheck size={18} /> },
                { id: 'localization', label: 'Localization', icon: <Globe size={18} /> },
                { id: 'branches', label: 'Branches', icon: <MapPin size={18} /> },
                { id: 'qualifications', label: 'Qualifications', icon: <BookOpen size={18} /> },
                { id: 'academics', label: 'Academics', icon: <GraduationCap size={18} /> },
                { id: 'email', label: 'Email Settings', icon: <Mail size={18} /> },
                { id: 'security', label: 'Security', icon: <Lock size={18} /> },
                { id: 'partners', label: 'University Partners', icon: <Users size={18} /> },
                { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
              ].map((tab) => (
                <button type="button"
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id as SettingsTab)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                  }`}
                >
                  <span className={activeTab === tab.id ? 'text-indigo-600' : 'text-slate-400'}>
                    {tab.icon}
                  </span>
                  {tab.label}
                  {activeTab === tab.id && <ChevronRight size={14} className="ml-auto" />}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 min-w-0">
          {activeTab === 'localization' && (
            <div className="space-y-6 max-w-2xl animate-fade-in">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Localization</h2>
                <p className="text-sm text-slate-500 mt-1">Configure your region, currency, and language settings.</p>
              </div>

              <div className="card p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="settings-country" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Country</label>
                    <select 
                      id="settings-country"
                      value={locSettings.country}
                      onChange={e => handleCountryChange(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm font-medium appearance-none"
                    >
                      <option value="">Select a country</option>
                      {COUNTRIES.map(c => (
                        <option key={c.name} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="settings-currencyCode" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Currency Code</label>
                    <input 
                      id="settings-currencyCode"
                      type="text" 
                      value={locSettings.currencyCode}
                      onChange={e => setLocSettings({ ...locSettings, currencyCode: e.target.value })}
                      placeholder="e.g. GBP"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm font-medium"
                    />
                  </div>

                  <div>
                    <label htmlFor="settings-phoneCode" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Telephone Code Symbol</label>
                    <input 
                      id="settings-phoneCode"
                      type="text" 
                      value={locSettings.phoneCode}
                      onChange={e => setLocSettings({ ...locSettings, phoneCode: e.target.value })}
                      placeholder="e.g. +44"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm font-medium"
                    />
                  </div>

                  <div>
                    <label htmlFor="settings-language" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Primary Language</label>
                    <select 
                      id="settings-language"
                      value={locSettings.language}
                      onChange={e => setLocSettings({ ...locSettings, language: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm font-medium appearance-none"
                    >
                      <option>English</option>
                      <option>Spanish</option>
                      <option>French</option>
                      <option>German</option>
                      <option>Chinese</option>
                      <option>Japanese</option>
                    </select>
                  </div>

                  <div className="md:col-span-2 py-4 border-t border-slate-50 mt-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-slate-700">Multi-branch Management</h4>
                        <p className="text-xs text-slate-500 mt-1">Enable this to manage multiple office locations and branches.</p>
                      </div>
                      <button type="button" 
                        onClick={() => setLocSettings({ ...locSettings, enableBranches: !locSettings.enableBranches })}
                        className={`w-12 h-6 rounded-full transition-all duration-300 relative ${
                          locSettings.enableBranches ? 'bg-indigo-600' : 'bg-slate-200'
                        }`}
                      >
                        <div className={`absolute top-1 size-4 rounded-full bg-white transition-all duration-300 ${
                          locSettings.enableBranches ? 'left-7' : 'left-1'
                        }`} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2 py-4 border-t border-slate-100 mt-4">
                  <h4 className="text-sm font-bold text-slate-700 mb-3">Main Office Location (Geofence)</h4>
                  <p className="text-xs text-slate-500 mb-4">Used for check-in/check-out geolocation validation. Users must be within the set radius to mark attendance.</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="settings-officeLatitude" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Office Latitude</label>
                      <input
                        id="settings-officeLatitude"
                        type="number"
                        step="any"
                        value={locSettings.officeLatitude ?? ''}
                        onChange={e => setLocSettings({ ...locSettings, officeLatitude: e.target.value ? parseFloat(e.target.value) : null })}
                        placeholder="e.g. 40.7128"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor="settings-officeLongitude" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Office Longitude</label>
                      <input
                        id="settings-officeLongitude"
                        type="number"
                        step="any"
                        value={locSettings.officeLongitude ?? ''}
                        onChange={e => setLocSettings({ ...locSettings, officeLongitude: e.target.value ? parseFloat(e.target.value) : null })}
                        placeholder="e.g. -74.0060"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor="settings-officeRadius" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Radius (meters)</label>
                      <input
                        id="settings-officeRadius"
                        type="number"
                        min="1"
                        value={locSettings.officeRadius ?? 100}
                        onChange={e => setLocSettings({ ...locSettings, officeRadius: e.target.value ? parseInt(e.target.value) : 100 })}
                        placeholder="100"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-10 pt-6 border-t border-slate-50 flex justify-end">
                  <button type="button" 
                    onClick={handleSaveLocalization}
                    disabled={isSavingLoc}
                    className="btn-primary px-10 shadow-lg shadow-indigo-100 disabled:opacity-50"
                  >
                    {isSavingLoc ? 'Saving...' : 'Save Settings'}
                  </button>
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-4">
                <div className="size-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                  <Globe size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-blue-900">Platform-wide Impact</h4>
                  <p className="text-xs text-blue-700 mt-0.5 leading-relaxed">Changing these settings will update date formats, currency symbols, and default phone prefixes across the entire UniTrack platform for all users.</p>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'roles' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Platform Roles</h2>
                  <p className="text-sm text-slate-500 mt-1">Manage user roles and their general descriptions.</p>
                </div>
                <button type="button" 
                  onClick={() => setShowAddRole(true)}
                  className="btn-primary flex items-center gap-2"
                >
                  <Plus size={18} />
                  Add New Role
                </button>
              </div>

              {showAddRole && (
                <div className="card p-6 border-2 border-indigo-100 animate-slide-down">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-slate-800">Construct New Role</h3>
                    <button type="button" onClick={() => setShowAddRole(false)} className="text-slate-400 hover:text-slate-600">
                      <X size={20} />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label htmlFor="settings-addRole-name" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Role Name</label>
                      <input 
                        id="settings-addRole-name"
                        type="text" 
                        value={newRole.name}
                        onChange={e => setNewRole({ ...newRole, name: e.target.value })}
                        placeholder="e.g. Content Manager"
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label htmlFor="settings-addRole-description" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Description</label>
                      <input 
                        id="settings-addRole-description"
                        type="text" 
                        value={newRole.description}
                        onChange={e => setNewRole({ ...newRole, description: e.target.value })}
                        placeholder="What can this role do?"
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3">
                    <button type="button" onClick={() => setShowAddRole(false)} className="btn-secondary">Cancel</button>
                    <button type="button" onClick={handleAddRole} className="btn-primary">Create Role</button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {roles.map((role) => (
                  <div key={role.id} className="card p-5 group hover:shadow-md transition-all duration-300">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border ${role.color}`}>
                        {role.name}
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button type="button" 
                          onClick={() => setEditingRole(role)}
                          className="p-1.5 text-indigo-800 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button type="button" 
                          onClick={() => handleDeleteRole(role.id)}
                          className="p-1.5 text-red-800 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-slate-700 mb-1">{role.name}</p>
                    <p className="text-xs text-slate-400 leading-relaxed min-h-[40px]">{role.description}</p>
                    <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <Users size={14} />
                        <span>{role.userCount} Active Users</span>
                      </div>
                      <button type="button" 
                        onClick={() => {
                          setActiveTab('permissions');
                          // Logic to scroll or highlight permissions for this role
                        }}
                        className="text-xs font-bold text-indigo-600 hover:underline"
                      >
                        Manage Permissions
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {editingRole && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                  <button type="button" className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setEditingRole(null)} />
                  <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md animate-slide-up overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                      <h3 className="text-base font-bold text-slate-800">Edit Platform Role</h3>
                      <button type="button" onClick={() => setEditingRole(null)} className="text-slate-400 hover:text-slate-600 transition-colors p-1"><X size={18} /></button>
                    </div>
                    <div className="p-6 space-y-4">
                      <div>
                        <label htmlFor="settings-editRole-name" className="block text-xs font-semibold text-slate-600 mb-1.5">Role Name</label>
                        <input
                          id="settings-editRole-name"
                          type="text"
                          value={editingRole.name}
                          onChange={(e) => setEditingRole({ ...editingRole, name: e.target.value })}
                          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
                        />
                      </div>
                      <div>
                        <label htmlFor="settings-editRole-description" className="block text-xs font-semibold text-slate-600 mb-1.5">Description</label>
                        <textarea
                          id="settings-editRole-description"
                          value={editingRole.description}
                          onChange={(e) => setEditingRole({ ...editingRole, description: e.target.value })}
                          rows={3}
                          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
                        />
                      </div>
                      <div className="flex justify-end gap-2 mt-4">
                        <button type="button" onClick={() => setEditingRole(null)} className="btn-secondary">Cancel</button>
                        <button type="button" onClick={handleUpdateRole} className="btn-primary">Save Changes</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'permissions' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Role Permissions</h2>
                <p className="text-sm text-slate-500 mt-1">Configure granular access levels for each platform role.</p>
              </div>

              <div className="card overflow-hidden">
                <div className="overflow-x-auto scrollbar-thin">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-100">
                        <th className="text-left p-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest min-w-[250px]">Permission</th>
                        {roles.map(role => (
                          <th key={role.id} className="p-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center whitespace-nowrap">
                            {role.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {PERMISSIONS.map((perm) => (
                        <tr key={perm.id} className="hover:bg-slate-50/30 transition-colors">
                          <td className="p-4">
                            <p className="text-xs font-bold text-slate-700">{perm.name.replace('_', ' ').toUpperCase()}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{perm.description}</p>
                            <span className="inline-block mt-2 px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 text-[9px] font-bold uppercase tracking-tight">
                              {perm.module}
                            </span>
                          </td>
                          {roles.map(role => {
                            const hasPerm = rolePermissions[role.id]?.includes(perm.id);
                            return (
                              <td key={`${role.id}-${perm.id}`} className="p-4 text-center">
                                <button type="button"
                                  onClick={() => togglePermission(role.id, perm.id)}
                                  className={`size-10 rounded-xl flex items-center justify-center mx-auto transition-all ${
                                    hasPerm 
                                      ? 'bg-emerald-50 text-emerald-600 shadow-sm border border-emerald-100' 
                                      : 'bg-slate-50 text-slate-300 border border-slate-100 hover:border-slate-200'
                                  }`}
                                >
                                  {hasPerm ? <Check size={18} strokeWidth={3} /> : <Lock size={16} />}
                                </button>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

           {activeTab === 'email' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Email SMTP Settings</h2>
                  <p className="text-sm text-slate-500 mt-1">Configure SMTP servers for the main office or individual branches.</p>
                </div>
                <button type="button" 
                  onClick={() => setShowAddEmail(true)}
                  className="btn-primary flex items-center gap-2 shadow-lg shadow-indigo-100"
                >
                  <Plus size={18} />
                  Add SMTP Config
                </button>
              </div>

              {/* Add/Edit Form */}
              {(showAddEmail || editingEmail) && (
                <div className="card p-8 border-2 border-indigo-100 animate-slide-down mb-8">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-slate-800">
                      {editingEmail ? 'Update SMTP Configuration' : 'New SMTP Configuration'}
                    </h3>
                    <button type="button" 
                      onClick={() => { setShowAddEmail(false); setEditingEmail(null); }}
                      className="text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <X size={24} />
                    </button>
                  </div>

                  <form onSubmit={handleSaveEmail} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {!editingEmail && (
                        <div>
                          <label htmlFor="settings-email-configType" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Config Type</label>
                          <select 
                            id="settings-email-configType"
                            value={newEmail.type}
                            onChange={(e) => setNewEmail({ ...newEmail, type: e.target.value, branchId: e.target.value === 'Global' ? '' : newEmail.branchId })}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                          >
                            <option value="Global">Global / Main Office</option>
                            <option value="Branch">Specific Branch</option>
                          </select>
                        </div>
                      )}
                      
                      {((!editingEmail && newEmail.type === 'Branch') || (editingEmail && editingEmail.type === 'Branch')) && (
                        <div>
                          <label htmlFor="settings-email-branch" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Select Branch</label>
                          <select 
                            id="settings-email-branch"
                            value={editingEmail ? editingEmail.branchId : newEmail.branchId}
                            onChange={(e) => {
                              if (editingEmail) setEditingEmail({ ...editingEmail, branchId: e.target.value });
                              else setNewEmail({ ...newEmail, branchId: e.target.value });
                            }}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                            disabled={!!editingEmail}
                          >
                            <option value="">Select Branchâ€¦</option>
                            {branches.map(b => (
                              <option key={b.id} value={b.id}>{b.name}</option>
                            ))}
                          </select>
                        </div>
                      )}

                      <div className="md:col-span-1">
                        <label htmlFor="settings-email-fromName" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Sender Name</label>
                        <input 
                          id="settings-email-fromName"
                          type="text"
                          value={editingEmail ? editingEmail.fromName : newEmail.fromName}
                          onChange={(e) => {
                            if (editingEmail) setEditingEmail({ ...editingEmail, fromName: e.target.value });
                            else setNewEmail({ ...newEmail, fromName: e.target.value });
                          }}
                          placeholder="e.g. UniTrack Support"
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="md:col-span-2">
                        <label htmlFor="settings-email-smtpHost" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">SMTP Host</label>
                        <input 
                          id="settings-email-smtpHost"
                          type="text"
                          value={editingEmail ? editingEmail.smtpHost : newEmail.smtpHost}
                          onChange={(e) => {
                            if (editingEmail) setEditingEmail({ ...editingEmail, smtpHost: e.target.value });
                            else setNewEmail({ ...newEmail, smtpHost: e.target.value });
                          }}
                          placeholder="smtp.gmail.com"
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="settings-email-port" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Port</label>
                        <input 
                          id="settings-email-port"
                          type="number"
                          value={editingEmail ? editingEmail.smtpPort : newEmail.smtpPort}
                          onChange={(e) => {
                            if (editingEmail) setEditingEmail({ ...editingEmail, smtpPort: e.target.value });
                            else setNewEmail({ ...newEmail, smtpPort: e.target.value });
                          }}
                          placeholder="587"
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="settings-email-encryption" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Encryption</label>
                        <select 
                          id="settings-email-encryption"
                          value={editingEmail ? editingEmail.smtpEncryption : newEmail.smtpEncryption}
                          onChange={(e) => {
                            if (editingEmail) setEditingEmail({ ...editingEmail, smtpEncryption: e.target.value });
                            else setNewEmail({ ...newEmail, smtpEncryption: e.target.value });
                          }}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                        >
                          <option value="TLS">TLS</option>
                          <option value="SSL">SSL</option>
                          <option value="None">None</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="settings-email-smtpUser" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">SMTP Username / Email</label>
                        <input 
                          id="settings-email-smtpUser"
                          type="email"
                          value={editingEmail ? editingEmail.smtpUser : newEmail.smtpUser}
                          onChange={(e) => {
                            if (editingEmail) setEditingEmail({ ...editingEmail, smtpUser: e.target.value });
                            else setNewEmail({ ...newEmail, smtpUser: e.target.value });
                          }}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="settings-email-smtpPass" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">SMTP Password</label>
                        <input 
                          id="settings-email-smtpPass"
                          type="password"
                          value={editingEmail ? editingEmail.smtpPass : newEmail.smtpPass}
                          onChange={(e) => {
                            if (editingEmail) setEditingEmail({ ...editingEmail, smtpPass: e.target.value });
                            else setNewEmail({ ...newEmail, smtpPass: e.target.value });
                          }}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                      <div className="flex items-center gap-2">
                        <input 
                          type="checkbox"
                          id="active-toggle"
                          checked={editingEmail ? editingEmail.isActive : newEmail.isActive}
                          onChange={(e) => {
                            if (editingEmail) setEditingEmail({ ...editingEmail, isActive: e.target.checked });
                            else setNewEmail({ ...newEmail, isActive: e.target.checked });
                          }}
                          className="size-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                        />
                        <label htmlFor="active-toggle" className="text-sm font-semibold text-slate-700">Active Configuration</label>
                      </div>
                      <div className="flex gap-3">
                        <button type="button" 
                          onClick={() => { setShowAddEmail(false); setEditingEmail(null); }}
                          className="btn-secondary"
                        >
                          Cancel
                        </button>
                        <button type="submit" className="btn-primary">
                          {editingEmail ? 'Update SMTP' : 'Create SMTP'}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              )}

              {/* List View */}
              <div className="space-y-4">
                {(emailSettings?.length ?? 0) === 0 && !showAddEmail && (
                  <div className="text-center py-8 text-sm text-slate-400">No email settings configured yet.</div>
                )}
                {(emailSettings ?? []).map(setting => (
                  <div key={setting.id} className="card p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                      <div className={`size-12 rounded-2xl flex items-center justify-center ${setting.type === 'Global' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>
                        {setting.type === 'Global' ? <Shield size={24} /> : <MapPin size={24} />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-800">{setting.type === 'Global' ? 'Main Office (Global)' : setting.branch?.name}</h3>
                          {!setting.isActive && <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-400 text-[9px] font-black uppercase tracking-widest">Disabled</span>}
                        </div>
                        <p className="text-xs text-slate-400 font-medium">SMTP: {setting.smtpHost}:{setting.smtpPort} ({setting.smtpEncryption})</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">Sender: {setting.fromName} &lt;{setting.fromEmail}&gt;</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button type="button" 
                        onClick={() => setEditingEmail(setting)}
                        className="p-2 text-indigo-800 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button type="button" 
                        onClick={() => handleDeleteEmail(setting.id)}
                        className="p-2 text-rose-800 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 flex gap-5 mt-10">
                <div className="size-12 bg-white rounded-xl flex items-center justify-center text-amber-600 shadow-sm flex-shrink-0">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-amber-900 mb-1">Email Delivery Security</h4>
                  <p className="text-xs text-amber-700 leading-relaxed">
                    SMTP credentials are stored securely in the database. When a branch configuration is active, the system will prioritize it for emails originating from that branch. If no branch setting exists, the Global configuration is used as a fallback.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="card p-10 max-w-2xl mx-auto animate-fade-in relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-indigo-500/10 to-violet-500/10" />
              
              <div className="relative mt-8 text-center">
                <div className="relative inline-block group">
                  <div className="size-32 rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-4xl font-bold shadow-2xl shadow-indigo-200 border-4 border-white overflow-hidden relative">
                    {profile.avatar ? (
                      <Image src={profile.avatar} alt={profile.name} fill className="object-cover" sizes="128px" />
                    ) : (
                      profile.name ? profile.name.substring(0, 2).toUpperCase() : '??'
                    )}
                  </div>
                  <label 
                    htmlFor="avatar-upload" 
                    className="absolute -bottom-2 -right-2 size-10 bg-white rounded-2xl shadow-lg flex items-center justify-center text-indigo-600 cursor-pointer hover:bg-indigo-50 transition-all border border-slate-100 group-hover:scale-110"
                  >
                    <Edit2 size={18} />
                    <input 
                      id="avatar-upload"
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleAvatarChange}
                    />
                  </label>
                </div>
                <h2 className="text-2xl font-black text-slate-800 mt-6">{profile.name || 'Loading...'}</h2>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest border border-indigo-100">
                    {profile.role || 'System User'}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 text-left pt-8 border-t border-slate-50">
                <div className="space-y-6">
                  <div>
                    <label htmlFor="settings-profile-name" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Full Name</label>
                    <input 
                      id="settings-profile-name"
                      type="text" 
                      value={profile.name} 
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 font-semibold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-sm" 
                    />
                  </div>
                  <div>
                    <label htmlFor="settings-profile-email" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
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
                    <label htmlFor="settings-profile-role" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Account Role</label>
                    <input 
                      id="settings-profile-role"
                      type="text" 
                      value={profile.role} 
                      readOnly
                      className="w-full px-5 py-3 bg-slate-100/50 border border-slate-200 rounded-2xl text-slate-500 font-medium outline-none cursor-not-allowed shadow-sm" 
                    />
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Avatar Source</span>
                    <div className="px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] text-slate-400 font-medium flex items-center gap-2 italic truncate">
                      <Mail size={14} className="flex-shrink-0" />
                      {profile.avatar ? (profile.avatar.startsWith('data:') ? 'Custom Uploaded Image' : profile.avatar) : 'System Default Initials'}
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2 pt-6 flex justify-end">
                  <button type="button" 
                    onClick={handleSaveProfile}
                    disabled={isSavingProfile}
                    className="btn-primary px-12 py-3 rounded-2xl shadow-xl shadow-indigo-100 disabled:opacity-50 hover:scale-105 transition-transform"
                  >
                    {isSavingProfile ? 'Saving Changes...' : 'Save Profile Changes'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'academics' && (
            <div className="space-y-8 animate-fade-in max-w-4xl pb-12">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Academic Settings</h2>
                <p className="text-sm text-slate-500 mt-1">Manage faculties and degree types used across the platform.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Faculty Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="size-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                      <LayoutGrid size={18} />
                    </div>
                    <h3 className="font-bold text-slate-700">Faculties</h3>
                  </div>
                  
                  <div className="card p-5">
                    <div className="flex gap-2 mb-6">
                      <input 
                        type="text"
                        value={newFacultyName}
                        onChange={e => setNewFacultyName(e.target.value)}
                        placeholder="Add new faculty..."
                        className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                        onKeyDown={e => e.key === 'Enter' && handleAddFaculty()}
                      />
                      <button type="button" onClick={handleAddFaculty} className="p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all" aria-label="Add"> <Plus size={20} />
                      </button>
                    </div>

                    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin">
                      {(faculties ?? []).map((f) => (
                        <div key={f.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 group transition-all hover:bg-white hover:shadow-sm">
                          {editingFaculty?.id === f.id ? (
                            <div className="flex-1 flex gap-2">
                              <input 
                                type="text"
                                value={editingFaculty.name}
                                onChange={e => setEditingFaculty({ ...editingFaculty, name: e.target.value })}
                                className="flex-1 px-2 py-1 bg-white border border-indigo-200 rounded-lg outline-none text-sm"
                                onKeyDown={e => e.key === 'Enter' && handleUpdateFaculty()}
                              />
                              <button type="button" onClick={handleUpdateFaculty} className="text-emerald-500 p-1 hover:bg-emerald-50 rounded" aria-label="Check"> <Check size={16} />
                              </button>
                              <button type="button" onClick={() => setEditingFaculty(null)} className="text-slate-400 p-1 hover:bg-slate-100 rounded">
                                <X size={16} />
                              </button>
                            </div>
                          ) : (
                            <>
                              <span className="text-sm font-semibold text-slate-600">{f.name}</span>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button type="button" 
                                  onClick={() => setEditingFaculty(f)}
                                  className="p-1.5 text-indigo-800 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                                >
                                  <Edit2 size={14} />
                                </button>
                                <button type="button" 
                                  onClick={() => handleDeleteFaculty(f.id)}
                                  className="p-1.5 text-red-800 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                      {(faculties?.length ?? 0) === 0 && !isLoadingAcademics && (
                        <div className="py-8 text-center text-slate-400 text-xs italic">No faculties defined yet.</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Degree Type Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="size-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                      <GraduationCap size={18} />
                    </div>
                    <h3 className="font-bold text-slate-700">Degree Types</h3>
                  </div>
                  
                  <div className="card p-5">
                    <div className="flex gap-2 mb-6">
                      <input 
                        type="text"
                        value={newDegreeTypeName}
                        onChange={e => setNewDegreeTypeName(e.target.value)}
                        placeholder="Add new degree type..."
                        className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                        onKeyDown={e => e.key === 'Enter' && handleAddDegreeType()}
                      />
                      <button type="button" onClick={handleAddDegreeType} className="p-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all" aria-label="Add"> <Plus size={20} />
                      </button>
                    </div>

                    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin">
                      {(degreeTypes ?? []).map((d) => (
                        <div key={d.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 group transition-all hover:bg-white hover:shadow-sm">
                          {editingDegreeType?.id === d.id ? (
                            <div className="flex-1 flex gap-2">
                              <input 
                                type="text"
                                value={editingDegreeType.name}
                                onChange={e => setEditingDegreeType({ ...editingDegreeType, name: e.target.value })}
                                className="flex-1 px-2 py-1 bg-white border border-emerald-200 rounded-lg outline-none text-sm"
                                onKeyDown={e => e.key === 'Enter' && handleUpdateDegreeType()}
                              />
                              <button type="button" onClick={handleUpdateDegreeType} className="text-emerald-500 p-1 hover:bg-emerald-50 rounded" aria-label="Check"> <Check size={16} />
                              </button>
                              <button type="button" onClick={() => setEditingDegreeType(null)} className="text-slate-400 p-1 hover:bg-slate-100 rounded">
                                <X size={16} />
                              </button>
                            </div>
                          ) : (
                            <>
                              <span className="text-sm font-semibold text-slate-600">{d.name}</span>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button type="button" 
                                  onClick={() => setEditingDegreeType(d)}
                                  className="p-1.5 text-emerald-800 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg"
                                >
                                  <Edit2 size={14} />
                                </button>
                                <button type="button" 
                                  onClick={() => handleDeleteDegreeType(d.id)}
                                  className="p-1.5 text-red-800 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                      {(degreeTypes?.length ?? 0) === 0 && !isLoadingAcademics && (
                        <div className="py-8 text-center text-slate-400 text-xs italic">No degree types defined yet.</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'qualifications' && (
            <div className="space-y-6 max-w-2xl animate-fade-in">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Education Qualifications</h2>
                <p className="text-sm text-slate-500 mt-1">Manage the standard qualification levels available for student education history.</p>
              </div>

              <div className="card p-6">
                <div className="flex gap-4 mb-8">
                  <input 
                    type="text"
                    value={newQualName}
                    onChange={e => setNewQualName(e.target.value)}
                    placeholder="e.g. SLC, +2, Bachelor's, Master's"
                    className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                  <button type="button" onClick={handleAddQual} className="btn-primary flex items-center gap-2" aria-label="Add"> <Plus size={18} /> Add
                  </button>
                </div>

                <div className="space-y-2">
                  {qualifications.map((q) => (
                    <div key={q.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 group">
                      <span className="text-sm font-bold text-slate-700">{q.name}</span>
                      <button type="button" onClick={() => handleDeleteQual(q.id)} className="p-2 text-red-800 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  {qualifications.length === 0 && (
                    <div className="py-10 text-center text-slate-400">No qualifications added yet.</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Account Security</h2>
                <p className="text-sm text-slate-500 mt-1">Manage your password and session settings.</p>
              </div>
              
              <div className="card p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="size-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                    <Lock size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">Change Password</h3>
                    <p className="text-xs text-slate-400">Regularly updating your password is recommended for safety.</p>
                  </div>
                </div>
                
                <form className="space-y-4" autoComplete="off">
                  <input 
                    type="password" 
                    id="current-password"
                    name="current-password"
                    placeholder="Current Password" 
                    autoComplete="current-password"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" 
                  />
                  <input 
                    type="password" 
                    id="new-password"
                    name="new-password"
                    placeholder="New Password" 
                    autoComplete="new-password"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" 
                  />
                  <input 
                    type="password" 
                    id="confirm-password"
                    name="confirm-password"
                    placeholder="Confirm New Password" 
                    autoComplete="new-password"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" 
                  />
                  <button type="button" className="btn-primary w-full shadow-lg shadow-indigo-100">Update Password</button>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'partners' && (
            <div className="space-y-8 animate-fade-in pb-12">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">University Partners</h2>
                  <p className="text-sm text-slate-500 mt-1">Manage partner companies and link them to universities.</p>
                </div>
                <div className="flex gap-2">
                  <button type="button" 
                    onClick={() => setShowAddPartner(!showAddPartner)}
                    className="btn-primary flex items-center gap-2"
                  >
                    <Plus size={18} />
                    {showAddPartner ? 'Cancel' : 'Add Partner'}
                  </button>
                  <button type="button" 
                    onClick={() => { fetchUniversities(); fetchPartners(); }}
                    className="btn-secondary flex items-center gap-2"
                    disabled={isLoadingUniversities}
                  >
                    <Globe size={16} className={isLoadingUniversities ? 'animate-spin' : ''} />
                    Refresh
                  </button>
                </div>
              </div>

              {showAddPartner && (
                <div className="card p-6 border-2 border-indigo-100 animate-slide-down">
                  <h3 className="font-bold text-slate-800 mb-6">Register New Partner Company</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <div>
                      <label htmlFor="settings-partner-name" className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Partner Name</label>
                      <input 
                        id="settings-partner-name"
                        type="text" 
                        value={newPartner.name}
                        onChange={e => setNewPartner({ ...newPartner, name: e.target.value })}
                        placeholder="e.g. UniPath International"
                        className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none text-sm font-black text-slate-700 transition-all"
                      />
                    </div>
                    <div>
                      <label htmlFor="settings-partner-contactPerson" className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Contact Person</label>
                      <input 
                        id="settings-partner-contactPerson"
                        type="text" 
                        value={newPartner.contactPerson}
                        onChange={e => setNewPartner({ ...newPartner, contactPerson: e.target.value })}
                        placeholder="Full Name"
                        className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none text-sm font-black text-slate-700 transition-all"
                      />
                    </div>
                    <div>
                      <label htmlFor="settings-partner-email" className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
                      <input 
                        id="settings-partner-email"
                        type="email" 
                        value={newPartner.email}
                        onChange={e => setNewPartner({ ...newPartner, email: e.target.value })}
                        placeholder="partner@example.com"
                        className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none text-sm font-black text-slate-700 transition-all"
                      />
                    </div>
                    <div>
                      <label htmlFor="settings-partner-phone" className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Phone Number</label>
                      <input 
                        id="settings-partner-phone"
                        type="text" 
                        value={newPartner.phone}
                        onChange={e => setNewPartner({ ...newPartner, phone: e.target.value })}
                        placeholder="+1 ..."
                        className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none text-sm font-black text-slate-700 transition-all"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label htmlFor="settings-partner-address" className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Office Address</label>
                      <input 
                        id="settings-partner-address"
                        type="text" 
                        value={newPartner.address}
                        onChange={e => setNewPartner({ ...newPartner, address: e.target.value })}
                        placeholder="Full office address"
                        className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none text-sm font-black text-slate-700 transition-all"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3">
                    <button type="button" onClick={() => setShowAddPartner(false)} className="btn-secondary">Cancel</button>
                    <button type="button" onClick={handleAddPartner} className="btn-primary">Create Partner</button>
                  </div>
                </div>
              )}

              {/* Partners List */}
              <div className="space-y-4">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                  <Users size={14} />
                  Registered Partners ({(partners?.length ?? 0)})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {isLoadingPartners ? (
                    <div className="col-span-full py-12 text-center text-slate-400 italic">Loading partnersâ€¦</div>
                  ) : (partners?.length ?? 0) === 0 ? (
                    <div className="col-span-full py-12 text-center card bg-slate-50/50 border-dashed border-2 border-slate-200 text-slate-400 italic">
                      No partners registered yet.
                    </div>
                  ) : (
                    (partners ?? []).map(p => (
                      <div key={p.id} className="card p-5 group hover:shadow-lg transition-all duration-300">
                        <div className="flex justify-between items-start mb-4">
                          <div className="size-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-lg">
                            {p.name[0]}
                          </div>
                          <button type="button" className="p-2 text-slate-300 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-all" aria-label="MoreHorizontal"> <MoreHorizontal size={18} />
                          </button>
                        </div>
                        <h4 className="font-bold text-slate-800 mb-1">{p.name}</h4>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-4">{p.contactPerson || 'No contact person'}</p>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Mail size={12} className="text-slate-400" />
                            {p.email || 'N/A'}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Phone size={12} className="text-slate-400" />
                            {p.phone || 'N/A'}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* University Partnerships Table */}
              <div className="space-y-4 mt-12">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                  <Building2 size={14} />
                  Active University Partnerships
                </h3>
                <div className="card overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left">
                      <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100">
                          <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">University & Partner</th>
                          <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Partnership Amount</th>
                          <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Commission Type</th>
                          <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Commission Value</th>
                          <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right pr-6">Currency</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {isLoadingUniversities ? (
                          <tr>
                            <td colSpan={5} className="p-12 text-center">
                              <div className="flex flex-col items-center gap-3">
                                <div className="size-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                                <p className="text-sm font-medium text-slate-400">Loading partnership dataâ€¦</p>
                              </div>
                            </td>
                          </tr>
                        ) : (universities?.length ?? 0) === 0 ? (
                          <tr>
                            <td colSpan={5} className="p-12 text-center text-slate-400 text-sm italic">
                              No universities found in the system.
                            </td>
                          </tr>
                        ) : (
                          (universities ?? []).map((univ) => (
                            <tr key={univ.id} className="hover:bg-slate-50/30 transition-colors">
                              <td className="p-4">
                                <div className="flex items-center gap-3">
                                  <div className="size-8 rounded-lg flex items-center justify-center text-white text-[10px] font-bold overflow-hidden relative" style={{ backgroundColor: univ.color || '#6366f1' }}>
                                    {univ.logo ? <Image src={univ.logo} alt="" fill className="object-contain" sizes="32px" /> : (univ.name[0] || 'U')}
                                  </div>
                                  <div>
                                    <p className="text-sm font-bold text-slate-800">{univ.name}</p>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                      <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Partner:</span>
                                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{univ.partner?.name || 'Direct / None'}</span>
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="p-4 text-center">
                                <span className="text-sm font-black text-slate-700 font-tabular">
                                  {univ.partnershipAmount ? `${COUNTRIES.find(c => c.name === univ.country)?.currencySymbol || '$'} ${Number(univ.partnershipAmount).toLocaleString()}` : '-'}
                                </span>
                              </td>
                              <td className="p-4 text-center">
                                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                                  univ.commissionType === 'Percentage' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'
                                }`}>
                                  {univ.commissionType || 'Percentage'}
                                </span>
                              </td>
                              <td className="p-4 text-center">
                                <span className="text-sm font-black text-slate-700 font-tabular">
                                  {univ.commissionValue ? (univ.commissionType === 'Flat' ? Number(univ.commissionValue).toLocaleString() : `${univ.commissionValue}%`) : '-'}
                                </span>
                              </td>
                              <td className="p-4 text-right pr-6">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{univ.commissionCurrency || '-'}</span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <div className="p-6 bg-indigo-50 border border-indigo-100 rounded-2xl flex gap-5 mt-8">
                <div className="size-12 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm flex-shrink-0">
                  <LayoutGrid size={24} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-indigo-900 mb-1">Partnership Management</h4>
                  <p className="text-xs text-indigo-700 leading-relaxed">
                    The partnership amounts and commission structures displayed above are configured during university registration. These values are used to calculate revenue projections and agent payouts for successful student enrollments.
                  </p>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'branches' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Branch Management</h2>
                  <p className="text-sm text-slate-500 mt-1">Manage your consultancy office locations and branches.</p>
                </div>
                {locSettings.enableBranches ? (
                  <button type="button" 
                    onClick={() => setShowAddBranch(true)}
                    className="btn-primary flex items-center gap-2"
                  >
                    <Plus size={18} />
                    Add Branch
                  </button>
                ) : (
                  <div className="px-4 py-2 bg-amber-50 text-amber-700 text-xs font-bold rounded-xl border border-amber-100">
                    Branches Disabled in Localization
                  </div>
                )}
              </div>

              {!locSettings.enableBranches && (
                <div className="card p-12 text-center bg-slate-50/50 border-dashed border-2 border-slate-200">
                  <div className="size-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-4">
                    <MapPin size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-700">Branches Feature is Disabled</h3>
                  <p className="text-sm text-slate-500 max-w-sm mx-auto mt-2 mb-6">
                    To manage multiple branches, you first need to enable the "Multi-branch Management" toggle in the Localization settings.
                  </p>
                  <button type="button" 
                    onClick={() => handleTabChange('localization')}
                    className="btn-secondary text-indigo-600 border-indigo-100 hover:bg-indigo-50"
                  >
                    Go to Localization Settings
                  </button>
                </div>
              )}

              {locSettings.enableBranches && (
                <>
                  {showAddBranch && (
                    <div className="card p-6 border-2 border-indigo-100 animate-slide-down">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-slate-800">Add New Branch</h3>
                        <button type="button" onClick={() => setShowAddBranch(false)} className="text-slate-400 hover:text-slate-600">
                          <X size={20} />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                        <label htmlFor="settings-addBranch-name" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Branch Name</label>
                        <input 
                          id="settings-addBranch-name"
                          type="text" 
                          value={newBranch.name}
                          onChange={e => setNewBranch({ ...newBranch, name: e.target.value })}
                          placeholder="e.g. London Head Office"
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label htmlFor="settings-addBranch-location" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Location / Address</label>
                        <input 
                          id="settings-addBranch-location"
                          type="text" 
                          value={newBranch.location}
                          onChange={e => setNewBranch({ ...newBranch, location: e.target.value })}
                          placeholder="e.g. 123 Baker St, London"
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label htmlFor="settings-addBranch-manager" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Branch Manager</label>
                        <input 
                          id="settings-addBranch-manager"
                          type="text" 
                          value={newBranch.manager}
                          onChange={e => setNewBranch({ ...newBranch, manager: e.target.value })}
                          placeholder="Manager Name"
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label htmlFor="settings-addBranch-email" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Contact Email</label>
                        <input 
                          id="settings-addBranch-email"
                          type="email" 
                          value={newBranch.email}
                          onChange={e => setNewBranch({ ...newBranch, email: e.target.value })}
                          placeholder="branch@example.com"
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label htmlFor="settings-addBranch-phone" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Phone Number</label>
                        <input 
                          id="settings-addBranch-phone"
                          type="text" 
                          value={newBranch.phone}
                          onChange={e => setNewBranch({ ...newBranch, phone: e.target.value })}
                          placeholder="+44 ..."
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label htmlFor="settings-addBranch-status" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Status</label>
                        <select 
                          id="settings-addBranch-status"
                          value={newBranch.status}
                          onChange={e => setNewBranch({ ...newBranch, status: e.target.value })}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none"
                        >
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="settings-addBranch-latitude" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Latitude (geofence)</label>
                        <input
                          id="settings-addBranch-latitude"
                          type="number"
                          step="any"
                          value={newBranch.latitude}
                          onChange={e => setNewBranch({ ...newBranch, latitude: e.target.value })}
                          placeholder="e.g. 40.7128"
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                        />
                      </div>
                      <div>
                        <label htmlFor="settings-addBranch-longitude" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Longitude (geofence)</label>
                        <input
                          id="settings-addBranch-longitude"
                          type="number"
                          step="any"
                          value={newBranch.longitude}
                          onChange={e => setNewBranch({ ...newBranch, longitude: e.target.value })}
                          placeholder="e.g. -74.0060"
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                        />
                        </div>
                      </div>
                      <div className="flex justify-end gap-3">
                        <button type="button" onClick={() => setShowAddBranch(false)} className="btn-secondary">Cancel</button>
                        <button type="button" onClick={handleAddBranch} className="btn-primary">Add Branch</button>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    {branches.length === 0 ? (
                      <div className="col-span-full py-12 text-center text-slate-400">
                        No branches found. Add your first branch location.
                      </div>
                    ) : (
                      branches.map((branch) => (
                        <div key={branch.id} className="card p-6 group hover:shadow-lg transition-all duration-300 shadow-[inset_0_0_0_1px_theme(colors.indigo.200)]">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="font-bold text-slate-800 text-lg">{branch.name}</h3>
                              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                                <MapPin size={12} className="text-slate-400" />
                                {branch.location || 'No address provided'}
                              </div>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button type="button" 
                                onClick={() => setEditingBranch(branch)}
                                className="p-2 text-indigo-800 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                              >
                                <Edit2 size={18} />
                              </button>
                              <button type="button" 
                                onClick={() => handleDeleteBranch(branch.id)}
                                className="p-2 text-red-800 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-y-3 mt-4 pt-4 border-t border-slate-50">
                            <div className="space-y-1">
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Manager</p>
                              <p className="text-xs font-semibold text-slate-700">{branch.manager || 'N/A'}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</p>
                              <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                branch.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                              }`}>
                                {branch.status}
                              </span>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email</p>
                              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                                <Mail size={12} className="text-slate-400" />
                                {branch.email || 'N/A'}
                              </div>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Phone</p>
                              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                                <Phone size={12} className="text-slate-400" />
                                {branch.phone || 'N/A'}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}

              {editingBranch && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                  <button type="button" className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setEditingBranch(null)} />
                  <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg animate-slide-up overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                      <h3 className="text-base font-bold text-slate-800">Edit Branch Details</h3>
                      <button type="button" onClick={() => setEditingBranch(null)} className="text-slate-400 hover:text-slate-600 transition-colors p-1"><X size={18} /></button>
                    </div>
                    <div className="p-6 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                          <label htmlFor="settings-editBranch-name" className="block text-xs font-semibold text-slate-600 mb-1.5">Branch Name</label>
                          <input
                            id="settings-editBranch-name"
                            type="text"
                            value={editingBranch.name}
                            onChange={(e) => setEditingBranch({ ...editingBranch, name: e.target.value })}
                            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
                          />
                        </div>
                        <div className="col-span-2">
                          <label htmlFor="settings-editBranch-location" className="block text-xs font-semibold text-slate-600 mb-1.5">Location</label>
                          <input
                            id="settings-editBranch-location"
                            type="text"
                            value={editingBranch.location}
                            onChange={(e) => setEditingBranch({ ...editingBranch, location: e.target.value })}
                            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
                          />
                        </div>
                        <div>
                          <label htmlFor="settings-editBranch-manager" className="block text-xs font-semibold text-slate-600 mb-1.5">Manager</label>
                          <input
                            id="settings-editBranch-manager"
                            type="text"
                            value={editingBranch.manager}
                            onChange={(e) => setEditingBranch({ ...editingBranch, manager: e.target.value })}
                            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
                          />
                        </div>
                        <div>
                          <label htmlFor="settings-editBranch-status" className="block text-xs font-semibold text-slate-600 mb-1.5">Status</label>
                          <select
                            id="settings-editBranch-status"
                            value={editingBranch.status}
                            onChange={(e) => setEditingBranch({ ...editingBranch, status: e.target.value })}
                            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
                          >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                          </select>
                        </div>
                        <div>
                          <label htmlFor="settings-editBranch-email" className="block text-xs font-semibold text-slate-600 mb-1.5">Email</label>
                          <input
                            id="settings-editBranch-email"
                            type="email"
                            value={editingBranch.email}
                            onChange={(e) => setEditingBranch({ ...editingBranch, email: e.target.value })}
                            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
                          />
                        </div>
                        <div>
                          <label htmlFor="settings-editBranch-phone" className="block text-xs font-semibold text-slate-600 mb-1.5">Phone</label>
                          <input
                            id="settings-editBranch-phone"
                            type="text"
                            value={editingBranch.phone}
                            onChange={(e) => setEditingBranch({ ...editingBranch, phone: e.target.value })}
                            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
                          />
                        </div>
                        <div>
                          <label htmlFor="settings-editBranch-latitude" className="block text-xs font-semibold text-slate-600 mb-1.5">Latitude (geofence)</label>
                          <input
                            id="settings-editBranch-latitude"
                            type="number"
                            step="any"
                            value={editingBranch.latitude ?? ''}
                            onChange={(e) => setEditingBranch({ ...editingBranch, latitude: e.target.value ? parseFloat(e.target.value) : null })}
                            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
                          />
                        </div>
                        <div>
                          <label htmlFor="settings-editBranch-longitude" className="block text-xs font-semibold text-slate-600 mb-1.5">Longitude (geofence)</label>
                          <input
                            id="settings-editBranch-longitude"
                            type="number"
                            step="any"
                            value={editingBranch.longitude ?? ''}
                            onChange={(e) => setEditingBranch({ ...editingBranch, longitude: e.target.value ? parseFloat(e.target.value) : null })}
                            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-slate-50">
                        <button type="button" onClick={() => setEditingBranch(null)} className="btn-secondary">Cancel</button>
                        <button type="button" onClick={handleUpdateBranch} className="btn-primary">Update Branch</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SettingsContent() {
  return (
    <Suspense fallback={<div className="p-8 text-slate-400">Loading settingsâ€¦</div>}>
      <SettingsContentInternal />
    </Suspense>
  );
}
