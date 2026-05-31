import React from 'react';
import AppLayoutWrapper from '@/components/AppLayoutWrapper';
import LeaveContent from './components/LeaveContent';

export const metadata = {
  title: 'Leave Management | UniTrack',
  description: 'UniTrack administration - Leave Management',
};

export default function LeavePage() {
  return (
    <AppLayoutWrapper>
      <LeaveContent />
    </AppLayoutWrapper>
  );
}
