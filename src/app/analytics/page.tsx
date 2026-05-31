import React from 'react';
import AppLayoutWrapper from '@/components/AppLayoutWrapper';
import AnalyticsContent from './components/AnalyticsContent';

export const metadata = {
  title: 'Analytics | UniTrack',
  description: 'UniTrack administration - Analytics',
};

export default function AnalyticsPage() {
  return (
    <AppLayoutWrapper>
      <AnalyticsContent />
    </AppLayoutWrapper>
  );
}
