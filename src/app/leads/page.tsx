import React from 'react';
import AppLayoutWrapper from '@/components/AppLayoutWrapper';
import LeadsContent from './components/LeadsContent';

export const metadata = {
  title: 'Leads | UniTrack',
  description: 'UniTrack administration - Leads',
};

export default function LeadsPage() {
  return (
    <AppLayoutWrapper>
      <LeadsContent />
    </AppLayoutWrapper>
  );
}
