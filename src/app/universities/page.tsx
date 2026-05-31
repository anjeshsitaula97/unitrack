import React from 'react';
import AppLayoutWrapper from '@/components/AppLayoutWrapper';
import UniversitiesContent from './components/UniversitiesContent';

export const metadata = {
  title: 'Universities | UniTrack',
  description: 'UniTrack administration - Universities',
};

export default function UniversitiesPage() {
  return (
    <AppLayoutWrapper>
      <UniversitiesContent />
    </AppLayoutWrapper>
  );
}