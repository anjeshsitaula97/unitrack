import React from 'react';
import AppLayoutWrapper from '@/components/AppLayoutWrapper';
import FileManager from './components/FileManager';

export const metadata = {
  title: 'Files | UniTrack',
  description: 'Manage files and folders',
};

export default function FilesPage() {
  return (
    <AppLayoutWrapper>
      <FileManager />
    </AppLayoutWrapper>
  );
}
