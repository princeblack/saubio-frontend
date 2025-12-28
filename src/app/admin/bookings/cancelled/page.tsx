import { BookingsListView } from '../_components/BookingsListView';

const now = new Date();
const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

export default function AdminCancelledBookingsPage() {
  return (
    <BookingsListView
      title="Annulées & échouées"
      description="Suivi des dossiers clients/prestataires ayant abouti à une annulation ou un litige."
      initialFilters={{
        statuses: ['cancelled', 'disputed'],
        startFrom: ninetyDaysAgo.toISOString().split('T')[0]!,
      }}
      emptyMessage="Aucune annulation détectée sur la période."
    />
  );
}
