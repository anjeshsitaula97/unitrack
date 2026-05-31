import React from 'react';
import AppLayoutWrapper from '@/components/AppLayoutWrapper';
import AddCourseContent from '../../components/AddCourseContent';

export const metadata = {
  title: 'Edit Course | UniTrack',
  description: 'UniTrack administration - Edit Course',
};

export default async function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <AppLayoutWrapper>
      <AddCourseContent courseId={id} />
    </AppLayoutWrapper>
  );
}
