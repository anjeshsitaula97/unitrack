import React from 'react';
import AppLayoutWrapper from '@/components/AppLayoutWrapper';
import ApplicationsContent from './components/ApplicationsContent';

export const metadata = {
  title: 'Applications | UniTrack',
  description: 'UniTrack administration - Applications',
};

export default function ApplicationsPage() {
  return (
    <AppLayoutWrapper>
      <ApplicationsContent />
    </AppLayoutWrapper>
  );
}
