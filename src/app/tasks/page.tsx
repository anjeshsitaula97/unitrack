import AppLayoutWrapper from '@/components/AppLayoutWrapper';
import WorkflowContent from './components/WorkflowContent';

export const metadata = {
  title: 'Visa Workflow | UniTrack',
  description: 'UniTrack administration - Visa Workflow',
};

export default function WorkflowPage() {
  return (
    <AppLayoutWrapper>
      <WorkflowContent />
    </AppLayoutWrapper>
  );
}
