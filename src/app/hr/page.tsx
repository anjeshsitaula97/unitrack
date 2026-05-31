import React from 'react';
import AppLayoutWrapper from '@/components/AppLayoutWrapper';
import HRDashboard from './components/HRDashboard';

export const metadata = {
  title: 'HR Dashboard | UniTrack',
  description: 'UniTrack administration - HR Dashboard',
};

export default function HRPage() {
  return (
    <AppLayoutWrapper>
      <HRDashboard />
    </AppLayoutWrapper>
  );
}
