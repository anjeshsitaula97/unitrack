import React from 'react';
import AppLayoutWrapper from '@/components/AppLayoutWrapper';
import AutomationsContent from './components/AutomationsContent';

export const metadata = {
  title: 'Automations | UniTrack',
  description: 'UniTrack administration - Automations',
};

export default function AutomationsPage() {
  return (
    <AppLayoutWrapper>
      <AutomationsContent />
    </AppLayoutWrapper>
  );
}
