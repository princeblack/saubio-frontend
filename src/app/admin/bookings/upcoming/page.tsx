import { BookingsListView } from '../_components/BookingsListView';

const todayIso = new Date().toISOString().split('T')[0]!;

export default function AdminUpcomingBookingsPage() {
  return (
    <BookingsListView
      title="Réservations à venir"
      description="Toutes les missions planifiées à partir d’aujourd’hui pour anticiper les besoins Ops."
      initialFilters={{
        statuses: ['pending_provider', 'pending_client', 'confirmed', 'in_progress'],
        startFrom: todayIso,
      }}
      emptyMessage="Aucune mission future ne correspond à vos critères."
    />
  );
}
