import React from 'react';
import AppLayoutWrapper from '@/components/AppLayoutWrapper';
import PayrollContent from './components/PayrollContent';

export const metadata = {
  title: 'Payroll | UniTrack',
  description: 'UniTrack administration - Payroll',
};

export default function PayrollPage() {
  return (
    <AppLayoutWrapper>
      <PayrollContent />
    </AppLayoutWrapper>
  );
}
