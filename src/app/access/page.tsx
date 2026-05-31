import React from 'react';
import AppLayoutWrapper from '@/components/AppLayoutWrapper';
import AccessContent from './components/AccessContent';

export const metadata = {
  title: 'Access Control | UniTrack',
  description: 'UniTrack administration - Access Control',
};

export default function AccessPage() {
  return (
    <AppLayoutWrapper>
      <AccessContent />
    </AppLayoutWrapper>
  );
}
