import React from 'react';
import AppLayoutWrapper from '@/components/AppLayoutWrapper';
import FeaturedContent from './components/FeaturedContent';

export const metadata = {
  title: 'Featured Universities | UniTrack',
  description: 'UniTrack administration - Featured Universities',
};

export default function FeaturedPage() {
  return (
    <AppLayoutWrapper>
      <FeaturedContent />
    </AppLayoutWrapper>
  );
}
