'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { SupportCategory, SupportPriority, SupportStatus, SupportTicket } from '@saubio/models';
import {
  formatDateTime,
  useAddSupportMessageMutation,
  useCreateSupportTicketMutation,
  useRequireRole,
  useSupportTicket,
  useSupportTickets,
} from '@saubio/utils';
import { LoadingIndicator, SectionDescription, SectionTitle, SurfaceCard, Skeleton } from '@saubio/ui';
import { ErrorState } from '../../../components/feedback/ErrorState';

const priorityOptions: SupportPriority[] = ['low', 'medium', 'high', 'urgent'];
const categoryOptions: SupportCategory[] = ['onboarding', 'billing', 'incident', 'feature_request', 'other'];

const statusStyles: Record<SupportStatus, string> = {
  open: 'bg-saubio-mist text-saubio-forest',
  in_progress: 'bg-blue-100 text-blue-800',
  waiting_customer: 'bg-amber-100 text-amber-900',
  resolved: 'bg-green-100 text-green-800',
  closed: 'bg-slate-200 text-saubio-slate',
};

type TicketMessage = NonNullable<SupportTicket['messages']>[number];

const formatEnum = (value: string) =>
  value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());

const TicketListSkeleton = () => (
  <div className="flex flex-col gap-3">
    {Array.from({ length: 4 }).map((_, index) => (
      <Skeleton key={`ticket-skeleton-${index}`} className="h-28 rounded-2xl" />
    ))}
  </div>
);

const TicketDetailSkeleton = () => (
  <div className="flex flex-col gap-5 rounded-3xl border border-saubio-forest/10 bg-white p-5 shadow-soft-lg">
    <Skeleton className="h-6 w-1/2 rounded-2xl" />
    <Skeleton className="h-16 rounded-2xl" />
    <div className="space-y-3 rounded-2xl border border-saubio-forest/10 bg-saubio-mist/30 p-4">
      <Skeleton className="h-4 w-32 rounded-full" />
      <Skeleton className="h-12 rounded-2xl" />
      <Skeleton className="h-12 rounded-2xl" />
    </div>
    <Skeleton className="h-24 rounded-2xl" />
  </div>
);

