import { redirect } from 'next/navigation';

export default function LegacyClientCheckoutAccountPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[]>;
}) {
  const entries = Object.entries(searchParams).flatMap(([key, value]) => {
    if (Array.isArray(value)) {
      return value.map((item) => [key, item] as const);
    }
    return [[key, value] as const];
  });
  const query = new URLSearchParams(entries as [string, string][]).toString();
  redirect(`/bookings/account${query ? `?${query}` : ''}`);
}
