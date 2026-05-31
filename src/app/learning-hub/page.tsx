import AppLayoutWrapper from '@/components/AppLayoutWrapper';
import LearningHubContent from './components/LearningHubContent';

export const metadata = {
  title: 'Learning Hub | UniTrack',
  description: 'UniTrack administration - Learning Hub',
};

export default function LearningHubPage() {
  return (
    <AppLayoutWrapper>
      <LearningHubContent />
    </AppLayoutWrapper>
  );
}
