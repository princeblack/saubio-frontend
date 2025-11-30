import Link from 'next/link';

export default function ClientHomePage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Client navigation</h1>
      <Link href="/client/payments/mandates" className="text-saubio-forest underline">
        Mandats & paiements
      </Link>
    </div>
  );
}
