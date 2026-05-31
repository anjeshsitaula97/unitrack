'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from './AppLayout';

export default function AppLayoutWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [role, setRole] = useState<'admin' | 'student' | 'staff'>('student');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUser(data);
          setRole(data.role?.toLowerCase() as any || 'student');
        } else if (res.status === 401) {
          router.push('/login');
        }
      } catch (err) {
        console.error('Failed to fetch user:', err);
      }
    };
    fetchUser();
  }, [router]);

  return (
    <AppLayout role={role as any} onRoleChange={setRole} user={user}>
      {children}
    </AppLayout>
  );
}