import { redirect } from 'next/navigation';

export default function ClientBookingRedirectPage() {
  redirect('/bookings/new');
}
