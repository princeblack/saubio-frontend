'use client';

import { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useProfile,
  useProviderProfile,
  useUpdateProfileMutation,
  useCompleteProviderAddressMutation,
  useUploadProviderPhotoMutation,
  useRequireRole,
} from '@saubio/utils';
import { SectionDescription, SectionTitle, SurfaceCard, Skeleton } from '@saubio/ui';
import { ErrorState } from '../../../components/feedback/ErrorState';

const MAX_PHOTO_BYTES = 5_000_000;

export default function ProviderAccountProfilePage() {
  const { t } = useTranslation();
  const session = useRequireRole({ allowedRoles: ['provider', 'employee', 'admin'] });
  const profileQuery = useProfile();
  const providerProfileQuery = useProviderProfile();
  const updateProfileMutation = useUpdateProfileMutation();
  const addressMutation = useCompleteProviderAddressMutation();
  const uploadPhotoMutation = useUploadProviderPhotoMutation();
  const [accountForm, setAccountForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });
  const [addressForm, setAddressForm] = useState({
    streetLine1: '',
    streetLine2: '',
    postalCode: '',
    city: '',
    region: '',
    country: 'DE',
  });
  const [accountMessage, setAccountMessage] = useState('');
  const [addressMessage, setAddressMessage] = useState('');
  const [photoMessage, setPhotoMessage] = useState('');
  const [accountError, setAccountError] = useState('');
  const [addressError, setAddressError] = useState('');
  const [photoError, setPhotoError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!profileQuery.data) return;
    setAccountForm((prev) => ({
      ...prev,
      firstName: profileQuery.data.firstName ?? '',
      lastName: profileQuery.data.lastName ?? '',
      email: profileQuery.data.email ?? '',
      phone: profileQuery.data.phone ?? '',
    }));
  }, [profileQuery.data]);

  useEffect(() => {
    if (!providerProfileQuery.data) return;
    const address = providerProfileQuery.data.address;
    if (address) {
      setAddressForm((prev) => ({
        ...prev,
        streetLine1: address.streetLine1 ?? '',
        streetLine2: address.streetLine2 ?? '',
        postalCode: address.postalCode ?? '',
        city: address.city ?? '',
        region: address.region ?? '',
        country: prev.country || 'DE',
      }));
    }
  }, [providerProfileQuery.data]);

  if (!session.user) {
    return null;
  }

  if (profileQuery.isLoading || providerProfileQuery.isLoading) {
    return (
      <div className="space-y-8">
        <header className="space-y-3">
          <SectionTitle as="h1" size="large">
            {t('providerAccountPage.title', 'Mon profil')}
          </SectionTitle>
          <SectionDescription>{t('providerAccountPage.subtitle', 'Mettez à jour vos informations personnelles.')}</SectionDescription>
        </header>
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <SurfaceCard key={`profile-skeleton-${index}`} variant="soft" padding="md">
              <Skeleton className="h-4 w-48 rounded-full" />
              <Skeleton className="mt-4 h-24 rounded-3xl" />
            </SurfaceCard>
          ))}
        </div>
      </div>
    );
  }

  if (profileQuery.isError || providerProfileQuery.isError || !profileQuery.data || !providerProfileQuery.data) {
    return (
      <div className="space-y-6">
        <ErrorState
          title={t('providerDashboard.errorTitle', t('bookingDashboard.errorTitle'))}
          description={t('providerDashboard.errorDescription', t('bookingDashboard.errorDescription'))}
          onRetry={() => {
            void profileQuery.refetch();
            void providerProfileQuery.refetch();
          }}
        />
      </div>
    );
  }

  const providerProfile = providerProfileQuery.data;
  const currentPhoto =
    providerProfile.photoUrl ??
    providerProfile.documents?.find((doc) => doc.type === 'profile_photo')?.url ??
    providerProfile.documents?.find((doc) => doc.type === 'photo_before')?.url;

  const initials = `${accountForm.firstName?.[0] ?? ''}${accountForm.lastName?.[0] ?? ''}`.trim() || 'S';

  const handleAccountSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAccountMessage('');
    setAccountError('');
    updateProfileMutation.mutate(
      {
        firstName: accountForm.firstName.trim(),
        lastName: accountForm.lastName.trim(),
        phone: accountForm.phone.trim() || undefined,
      },
      {
        onSuccess: () => {
          setAccountMessage(t('providerAccountPage.messages.accountSaved', 'Profil mis à jour.'));
          void profileQuery.refetch();
        },
        onError: (error) => {
          setAccountError(
            error instanceof Error
              ? error.message
              : t('providerAccountPage.messages.error', 'Impossible d’enregistrer vos changements pour le moment.')
          );
        },
      }
    );
  };

  const handleAddressSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAddressMessage('');
    setAddressError('');
    addressMutation.mutate(
      {
        streetLine1: addressForm.streetLine1.trim(),
        streetLine2: addressForm.streetLine2.trim() || undefined,
        postalCode: addressForm.postalCode.trim(),
        city: addressForm.city.trim(),
        region: addressForm.region.trim() || undefined,
        country: addressForm.country.trim() || 'DE',
      },
      {
        onSuccess: () => {
          setAddressMessage(t('providerAccountPage.messages.addressSaved', 'Adresse mise à jour.'));
          void providerProfileQuery.refetch();
        },
        onError: (error) => {
          setAddressError(
            error instanceof Error
              ? error.message
              : t('providerAccountPage.messages.error', 'Impossible d’enregistrer vos changements pour le moment.')
          );
        },
      }
    );
  };

  const handlePhotoChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    setPhotoMessage('');
    setPhotoError('');
    if (file.size > MAX_PHOTO_BYTES) {
      setPhotoError(t('providerAccountPage.avatar.hint', 'PNG ou JPG, max 5 Mo.'));
      return;
    }
    try {
      const dataUrl = await readFileAsDataUrl(file);
      uploadPhotoMutation.mutate(
        { fileData: dataUrl, fileName: file.name },
        {
          onSuccess: () => {
            setPhotoMessage(t('providerAccountPage.messages.photoSaved', 'Photo mise à jour.'));
            void providerProfileQuery.refetch();
          },
          onError: (error) => {
            setPhotoError(
              error instanceof Error
                ? error.message
                : t('providerAccountPage.messages.error', 'Impossible d’enregistrer vos changements pour le moment.')
            );
          },
        }
      );
    } catch (error) {
      setPhotoError(
        error instanceof Error
          ? error.message
          : t('system.error.generic', 'Une erreur est survenue.')
      );
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <SectionTitle as="h1" size="large">
          {t('providerAccountPage.title', 'Mon profil')}
        </SectionTitle>
        <SectionDescription>
          {t('providerAccountPage.subtitle', 'Mettez à jour vos informations personnelles, vos coordonnées et votre photo.')}
        </SectionDescription>
      </header>

      <SurfaceCard variant="soft" padding="md" className="space-y-5 border border-saubio-mist/60">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {currentPhoto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={currentPhoto}
                alt={t('providerAccountPage.avatar.title', 'Photo de profil')}
                className="h-20 w-20 rounded-3xl object-cover"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-saubio-mist/70 text-xl font-semibold text-saubio-forest">
                {initials}
              </div>
            )}
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-saubio-slate/50">
                {t('providerAccountPage.avatar.title', 'Photo de profil')}
              </p>
              <p className="text-xs text-saubio-slate/60">
                {t('providerAccountPage.avatar.description', 'Ajoutez une photo claire qui vous représente.')}
              </p>
              <p className="text-[11px] text-saubio-slate/50">
                {t('providerAccountPage.avatar.hint', 'PNG ou JPG, 5 Mo max.')}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoChange}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-full border border-saubio-forest/20 px-4 py-2 text-sm font-semibold text-saubio-forest transition hover:border-saubio-forest"
              disabled={uploadPhotoMutation.isPending}
            >
              {uploadPhotoMutation.isPending
                ? t('providerAccountPage.avatar.uploading', 'Téléversement…')
                : t('providerAccountPage.avatar.upload', 'Ajouter une photo')}
            </button>
          </div>
        </div>
        {photoMessage ? <p className="text-xs text-saubio-forest">{photoMessage}</p> : null}
        {photoError ? <p className="text-xs text-red-600">{photoError}</p> : null}
      </SurfaceCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <SurfaceCard variant="soft" padding="md" className="space-y-4">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.28em] text-saubio-slate/50">
              {t('providerAccountPage.account.title', 'Informations personnelles')}
            </h2>
            <SectionDescription className="text-xs">
              {t('providerAccountPage.account.description', 'Ces données apparaissent sur les factures et communications.')}
            </SectionDescription>
          </div>
          <form onSubmit={handleAccountSubmit} className="space-y-3 text-sm text-saubio-slate/80">
            <label className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-saubio-slate/50">
                {t('providerAccountPage.account.firstName', 'Prénom')}
              </span>
              <input
                type="text"
                value={accountForm.firstName}
                onChange={(event) => setAccountForm((state) => ({ ...state, firstName: event.target.value }))}
                className="w-full rounded-2xl border border-saubio-forest/15 bg-white px-3 py-2 outline-none transition focus:border-saubio-forest"
                required
              />
            </label>
            <label className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-saubio-slate/50">
                {t('providerAccountPage.account.lastName', 'Nom')}
              </span>
              <input
                type="text"
                value={accountForm.lastName}
                onChange={(event) => setAccountForm((state) => ({ ...state, lastName: event.target.value }))}
                className="w-full rounded-2xl border border-saubio-forest/15 bg-white px-3 py-2 outline-none transition focus:border-saubio-forest"
                required
              />
            </label>
            <label className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-saubio-slate/50">
                {t('providerAccountPage.account.email', 'Email')}
              </span>
              <input
                type="email"
                value={accountForm.email}
                disabled
                className="w-full rounded-2xl border border-saubio-forest/10 bg-saubio-mist/40 px-3 py-2 text-saubio-slate/60"
              />
            </label>
            <label className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-saubio-slate/50">
                {t('providerAccountPage.account.phone', 'Téléphone')}
              </span>
              <input
                type="tel"
                value={accountForm.phone}
                onChange={(event) => setAccountForm((state) => ({ ...state, phone: event.target.value }))}
                className="w-full rounded-2xl border border-saubio-forest/15 bg-white px-3 py-2 outline-none transition focus:border-saubio-forest"
                placeholder="+49 151 ..."
              />
            </label>
            <button
              type="submit"
              className="inline-flex items-center rounded-full bg-saubio-forest px-5 py-2 text-xs font-semibold text-white transition hover:bg-saubio-moss disabled:opacity-60"
              disabled={updateProfileMutation.isPending}
            >
              {updateProfileMutation.isPending
                ? t('providerAccountPage.actions.saving', 'Enregistrement…')
                : t('providerAccountPage.actions.save', 'Enregistrer')}
            </button>
            {accountMessage ? <p className="text-xs text-saubio-forest">{accountMessage}</p> : null}
            {accountError ? <p className="text-xs text-red-600">{accountError}</p> : null}
          </form>
        </SurfaceCard>

        <SurfaceCard variant="soft" padding="md" className="space-y-4">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.28em] text-saubio-slate/50">
              {t('providerAccountPage.address.title', 'Adresse personnelle')}
            </h2>
            <SectionDescription className="text-xs">
              {t('providerAccountPage.address.description', 'Votre domicile nous aide à proposer des missions proches.')}
            </SectionDescription>
          </div>
          <form onSubmit={handleAddressSubmit} className="space-y-3 text-sm text-saubio-slate/80">
            <label className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-saubio-slate/50">
                {t('providerAccountPage.address.streetLine1', 'Rue et numéro')}
              </span>
              <input
                type="text"
                value={addressForm.streetLine1}
                onChange={(event) => setAddressForm((state) => ({ ...state, streetLine1: event.target.value }))}
                className="w-full rounded-2xl border border-saubio-forest/15 bg-white px-3 py-2 outline-none transition focus:border-saubio-forest"
                required
              />
            </label>
            <label className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-saubio-slate/50">
                {t('providerAccountPage.address.streetLine2', 'Complément d’adresse')}
              </span>
              <input
                type="text"
                value={addressForm.streetLine2}
                onChange={(event) => setAddressForm((state) => ({ ...state, streetLine2: event.target.value }))}
                className="w-full rounded-2xl border border-saubio-forest/15 bg-white px-3 py-2 outline-none transition focus:border-saubio-forest"
              />
            </label>
            <div className="grid gap-3 sm:grid-cols-3">
              <label className="space-y-1 sm:col-span-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-saubio-slate/50">
                  {t('providerAccountPage.address.postalCode', 'Code postal')}
                </span>
                <input
                  type="text"
                  value={addressForm.postalCode}
                  onChange={(event) => setAddressForm((state) => ({ ...state, postalCode: event.target.value }))}
                  className="w-full rounded-2xl border border-saubio-forest/15 bg-white px-3 py-2 outline-none transition focus:border-saubio-forest"
                  required
                />
              </label>
              <label className="space-y-1 sm:col-span-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-saubio-slate/50">
                  {t('providerAccountPage.address.city', 'Ville')}
                </span>
                <input
                  type="text"
                  value={addressForm.city}
                  onChange={(event) => setAddressForm((state) => ({ ...state, city: event.target.value }))}
                  className="w-full rounded-2xl border border-saubio-forest/15 bg-white px-3 py-2 outline-none transition focus:border-saubio-forest"
                  required
                />
              </label>
            </div>
            <label className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-saubio-slate/50">
                {t('providerAccountPage.address.region', 'Région')}
              </span>
              <input
                type="text"
                value={addressForm.region}
                onChange={(event) => setAddressForm((state) => ({ ...state, region: event.target.value }))}
                className="w-full rounded-2xl border border-saubio-forest/15 bg-white px-3 py-2 outline-none transition focus:border-saubio-forest"
              />
            </label>
            <button
              type="submit"
              className="inline-flex items-center rounded-full bg-saubio-forest px-5 py-2 text-xs font-semibold text-white transition hover:bg-saubio-moss disabled:opacity-60"
              disabled={addressMutation.isPending}
            >
              {addressMutation.isPending
                ? t('providerAccountPage.actions.saving', 'Enregistrement…')
                : t('providerAccountPage.actions.save', 'Enregistrer')}
            </button>
            {addressMessage ? <p className="text-xs text-saubio-forest">{addressMessage}</p> : null}
            {addressError ? <p className="text-xs text-red-600">{addressError}</p> : null}
          </form>
        </SurfaceCard>
      </div>
    </div>
  );
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('INVALID_FILE'));
      }
    };
    reader.onerror = () => reject(reader.error ?? new Error('FAILED_TO_READ_FILE'));
    reader.readAsDataURL(file);
  });
}
