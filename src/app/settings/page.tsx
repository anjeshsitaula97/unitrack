import React from 'react';
import AppLayoutWrapper from '@/components/AppLayoutWrapper';
import SettingsContent from './components/SettingsContent';

export const metadata = {
  title: 'Settings | UniTrack',
  description: 'UniTrack administration - Settings',
};

export default function SettingsPage() {
  return (
    <AppLayoutWrapper>
      <SettingsContent />
    </AppLayoutWrapper>
  );
}
