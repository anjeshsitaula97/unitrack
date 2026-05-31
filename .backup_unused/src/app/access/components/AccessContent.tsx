'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Search, Plus, MoreHorizontal, UserCheck, Mail, ShieldAlert, X, Loader2, Trash2, Clock, Activity, Monitor, Shield, Calendar, Globe } from 'lucide-react';
import { toast } from 'sonner';

export default function AccessContent() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  
  useEffect(() => {
    const ac = new AbortController();
    fetch('/api/access', { signal: ac.signal })
      .then(res => {
        if (!res.ok) throw new Error('API Error');
        return res.json();
      })
      .then(data => {
        setUsers(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (err?.name !== 'AbortError') {
          toast.error('Failed to load user access database');
          setUsers([]);
        }
      })
      .finally(() => {
        setIsLoadingData(false);
      });
    return () => ac.abort();
  }, []);

  const [search, setSearch] = useState('');
  
  // Modal states
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Editor');
  const [autoGeneratePassword, setAutoGeneratePassword] = useState(true);
  const [manualPassword, setManualPassword] = useState('');
  const [generateApiKey, setGenerateApiKey] = useState(false);
  const [viewingUser, setViewingUser] = useState<any | null>(null);
  const [userDetails, setUserDetails] = useState<any | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const fetchUserDetails = async (id: string) => {
    setIsLoadingDetails(true);
    try {
      const res = await fetch(`/api/access/${id}/details`);
      if (res.ok) {
        const data = await res.json();
        setUserDetails(data);
      } else {
        toast.error('Failed to load user details');
      }
    } catch (err) {
      toast.error('Error connecting to backend');
    } finally {
      setIsLoadingDetails(false);
    }
  };

  useEffect(() => {
    if (viewingUser) {
      fetchUserDetails(viewingUser.id);
    } else {
      setUserDetails(null);
    }
  }, [viewingUser]);

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    
    try {
      const res = await fetch(`/api/access/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          role: editingUser.role,
          status: editingUser.status
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setUsers(users.map(u => u.id === updated.id ? updated : u));
        toast.success('User updated successfully');
        setEditingUser(null);
      } else {
        toast.error('Failed to update user');
      }
    } catch(err) {
      toast.error('Error connecting to backend');
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    
    try {
      const res = await fetch(`/api/access/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setUsers(users.filter(u => u.id !== id));
        toast.success('User deleted successfully');
      } else {
        toast.error('Failed to delete user');
      }
    } catch(err) {
      toast.error('Error connecting to backend');
    }
  };

  const filtered = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName || !inviteEmail) return;
    if (!autoGeneratePassword && !manualPassword) {
      toast.error('Please provide a password');
      return;
    }

    try {
      const res = await fetch('/api/access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: inviteName, 
          email: inviteEmail, 
          role: inviteRole,
          autoGeneratePassword,
          password: manualPassword,
          generateApiKey
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setUsers([data.user, ...users]); // optimistic local update
        
        let message = `Invitation sent to ${inviteEmail}`;
        if (data.generatedPassword) message += `. Temporary password: ${data.generatedPassword}`;
        if (data.apiKey) message += `. API Key generated.`;
        
        toast.success(message, {
          duration: 10000, // Show longer so they can copy
        });
        
        // Reset and close modal
        setInviteName('');
        setInviteEmail('');
        setInviteRole('Editor');
        setManualPassword('');
        setAutoGeneratePassword(true);
        setGenerateApiKey(false);
        setIsInviteModalOpen(false);
      } else {
        toast.error('Failed to send invitation');
      }
    } catch(err) {
      toast.error('Error connecting to backend');
    }
  };

  return (
    <div className="animate-fade-in relative block min-h-[400px]">
      {isLoadingData && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-xl">
          <Loader2 className="animate-spin text-indigo-500" size={32} />
        </div>
      )}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 mb-1">User Access Management</h1>
          <p className="text-sm text-slate-400">
            {filtered.length.toLocaleString()} users matching your current filters
          </p>
        </div>
        <button type="button" onClick={() => setIsInviteModalOpen(true)} className="btn-primary">
          <Plus size={15} /> Invite User
        </button>
      </div>

      <div className="card px-5 py-4 mb-5">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all"
          />
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50/60">
              <tr className="border-b border-slate-100">
                <th className="text-left py-3 px-5 text-[11px] font-semibold text-slate-400 uppercase">User</th>
                <th className="text-left py-3 px-5 text-[11px] font-semibold text-slate-400 uppercase">Role</th>
                <th className="text-left py-3 px-5 text-[11px] font-semibold text-slate-400 uppercase">Status</th>
                <th className="text-left py-3 px-5 text-[11px] font-semibold text-slate-400 uppercase">Connection</th>
                <th className="text-left py-3 px-5 text-[11px] font-semibold text-slate-400 uppercase">Last Login</th>
                <th className="text-left py-3 px-5 text-[11px] font-semibold text-slate-400 uppercase"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(user => (
                <tr 
                  key={user.id} 
                  className="hover:bg-slate-50 group cursor-pointer"
                  onClick={() => setViewingUser(user)}
                >
                  <td className="py-3 px-5">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 overflow-hidden relative">
                        {user.avatar && (user.avatar.startsWith('http') || user.avatar.startsWith('/') || user.avatar.startsWith('data:')) ? (
                          <Image src={user.avatar} alt={user.name} fill className="object-cover" sizes="32px" />
                        ) : (
                          user.avatar || (user.name ? user.name.substring(0, 2).toUpperCase() : '??')
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800 flex items-center gap-1 truncate">
                          {user.name} {user.role === 'Super Admin' && <ShieldAlert size={12} className="text-indigo-500 flex-shrink-0"/>}
                        </p>
                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-5 text-sm">
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-medium whitespace-nowrap">{user.role}</span>
                  </td>
                  <td className="py-3 px-5">
                    <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${user.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="py-3 px-5 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className={`size-2 rounded-full ${
                        user.lastSeenAt && (new Date().getTime() - new Date(user.lastSeenAt).getTime() < 5 * 60 * 1000)
                          ? 'bg-emerald-500 animate-pulse'
                          : 'bg-slate-300'
                      }`}></span>
                      <div className="flex flex-col">
                        <span className={`text-[10px] font-bold ${
                          user.lastSeenAt && (new Date().getTime() - new Date(user.lastSeenAt).getTime() < 5 * 60 * 1000)
                            ? 'text-emerald-600'
                            : 'text-slate-500'
                        }`}>
                          {user.lastSeenAt && (new Date().getTime() - new Date(user.lastSeenAt).getTime() < 5 * 60 * 1000) ? 'ONLINE' : 'OFFLINE'}
                        </span>
                        {user.loginLogs && user.loginLogs[0] && (
                          <span className="text-[10px] font-semibold text-slate-600 flex items-center gap-1 mt-0.5">
                            <Globe size={11} className="text-indigo-400" /> {user.loginLogs[0].ipAddress || '0.0.0.0'}
                          </span>
                        )}
                        {(!user.loginLogs || user.loginLogs.length === 0) && (
                          <span className="text-[9px] text-slate-400 italic mt-0.5">No IP logged</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-5 text-sm text-slate-500 whitespace-nowrap">{user.lastLogin}</td>
                  <td className="py-3 px-5 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100" onClick={(e) => e.stopPropagation()}>
                      <button type="button" aria-label="Resend Invite" className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400"><Mail size={14}/></button>
                      <button type="button" aria-label="Edit Permissions"
                        onClick={() => setEditingUser(user)}
                        className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400" 
                        title="Edit Permissions"
                      >
                        <UserCheck size={14}/>
                      </button>
                      <button type="button" aria-label="Delete User"
                        onClick={() => handleDeleteUser(user.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors" 
                        title="Delete User"
                      >
                        <Trash2 size={14}/>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite User Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button type="button" aria-label="Close" className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsInviteModalOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md animate-slide-up overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-800">Invite New User</h3>
              <button type="button" aria-label="Close"
                onClick={() => setIsInviteModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1"
              >
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleInviteUser} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Full Name</label>
                  <input
                    type="text"
                    required
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    placeholder="e.g. Jane Doe"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="jane@example.com"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Role Designation</label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
                  >
                    <option value="Super Admin">Super Admin</option>
                    <option value="Admin">Admin</option>
                    <option value="Editor">Editor</option>
                    <option value="Viewer">Viewer</option>
                  </select>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="autoGenPass"
                      checked={autoGeneratePassword}
                      onChange={(e) => setAutoGeneratePassword(e.target.checked)}
                      className="size-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="autoGenPass" className="text-sm font-medium text-slate-700">Auto-generate secure password</label>
                  </div>

                  {!autoGeneratePassword && (
                    <div className="pl-6 animate-fade-in">
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">Manual Password</label>
                      <input
                        type="password"
                        required
                        value={manualPassword}
                        onChange={(e) => setManualPassword(e.target.value)}
                        placeholder="Enter password"
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
                      />
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="genApiKey"
                      checked={generateApiKey}
                      onChange={(e) => setGenerateApiKey(e.target.checked)}
                      className="size-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="genApiKey" className="text-sm font-medium text-slate-700">Auto-generate API key for this user</label>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 mt-8">
                <button type="button" onClick={() => setIsInviteModalOpen(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Send Invite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button type="button" aria-label="Close" className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setEditingUser(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md animate-slide-up overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-800">Edit User Permissions</h3>
              <button type="button" aria-label="Close" onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-slate-600 transition-colors p-1"><X size={18} /></button>
            </div>
            
            <form onSubmit={handleUpdateUser} className="p-6">
              <div className="space-y-4">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
                  <div className="size-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold overflow-hidden relative">
                    {editingUser.avatar && (editingUser.avatar.startsWith('http') || editingUser.avatar.startsWith('/') || editingUser.avatar.startsWith('data:')) ? (
                      <Image src={editingUser.avatar} alt={editingUser.name} fill className="object-cover" sizes="40px" />
                    ) : (
                      editingUser.avatar || (editingUser.name ? editingUser.name.substring(0, 2).toUpperCase() : '??')
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{editingUser.name}</p>
                    <p className="text-xs text-slate-500">{editingUser.email}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Role Designation</label>
                  <select
                    value={editingUser.role}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
                  >
                    <option value="Super Admin">Super Admin</option>
                    <option value="Admin">Admin</option>
                    <option value="Editor">Editor</option>
                    <option value="Viewer">Viewer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Account Status</label>
                  <select
                    value={editingUser.status}
                    onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Pending">Pending</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 mt-8">
                <button type="button" onClick={() => setEditingUser(null)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Update User</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* User Details Modal */}
      {viewingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button type="button" aria-label="Close" className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setViewingUser(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-4xl animate-slide-up overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold text-lg">
                  {viewingUser.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">{viewingUser.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">{viewingUser.email}</span>
                    <span className="size-1 rounded-full bg-slate-300"></span>
                    <span className="text-xs font-medium text-indigo-600">{viewingUser.role}</span>
                    {userDetails && (
                      <>
                        <span className="size-1 rounded-full bg-slate-300"></span>
                        <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[10px] font-bold uppercase tracking-wider">
                          {userDetails.subscriptionPackage || 'Basic'} Plan
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {userDetails && (
                  <span className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
                    userDetails.lastSeenAt && (new Date().getTime() - new Date(userDetails.lastSeenAt).getTime() < 5 * 60 * 1000)
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'bg-slate-50 text-slate-500'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      userDetails.lastSeenAt && (new Date().getTime() - new Date(userDetails.lastSeenAt).getTime() < 5 * 60 * 1000)
                        ? 'bg-emerald-500 animate-pulse'
                        : 'bg-slate-400'
                    }`}></span>
                    {userDetails.lastSeenAt && (new Date().getTime() - new Date(userDetails.lastSeenAt).getTime() < 5 * 60 * 1000) ? 'Online Now' : 'Offline'}
                  </span>
                )}
                <button type="button" aria-label="Close" onClick={() => setViewingUser(null)} className="text-slate-400 hover:text-slate-600 p-1"><X size={20} /></button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              {isLoadingDetails ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <Loader2 className="animate-spin text-indigo-500" size={40} />
                  <p className="text-sm text-slate-500 font-medium">Loading history and logsâ€¦</p>
                </div>
              ) : userDetails ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Login History */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2 uppercase tracking-wider">
                        <Clock size={16} className="text-indigo-500" /> Login History
                      </h4>
                      <span className="text-[10px] font-bold bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded uppercase">Last 50 Logins</span>
                    </div>
                    <div className="space-y-3">
                      {userDetails.loginLogs?.length > 0 ? (
                        userDetails.loginLogs.map((log: any) => (
                          <div key={log.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between group hover:border-indigo-100 hover:bg-white transition-all shadow-sm">
                            <div className="flex items-center gap-3">
                              <div className="size-9 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-indigo-500 shadow-sm transition-colors">
                                <Monitor size={16} />
                              </div>
                              <div>
                                <p className="text-xs font-bold text-slate-700">{new Date(log.createdAt).toLocaleString()}</p>
                                <p className="text-[10px] font-bold text-indigo-600 flex items-center gap-1.5 mt-0.5">
                                  <Globe size={11} /> {log.ipAddress || 'Unknown IP'} 
                                  <span className="size-1 rounded-full bg-slate-300"></span>
                                  <span className="text-slate-400 font-medium">{log.userAgent?.includes('Windows') ? 'Windows' : log.userAgent?.includes('Mac') ? 'MacOS' : 'Mobile'}</span>
                                </p>
                              </div>
                            </div>
                            <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">SUCCESS</span>
                          </div>
                        ))
                      ) : (
                        <div className="py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                          <p className="text-xs text-slate-400">No login records found</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Activity Logs */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2 uppercase tracking-wider">
                        <Activity size={16} className="text-indigo-500" /> Activity Logs
                      </h4>
                      <span className="text-[10px] font-bold bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded uppercase">Full Audit Trail</span>
                    </div>
                    <div className="space-y-3 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-px before:bg-slate-100">
                      {userDetails.activities?.length > 0 ? (
                        userDetails.activities.map((act: any) => (
                          <div key={act.id} className="relative pl-9 group">
                            <div className={`absolute left-2.5 top-1.5 size-3 rounded-full border-2 border-white shadow-sm z-10 ${
                              act.action.includes('delete') ? 'bg-red-500' : act.action.includes('create') ? 'bg-emerald-500' : 'bg-indigo-500'
                            }`}></div>
                            <div className="p-3 bg-white border border-slate-100 rounded-xl group-hover:border-indigo-100 group-hover:shadow-sm transition-all">
                              <p className="text-xs font-bold text-slate-800">
                                {act.action} <span className="text-indigo-600">{act.target}</span>
                              </p>
                              <div className="flex items-center justify-between mt-1.5">
                                <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                                  <Calendar size={10} /> {new Date(act.createdAt).toLocaleString()}
                                </span>
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                                  act.action.includes('delete') ? 'text-red-600 bg-red-50' : act.action.includes('create') ? 'text-emerald-600 bg-emerald-50' : 'text-indigo-600 bg-indigo-50'
                                }`}>
                                  {act.action.split(' ')[0]}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                          <p className="text-xs text-slate-400">No activity logs found</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-20 text-center">
                  <p className="text-sm text-slate-400">No details available</p>
                </div>
              )}
            </div>
            
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-4 text-[11px] text-slate-400 font-medium">
                <span className="flex items-center gap-1"><Shield size={10} /> Admin Verified</span>
                <span className="flex items-center gap-1"><Monitor size={10} /> IP Tracking Active</span>
              </div>
              <button type="button" 
                onClick={() => setViewingUser(null)}
                className="px-4 py-1.5 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-50 transition-colors"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
