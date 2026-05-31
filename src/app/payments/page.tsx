import React from 'react';
import AppLayoutWrapper from '@/components/AppLayoutWrapper';
import PaymentsContent from './components/PaymentsContent';

export const metadata = {
  title: 'Payments | UniTrack',
  description: 'UniTrack administration - Payments',
};

export default function PaymentsPage() {
  return (
    <AppLayoutWrapper>
      <PaymentsContent />
    </AppLayoutWrapper>
  );
}
