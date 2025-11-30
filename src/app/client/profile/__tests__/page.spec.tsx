import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ProfilePage from '../page';
import type { ProfileResponse } from '@saubio/models';

const profileResponse: ProfileResponse = {
  id: 'demo-client-1',
  email: 'client@saubio.de',
  firstName: 'Demo',
  lastName: 'Client',
  phone: '+49 30 1234567',
  preferredLocale: 'de',
  roles: ['client'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  profileAudits: [
    {
      id: 'audit-1',
      userId: 'demo-client-1',
      field: 'phone',
      oldValue: '+49 30 0000000',
      newValue: '+49 30 1234567',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  preferences: {
    marketingEmails: false,
    productUpdates: true,
    enableDarkMode: false,
    digestFrequency: 'WEEKLY',
  },
};

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

const marketingLabel = (resolveTranslation('profile.preferences.marketing') as string) ?? 'Receive Saubio offers';
const darkModeLabel =
  (resolveTranslation('profile.preferences.darkMode') as string) ?? 'Enable dark mode';
const digestLabel = (resolveTranslation('profile.preferences.digest') as string) ?? 'Digest frequency';

const updateProfileMutate = jest.fn();
const updatePasswordMutate = jest.fn();

jest.mock('@saubio/utils', () => {
  const actual = jest.requireActual('@saubio/utils');
  return {
    ...actual,
    useRequireRole: jest.fn(() => ({ user: { id: 'demo-client-1', roles: ['client'] } })),
    useProfile: jest.fn(() => ({
      data: profileResponse,
      isLoading: false,
    })),
    useUpdateProfileMutation: jest.fn(() => ({
      mutate: updateProfileMutate,
      isPending: false,
      isError: false,
    })),
    useUpdatePasswordMutation: jest.fn(() => ({
      mutate: updatePasswordMutate,
      isPending: false,
      isError: false,
    })),
  };
});

jest.mock('react-i18next', () => {
  const translations = getEnglishTranslations();

  return {
    useTranslation: () => ({
      t: (key: string, defaultValue?: unknown) => {
        const value = resolveTranslation(key, translations);
        if (typeof value === 'string') {
          return value;
        }
        if (typeof defaultValue === 'string') {
          return defaultValue;
        }
        if (typeof defaultValue === 'object' && defaultValue && 'field' in defaultValue) {
          return `Field ${String((defaultValue as { field: string }).field)}`;
        }
        return key;
      },
    }),
  };
});

const renderProfilePage = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <ProfilePage />
    </QueryClientProvider>
  );
};

describe('ProfilePage', () => {
  beforeEach(() => {
    updateProfileMutate.mockReset();
    updatePasswordMutate.mockReset();
  });

  it('submits profile updates with form values', () => {
    renderProfilePage();

    const firstNameInput = screen.getByLabelText('First name');
    fireEvent.change(firstNameInput, { target: { value: 'Clara' } });

    fireEvent.submit(firstNameInput.closest('form')!);

    expect(updateProfileMutate).toHaveBeenCalledTimes(1);
    const [variables] = updateProfileMutate.mock.calls[0];
    expect(variables).toMatchObject({
      firstName: 'Clara',
      preferredLocale: 'de',
      preferences: {
        marketingEmails: false,
        productUpdates: true,
        enableDarkMode: false,
        digestFrequency: 'WEEKLY',
      },
    });
  });

  it('updates communication preferences alongside profile data', () => {
    renderProfilePage();

    const marketingCheckbox = screen.getByRole('checkbox', { name: marketingLabel });
    const darkModeCheckbox = screen.getByRole('checkbox', { name: darkModeLabel });
    const digestLabelElement = screen.getByText(digestLabel);
    const digestSelect = digestLabelElement.nextElementSibling as HTMLSelectElement | null;
    expect(digestSelect).not.toBeNull();

    fireEvent.click(marketingCheckbox);
    fireEvent.click(darkModeCheckbox);
    fireEvent.change(digestSelect!, { target: { value: 'DAILY' } });

    const form = digestSelect!.closest('form');
    expect(form).not.toBeNull();
    fireEvent.submit(form!);

    expect(updateProfileMutate).toHaveBeenCalledTimes(1);
    const [variables] = updateProfileMutate.mock.calls[0];
    expect(variables.preferences).toEqual({
      marketingEmails: true,
      productUpdates: true,
      enableDarkMode: true,
      digestFrequency: 'DAILY',
    });
  });

  it('submits password changes when provided', () => {
    renderProfilePage();

    const currentPassword = screen.getByLabelText('Current password');
    const newPassword = screen.getByLabelText('New password');

    fireEvent.change(currentPassword, { target: { value: 'old-secret' } });
    fireEvent.change(newPassword, { target: { value: 'new-secret' } });

    const form = newPassword.closest('form');
    expect(form).not.toBeNull();
    fireEvent.submit(form!);

    expect(updatePasswordMutate).toHaveBeenCalledTimes(1);
    const [variables] = updatePasswordMutate.mock.calls[0];
    expect(variables).toMatchObject({
      currentPassword: 'old-secret',
      newPassword: 'new-secret',
    });
  });
});
