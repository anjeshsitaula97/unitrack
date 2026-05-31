'use client';

import React, { useState, useEffect } from 'react';
import { redirect } from 'next/navigation';
import AppLayout from './AppLayout';

export default function AppLayoutWrapper({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<'admin' | 'student' | 'staff' | undefined>(undefined);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    let needsRedirect = false;
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUser(data);
          setRole(data.role?.toLowerCase() as any || 'student');
        } else if (res.status === 401) {
          needsRedirect = true;
        }
      } catch (err) {
        console.error('Failed to fetch user:', err);
      }
      if (needsRedirect) redirect('/login');
    };
    fetchUser();
  }, []);

  return (
    <AppLayout role={role as any} onRoleChange={setRole} user={user}>
      {children}
    </AppLayout>
  );
}