import React from 'react';
import AppLayoutWrapper from '@/components/AppLayoutWrapper';
import ReportsContent from './components/ReportsContent';

export const metadata = {
  title: 'Reports | UniTrack',
  description: 'UniTrack administration - Reports',
};

export default function ReportsPage() {
  return (
    <AppLayoutWrapper>
      <ReportsContent />
    </AppLayoutWrapper>
  );
}
