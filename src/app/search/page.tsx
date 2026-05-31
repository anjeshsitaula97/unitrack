import React from 'react';
import AppLayoutWrapper from '@/components/AppLayoutWrapper';
import SearchContent from './components/SearchContent';

export const metadata = {
  title: 'Search | UniTrack',
  description: 'UniTrack administration - Search',
};

export default function SearchPage() {
  return (
    <AppLayoutWrapper>
      <SearchContent />
    </AppLayoutWrapper>
  );
}
