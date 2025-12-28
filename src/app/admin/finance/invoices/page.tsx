'use client';

import { useMemo, useState } from 'react';
import { SurfaceCard, Skeleton, PrimaryButton } from '@saubio/ui';
import { useAdminFinanceInvoices, formatEuro, formatDateTime } from '@saubio/utils';
import { ErrorState } from '../../../../components/feedback/ErrorState';

const defaultRange = () => {
  const to = new Date();
  const from = new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000);
  const fmt = (date: Date) => date.toISOString().split('T')[0]!;
  return { from: fmt(from), to: fmt(to) };
};

const cents = (value: number) => formatEuro(value / 100);

const statusTone = (status: string) => {
  if (status === 'paid' || status === 'captured' || status === 'released') return 'bg-emerald-50 border-emerald-200 text-emerald-700';
  if (status === 'pending' || status === 'processing') return 'bg-amber-50 border-amber-200 text-amber-700';
  if (status === 'failed' || status === 'disputed') return 'bg-rose-50 border-rose-200 text-rose-700';
  if (status === 'refunded') return 'bg-sky-50 border-sky-200 text-sky-700';
  return 'bg-slate-100 border-slate-200 text-saubio-slate';
};

export default function AdminInvoicesPage() {
  const [range, setRange] = useState(defaultRange());
  const [search, setSearch] = useState('');
  const invoicesQuery = useAdminFinanceInvoices({
    from: range.from,
    to: range.to,
    search: search || undefined,
  });
  const { data, isLoading, isError } = invoicesQuery;

  const clientInvoices = data?.clientInvoices ?? [];
  const providerStatements = data?.providerStatements ?? [];

  const totals = useMemo(() => {
    const clientTotal = clientInvoices.reduce((acc, invoice) => acc + invoice.amountCents, 0);
    const payoutTotal = providerStatements.reduce((acc, statement) => acc + statement.amountCents, 0);
    return { clientTotal, payoutTotal };
  }, [clientInvoices, providerStatements]);

  const handleRangeChange = (partial: Partial<typeof range>) => {
    setRange((prev) => ({ ...prev, ...partial }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    invoicesQuery.refetch();
  };

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Finances & Paiements</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Factures & relevés</h1>
        <p className="text-sm text-saubio-slate/70">
          Consultez les factures clients générées (paiements réussis) et les relevés prestataires issus des versements.
        </p>
      </header>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <form className="grid gap-4 md:grid-cols-2 lg:grid-cols-4" onSubmit={handleSubmit}>
          <div className="text-sm text-saubio-slate/70">
            <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Recherche</p>
            <input
              type="text"
              value={search}
              placeholder="ID, email, prestataire…"
              onChange={(event) => setSearch(event.target.value)}
              className="mt-1 w-full rounded-2xl border border-saubio-forest/10 px-3 py-2"
            />
          </div>
          <div className="text-sm text-saubio-slate/70">
            <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Du</p>
            <input
              type="date"
              value={range.from}
              onChange={(event) => handleRangeChange({ from: event.target.value || range.from })}
              className="mt-1 w-full rounded-2xl border border-saubio-forest/10 px-3 py-2"
            />
          </div>
          <div className="text-sm text-saubio-slate/70">
            <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Au</p>
            <input
              type="date"
              value={range.to}
              onChange={(event) => handleRangeChange({ to: event.target.value || range.to })}
              className="mt-1 w-full rounded-2xl border border-saubio-forest/10 px-3 py-2"
            />
          </div>
          <div className="flex items-end">
            <PrimaryButton type="submit" className="w-full">
              Actualiser
            </PrimaryButton>
          </div>
        </form>
      </SurfaceCard>

      {isError ? (
        <ErrorState
          title="Impossible de charger les factures"
          description="Merci de réessayer dans quelques instants."
          onRetry={() => invoicesQuery.refetch()}
        />
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
          <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Total factures clients</p>
          <p className="text-3xl font-semibold text-saubio-forest">
            {isLoading && !data ? <Skeleton className="h-8 w-40" /> : cents(totals.clientTotal)}
          </p>
          <p className="text-xs text-saubio-slate/60">{clientInvoices.length} facture(s) sur la période</p>
        </SurfaceCard>
        <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
          <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Total relevés prestataires</p>
          <p className="text-3xl font-semibold text-saubio-forest">
            {isLoading && !data ? <Skeleton className="h-8 w-40" /> : cents(totals.payoutTotal)}
          </p>
          <p className="text-xs text-saubio-slate/60">{providerStatements.length} relevé(s) sur la période</p>
        </SurfaceCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-saubio-forest">Factures clients</p>
            <span className="text-xs text-saubio-slate/60">{clientInvoices.length} résultat(s)</span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-saubio-slate/80">
              <thead>
                <tr className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
                  <th className="px-3 py-2 text-left font-semibold">ID</th>
                  <th className="px-3 py-2 text-left font-semibold">Client</th>
                  <th className="px-3 py-2 text-left font-semibold">Réservation</th>
                  <th className="px-3 py-2 text-left font-semibold">Montant</th>
                  <th className="px-3 py-2 text-left font-semibold">TVA</th>
                  <th className="px-3 py-2 text-left font-semibold">Statut</th>
                  <th className="px-3 py-2 text-left font-semibold">Date</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && !data
                  ? Array.from({ length: 5 }).map((_, index) => (
                      <tr key={`invoice-skeleton-${index}`} className="border-b border-saubio-forest/5">
                        <td className="px-3 py-4" colSpan={7}>
                          <Skeleton className="h-6 w-full" />
                        </td>
                      </tr>
                    ))
                  : null}
                {clientInvoices.length === 0 && !isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-3 py-6 text-center text-saubio-slate/60">
                      Aucune facture sur la période sélectionnée.
                    </td>
                  </tr>
                ) : null}
                {clientInvoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b border-saubio-forest/5 last:border-none">
                    <td className="px-3 py-2 font-semibold text-saubio-forest">{invoice.id}</td>
                    <td className="px-3 py-2">
                      <p className="font-semibold text-saubio-forest">{invoice.client.name}</p>
                      <p className="text-xs text-saubio-slate/60">{invoice.client.email}</p>
                    </td>
                    <td className="px-3 py-2">{invoice.bookingId ?? '—'}</td>
                    <td className="px-3 py-2">{cents(invoice.amountCents)}</td>
                    <td className="px-3 py-2">{invoice.taxCents ? cents(invoice.taxCents) : '—'}</td>
                    <td className="px-3 py-2">
                      <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusTone(invoice.status)}`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-saubio-slate/60">{formatDateTime(invoice.issuedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SurfaceCard>

        <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-saubio-forest">Relevés prestataires</p>
            <span className="text-xs text-saubio-slate/60">{providerStatements.length} résultat(s)</span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-saubio-slate/80">
              <thead>
                <tr className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
                  <th className="px-3 py-2 text-left font-semibold">Prestataire</th>
                  <th className="px-3 py-2 text-left font-semibold">Montant</th>
                  <th className="px-3 py-2 text-left font-semibold">Statut</th>
                  <th className="px-3 py-2 text-left font-semibold">Date</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && !data
                  ? Array.from({ length: 5 }).map((_, index) => (
                      <tr key={`statement-skeleton-${index}`} className="border-b border-saubio-forest/5">
                        <td className="px-3 py-4" colSpan={4}>
                          <Skeleton className="h-6 w-full" />
                        </td>
                      </tr>
                    ))
                  : null}
                {providerStatements.length === 0 && !isLoading ? (
                  <tr>
                    <td colSpan={4} className="px-3 py-6 text-center text-saubio-slate/60">
                      Aucun relevé de payout sur la période.
                    </td>
                  </tr>
                ) : null}
                {providerStatements.map((statement) => (
                  <tr key={statement.id} className="border-b border-saubio-forest/5 last:border-none">
                    <td className="px-3 py-2">
                      <p className="font-semibold text-saubio-forest">{statement.provider.name}</p>
                      <p className="text-xs text-saubio-slate/60">{statement.provider.email}</p>
                    </td>
                    <td className="px-3 py-2">{cents(statement.amountCents)}</td>
                    <td className="px-3 py-2">
                      <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusTone(statement.status)}`}>
                        {statement.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-saubio-slate/60">
                      {statement.releasedAt ? formatDateTime(statement.releasedAt) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SurfaceCard>
      </div>
    </div>
  );
}
