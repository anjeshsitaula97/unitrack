import React from 'react';
import AppLayoutWrapper from '@/components/AppLayoutWrapper';
import UniversityForm from '../components/UniversityForm';

export const metadata = {
  title: 'Add University | UniTrack',
  description: 'UniTrack administration - Add University',
};

export default function AddUniversityPage() {
  return (
    <AppLayoutWrapper>
      <UniversityForm />
    </AppLayoutWrapper>
  );
}
