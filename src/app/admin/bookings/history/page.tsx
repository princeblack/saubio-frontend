import { BookingsListView } from '../_components/BookingsListView';

const now = new Date();
const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
const historyStart = thirtyDaysAgo.toISOString().split('T')[0]!;
const historyEnd = now.toISOString().split('T')[0]!;

export default function AdminBookingsHistoryPage() {
  return (
    <BookingsListView
      title="Historique & missions terminées"
      description="Archivage détaillé des prestations livrées pour vérifier la qualité, les paiements et les avis."
      initialFilters={{
        statuses: ['completed'],
        startFrom: historyStart,
        startTo: historyEnd,
      }}
      emptyMessage="Aucune mission terminée sur la période sélectionnée."
    />
  );
}
