import React from 'react';
import AppLayoutWrapper from '@/components/AppLayoutWrapper';
import StaffContent from './components/StaffContent';

export const metadata = {
  title: 'Staff | UniTrack',
  description: 'UniTrack administration - Staff',
};

export default function StaffPage() {
  return (
    <AppLayoutWrapper>
      <StaffContent />
    </AppLayoutWrapper>
  );
}
