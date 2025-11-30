import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import SupportPage from '../page';
import type { SupportMessage, SupportTicket } from '@saubio/models';

const supportMessages: SupportMessage[] = [
  {
    id: 'message-1',
    ticketId: 'support-ticket-1',
    authorId: 'demo-client-1',
    createdAt: new Date(Date.now() - 3_600_000).toISOString(),
    updatedAt: new Date(Date.now() - 3_600_000).toISOString(),
    content: 'Bonjour, besoin d’aide pour replanifier une intervention bio.',
    internal: false,
    attachments: [],
    author: {
      id: 'demo-client-1',
      email: 'client@saubio.de',
      firstName: 'Demo',
      lastName: 'Client',
    },
  },
];

const supportTickets: SupportTicket[] = [
  {
    id: 'support-ticket-1',
    subject: 'Replanification mission eco_plus',
    description: 'Besoin de décaler la mission eco_plus à demain matin.',
    requesterId: 'demo-client-1',
    assigneeId: 'system-ops-agent',
    createdAt: new Date(Date.now() - 4_000_000).toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'in_progress',
    priority: 'high',
    category: 'onboarding',
    dueAt: null,
    messages: supportMessages,
    attachments: [],
    requester: {
      id: 'demo-client-1',
      email: 'client@saubio.de',
      firstName: 'Demo',
      lastName: 'Client',
    },
    assignee: {
      id: 'system-ops-agent',
      email: 'ops@saubio.de',
      firstName: 'Ops',
      lastName: 'Agent',
    },
  },
];

const addMessageMutate = jest.fn();

jest.mock('@saubio/utils', () => {
  const actual = jest.requireActual('@saubio/utils');
  return {
    ...actual,
    useRequireRole: jest.fn(() => ({ user: { id: 'demo-client-1', roles: ['client'] } })),
    useSupportTickets: jest.fn(() => ({
      data: supportTickets,
      isLoading: false,
    })),
    useSupportTicket: jest.fn(() => ({
      data: supportTickets[0],
      isLoading: false,
    })),
    useCreateSupportTicketMutation: jest.fn(() => ({
      mutate: jest.fn(),
      isPending: false,
      isError: false,
    })),
    useAddSupportMessageMutation: jest.fn(() => ({
      mutate: addMessageMutate,
      isPending: false,
      isError: false,
    })),
  };
});

function getEnglishTranslations() {
  return (jest.requireActual('@saubio/config').localeResources.en.translation ??
    {}) as Record<string, unknown>;
}

function resolveTranslation(key: string, source = getEnglishTranslations()): unknown {
  return key.split('.').reduce<unknown>((acc, segment) => {
    if (acc && typeof acc === 'object' && segment in acc) {
      return (acc as Record<string, unknown>)[segment];
    }
    return undefined;
  }, source);
}

const supportReplyPlaceholder =
  (resolveTranslation('support.messages.placeholder') as string) ??
  'Write a message…';

jest.mock('react-i18next', () => {
  const translations = getEnglishTranslations();

  return {
    useTranslation: () => ({
      t: (key: string, defaultOrOptions?: unknown) => {
        const value = resolveTranslation(key, translations);
        if (typeof value === 'string') {
          return value;
        }
        if (typeof defaultOrOptions === 'string') {
          return defaultOrOptions;
        }
        return key;
      },
    }),
  };
});

const renderSupportPage = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <SupportPage />
    </QueryClientProvider>
  );
};

describe('SupportPage', () => {
  beforeEach(() => {
    addMessageMutate.mockReset();
  });

  it('renders ticket feed and conversation details', () => {
    renderSupportPage();

    expect(screen.getAllByText('Replanification mission eco_plus')[0]).toBeInTheDocument();
    expect(
      screen.getByText('Bonjour, besoin d’aide pour replanifier une intervention bio.')
    ).toBeInTheDocument();
  });

  it('submits a reply using the mutation hook', () => {
    renderSupportPage();

    const textarea = screen.getByPlaceholderText(supportReplyPlaceholder);
    fireEvent.change(textarea, { target: { value: 'Merci, c’est noté.' } });

    const form = textarea.closest('form');
    expect(form).not.toBeNull();
    fireEvent.submit(form!);

    expect(addMessageMutate).toHaveBeenCalledTimes(1);
    const [variables] = addMessageMutate.mock.calls[0];
    expect(variables).toMatchObject({
      ticketId: 'support-ticket-1',
      content: 'Merci, c’est noté.',
    });
  });
});
