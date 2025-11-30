import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import NotificationsPage from '../page';
import type { Notification, NotificationPreference } from '@saubio/models';

const notifications: Notification[] = [
  {
    id: 'notif-booking-1',
    userId: 'demo-client-1',
    type: 'booking_status',
    payload: {
      bookingId: 'demo-booking-1',
      status: 'confirmed',
      message: 'Votre mission residential est confirmée pour demain 08:00.',
    },
    preview: 'Votre mission residential est confirmée pour demain 08:00.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    readAt: null,
    unread: true,
  },
];

const preferences: NotificationPreference = {
  id: 'pref-1',
  userId: 'demo-client-1',
  channels: ['in_app', 'email'],
  mutedTypes: [],
  language: 'de',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const markReadMutate = jest.fn();

jest.mock('@saubio/utils', () => {
  const actual = jest.requireActual('@saubio/utils');
  return {
    ...actual,
    useRequireRole: jest.fn(() => ({ user: { id: 'demo-client-1', roles: ['client'] } })),
    useNotifications: jest.fn(() => ({
      data: notifications,
      isLoading: false,
    })),
    useNotificationPreferences: jest.fn(() => ({
      data: preferences,
      isLoading: false,
    })),
    useNotificationStream: jest.fn(),
    useMarkNotificationReadMutation: jest.fn(() => ({
      mutate: markReadMutate,
      isPending: false,
    })),
    useMarkManyNotificationsMutation: jest.fn(() => ({
      mutate: jest.fn(),
      isPending: false,
    })),
    useUpdateNotificationPreferencesMutation: jest.fn(() => ({
      mutate: jest.fn(),
      isPending: false,
      isError: false,
    })),
  };
});

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue?: unknown) => {
      if (typeof defaultValue === 'string') {
        return defaultValue;
      }
      return key;
    },
  }),
}));

const renderNotificationsPage = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <NotificationsPage />
    </QueryClientProvider>
  );
};

describe('NotificationsPage', () => {
  beforeEach(() => {
    markReadMutate.mockReset();
  });

  it('renders seeded notification feed and marks items as read', () => {
    renderNotificationsPage();

    expect(
      screen.getByText('Votre mission residential est confirmée pour demain 08:00.')
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'notifications.markRead' }));

    expect(markReadMutate).toHaveBeenCalledTimes(1);
    const [variables] = markReadMutate.mock.calls[0];
    expect(variables).toMatchObject({
      id: 'notif-booking-1',
    });
  });
});
