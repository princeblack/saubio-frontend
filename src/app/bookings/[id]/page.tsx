import { redirect } from 'next/navigation';

export default function LegacyBookingDetail({ params }: { params: { id: string } }) {
  redirect(`/client/bookings/${params.id}`);
}
