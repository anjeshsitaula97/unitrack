import AppLayoutWrapper from '@/components/AppLayoutWrapper';
import TicketsContent from './components/TicketsContent';

export const metadata = {
  title: 'Tickets | UniTrack',
  description: 'UniTrack administration - Tickets',
};

export default function TicketsPage() {
  return (
    <AppLayoutWrapper>
      <div className="p-6 max-w-[1600px] mx-auto">
        <TicketsContent />
      </div>
    </AppLayoutWrapper>
  );
}
