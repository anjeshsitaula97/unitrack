import React from 'react';
import AppLayoutWrapper from '@/components/AppLayoutWrapper';
import DocumentScanner from './components/DocumentScanner';

export const metadata = {
  title: 'Document Scanner | UniTrack',
  description: 'Scan documents directly from your browser — nothing stored on your device',
};

export default function DocumentsPage() {
  return (
    <AppLayoutWrapper>
      <DocumentScanner />
    </AppLayoutWrapper>
  );
}