export default function ClientSupportPage() {
  const { t } = useTranslation();
  const session = useRequireRole({ allowedRoles: ['client', 'company'] });
  const userId = session.user?.id;

  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [newTicket, setNewTicket] = useState({
    subject: '',
    description: '',
    category: 'other' as SupportCategory,
    priority: 'medium' as SupportPriority,
  });
  const [messageDraft, setMessageDraft] = useState('');

  const ticketsQuery = useSupportTickets();
  const ticketDetailQuery = useSupportTicket(selectedTicketId ?? undefined);

  const createTicketMutation = useCreateSupportTicketMutation();
  const addMessageMutation = useAddSupportMessageMutation();

  const tickets = ticketsQuery.data ?? [];
  const activeTicket: SupportTicket | undefined =
    ticketDetailQuery.data ?? tickets.find((ticket) => ticket.id === selectedTicketId);

  useEffect(() => {
    if (!selectedTicketId && tickets.length > 0) {
      setSelectedTicketId(tickets[0].id);
    }
  }, [tickets, selectedTicketId]);

  if (!session.user) {
    return null;
  }

  const handleCreateTicket = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!userId || !newTicket.subject.trim() || !newTicket.description.trim()) {
      return;
    }

    createTicketMutation.mutate(
      {
        subject: newTicket.subject.trim(),
        description: newTicket.description.trim(),
        category: newTicket.category,
        priority: newTicket.priority,
      },
      {
        onSuccess: (ticket) => {
          setNewTicket({ subject: '', description: '', category: 'other', priority: 'medium' });
          setSelectedTicketId(ticket.id);
        },
      }
    );
  };

  const handleSendMessage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!userId || !selectedTicketId || !messageDraft.trim()) {
      return;
    }

    addMessageMutation.mutate(
      {
        ticketId: selectedTicketId,
        content: messageDraft.trim(),
      },
      {
        onSuccess: () => setMessageDraft(''),
      }
    );
  };

  const renderTicketListItem = (ticket: SupportTicket) => {
    const isActive = ticket.id === selectedTicketId;
    return (
      <button
        key={ticket.id}
        type="button"
        onClick={() => setSelectedTicketId(ticket.id)}
        className={`flex flex-col rounded-2xl border px-4 py-3 text-left transition ${
          isActive
            ? 'border-saubio-forest bg-saubio-mist/60 shadow-soft-lg'
            : 'border-saubio-forest/10 bg-white/70 hover:border-saubio-forest/40'
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="line-clamp-1 font-semibold text-saubio-forest">{ticket.subject}</span>
          <span
            className={`inline-flex items-center rounded-full px-3 py-0.5 text-xs font-semibold ${
              statusStyles[ticket.status] ?? 'bg-slate-100 text-slate-700'
            }`}
          >
            {t(`support.status.${ticket.status}`, formatEnum(ticket.status))}
          </span>
        </div>
        <p className="mt-1 line-clamp-2 text-xs text-saubio-slate/70">{ticket.description}</p>
        <div className="mt-3 flex items-center justify-between text-[11px] uppercase tracking-wide text-saubio-slate/50">
          <span>
            {t('support.ticket.updated')} {formatDateTime(ticket.updatedAt)}
          </span>
          <span>{t(`support.priority.${ticket.priority}`, formatEnum(ticket.priority))}</span>
        </div>
      </button>
    );
  };

  const resolveAuthorName = (message: TicketMessage) => {
    const first = message.author?.firstName;
    const last = message.author?.lastName;
    if (first || last) {
      return [first, last].filter(Boolean).join(' ');
    }
    return message.author?.email ?? 'Saubio Care';
  };

  const listIsLoading = ticketsQuery.isLoading;
  const listHasError = ticketsQuery.isError;
  const detailIsLoading = ticketDetailQuery.isLoading && Boolean(selectedTicketId);
  const detailHasError = ticketDetailQuery.isError;

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <SectionTitle as="h1" size="large">
          {t('support.title')}
        </SectionTitle>
        <SectionDescription>{t('support.description')}</SectionDescription>
      </header>

      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="flex flex-col gap-6">
          <SurfaceCard variant="soft" padding="md">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-saubio-slate/60">
              {t('support.newTicket.title')}
            </h2>
            <form className="mt-4 space-y-4" onSubmit={handleCreateTicket}>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-saubio-slate/60">
                  {t('support.form.subject')}
                </label>
                <input
                  type="text"
                  value={newTicket.subject}
                  onChange={(event) =>
                    setNewTicket((current) => ({
                      ...current,
                      subject: event.target.value,
                    }))
                  }
                  className="mt-1 w-full rounded-xl border border-saubio-forest/20 bg-saubio-mist/30 px-3 py-2 text-sm text-saubio-forest outline-none transition focus:border-saubio-forest focus:ring-1 focus:ring-saubio-forest/40"
                  placeholder={t('support.form.subjectPlaceholder')}
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-saubio-slate/60">
                  {t('support.form.description')}
                </label>
                <textarea
                  value={newTicket.description}
                  onChange={(event) =>
                    setNewTicket((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  className="mt-1 w-full rounded-xl border border-saubio-forest/20 bg-saubio-mist/30 px-3 py-2 text-sm text-saubio-forest outline-none transition focus:border-saubio-forest focus:ring-1 focus:ring-saubio-forest/40"
                  placeholder={t('support.form.descriptionPlaceholder')}
                  rows={4}
                  required
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-saubio-slate/60">
                    {t('support.form.category')}
                  </label>
                  <select
                    value={newTicket.category}
                    onChange={(event) =>
                      setNewTicket((current) => ({
                        ...current,
                        category: event.target.value as SupportCategory,
                      }))
                    }
                    className="mt-1 w-full rounded-xl border border-saubio-forest/20 bg-saubio-mist/30 px-3 py-2 text-sm text-saubio-forest outline-none transition focus:border-saubio-forest focus:ring-1 focus:ring-saubio-forest/40"
                  >
                    {categoryOptions.map((category) => (
                      <option key={category} value={category}>
                        {t(`support.category.${category}`, formatEnum(category))}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-saubio-slate/60">
                    {t('support.form.priority')}
                  </label>
                  <select
                    value={newTicket.priority}
                    onChange={(event) =>
                      setNewTicket((current) => ({
                        ...current,
                        priority: event.target.value as SupportPriority,
                      }))
                    }
                    className="mt-1 w-full rounded-xl border border-saubio-forest/20 bg-saubio-mist/30 px-3 py-2 text-sm text-saubio-forest outline-none transition focus:border-saubio-forest focus:ring-1 focus:ring-saubio-forest/40"
                  >
                    {priorityOptions.map((priority) => (
                      <option key={priority} value={priority}>
                        {t(`support.priority.${priority}`, formatEnum(priority))}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                type="submit"
                className="w-full rounded-full bg-saubio-forest px-5 py-2 text-sm font-semibold text-white transition hover:bg-saubio-moss disabled:cursor-not-allowed disabled:opacity-60"
                disabled={createTicketMutation.isPending}
              >
                {createTicketMutation.isPending
                  ? t('support.form.creating')
                  : t('support.form.create')}
              </button>
            </form>
          </SurfaceCard>
        </aside>
        <SurfaceCard variant="soft" padding="md" className="min-h-[480px]">
          {listIsLoading ? (
            <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
              <TicketListSkeleton />
              <TicketDetailSkeleton />
            </div>
          ) : listHasError ? (
            <ErrorState
              title={t('support.errorTitle', t('bookingDashboard.errorTitle'))}
              description={t('support.errorDescription', t('bookingDashboard.errorDescription'))}
              onRetry={() => {
                void ticketsQuery.refetch();
              }}
            />
          ) : tickets.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center gap-3 text-sm text-saubio-slate/60">
              <p className="font-semibold text-saubio-forest">{t('support.empty')}</p>
              <p>{t('support.emptyDescription')}</p>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
              <div className="flex flex-col gap-3">
                {tickets.map((ticket) => renderTicketListItem(ticket))}
              </div>
              {detailIsLoading ? (
                <TicketDetailSkeleton />
              ) : detailHasError ? (
                <ErrorState
                  title={t('support.errorTitle', t('bookingDashboard.errorTitle'))}
                  description={t('support.errorDescription', t('bookingDashboard.errorDescription'))}
                  onRetry={() => {
                    if (selectedTicketId) {
                      void ticketDetailQuery.refetch();
                    }
                  }}
                />
              ) : activeTicket ? (
                <div className="flex flex-col gap-5 rounded-3xl border border-saubio-forest/10 bg-white p-5 shadow-soft-lg">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-saubio-forest">
                        {activeTicket.subject}
                      </h2>
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-0.5 text-xs font-semibold ${
                          statusStyles[activeTicket.status] ?? 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {t(`support.status.${activeTicket.status}`, formatEnum(activeTicket.status))}
                      </span>
                    </div>
                    <p className="text-sm text-saubio-slate/70">{activeTicket.description}</p>
                    <p className="text-xs uppercase tracking-wide text-saubio-slate/50">
                      {t('support.ticket.updated')} {formatDateTime(activeTicket.updatedAt)}
                    </p>
                  </div>
                  <div className="space-y-3 rounded-2xl border border-saubio-forest/10 bg-saubio-mist/30 p-4">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-saubio-slate/60">
                      {t('support.messages.title')}
                    </h3>
                    <div className="space-y-3 text-sm text-saubio-slate/80">
                      {(activeTicket.messages ?? []).length === 0 ? (
                        <p className="text-xs text-saubio-slate/60">
                          {t('support.messages.empty')}
                        </p>
                      ) : (
                        activeTicket.messages?.map((message) => (
                          <article key={message.id} className="space-y-1 rounded-xl bg-white/80 p-3">
                            <div className="flex items-center justify-between text-[11px] uppercase tracking-wide text-saubio-slate/50">
                              <span>{resolveAuthorName(message)}</span>
                              <span>{formatDateTime(message.createdAt)}</span>
                            </div>
                            <p>{message.content}</p>
                          </article>
                        ))
                      )}
                    </div>
                  </div>
                  <form className="space-y-3" onSubmit={handleSendMessage}>
                    <textarea
                      value={messageDraft}
                      onChange={(event) => setMessageDraft(event.target.value)}
                      placeholder={t('support.messages.placeholder') ?? ''}
                      className="w-full rounded-2xl border border-saubio-forest/15 bg-white/80 px-4 py-3 text-sm text-saubio-forest outline-none transition focus:border-saubio-forest focus:ring-1 focus:ring-saubio-forest/40"
                      rows={4}
                    />
                    <button
                      type="submit"
                      className="rounded-full bg-saubio-forest px-5 py-2 text-sm font-semibold text-white transition hover:bg-saubio-moss disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={addMessageMutation.isPending || !messageDraft.trim()}
                    >
                      {addMessageMutation.isPending ? (
                        <span className="flex items-center justify-center gap-2">
                          <LoadingIndicator tone="light" size="xs" />
                          {t('support.messages.sending')}
                        </span>
                      ) : (
                        t('support.messages.send')
                      )}
                    </button>
                  </form>
                </div>
              ) : (
                <div className="flex h-60 flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-saubio-forest/20 bg-white/70 text-sm text-saubio-slate/60">
                  <p className="font-semibold text-saubio-forest">{t('support.empty')}</p>
                  <p>{t('support.emptyDescription')}</p>
                </div>
              )}
            </div>
          )}
        </SurfaceCard>
      </div>
    </div>
  );
}
