import React from 'react';
import AppLayoutWrapper from '@/components/AppLayoutWrapper';
import EmployeesContent from './components/EmployeesContent';

export const metadata = {
  title: 'Employees | UniTrack',
  description: 'UniTrack administration - Employees',
};

export default function EmployeesPage() {
  return (
    <AppLayoutWrapper>
      <EmployeesContent />
    </AppLayoutWrapper>
  );
}
