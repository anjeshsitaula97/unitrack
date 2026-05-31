import React from 'react';
import AppLayoutWrapper from '@/components/AppLayoutWrapper';
import StudentContent from './components/StudentContent';

export const metadata = {
  title: 'Students | UniTrack',
  description: 'Manage student applications and documents.',
};

export default function StudentsPage() {
  return (
    <AppLayoutWrapper>
      <StudentContent />
    </AppLayoutWrapper>
  );
}
