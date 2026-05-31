import AppLayoutWrapper from '@/components/AppLayoutWrapper';
import TasksContent from './components/TasksContent';

export const metadata = {
  title: 'Staff Tasks | UniTrack',
  description: 'UniTrack administration - Staff Tasks',
};

export default function StaffTasksPage() {
  return (
    <AppLayoutWrapper>
      <TasksContent />
    </AppLayoutWrapper>
  );
}
