'use client';

import { FormEvent, useMemo, useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import type { ProviderIdentityPayload } from '@saubio/models';
import {
  useRegisterMutation,
  useSession,
  useProviderOnboardingStatus,
  useCompleteProviderIdentityMutation,
  useCompleteProviderAddressMutation,
  useCompleteProviderPhoneMutation,
  useRequestProviderPhoneVerificationMutation,
} from '@saubio/utils';
import { LoadingIndicator, SurfaceCard } from '@saubio/ui';
import { CheckCircle2, Shield, MapPin, Phone, ArrowRight } from 'lucide-react';
import { SiteHeader } from '../../../../components/layout/SiteHeader';
import { SiteFooter } from '../../../../components/layout/SiteFooter';
import { CountrySelect } from '../../../../components/forms/CountrySelect';
import { countries } from '@saubio/utils';

type WizardStep = 'account' | 'identity' | 'address' | 'phone' | 'success';

const steps: Array<{ id: WizardStep; title: string; description: string }> = [
  { id: 'account', title: 'Identifiants', description: 'Créez votre accès sécurisé.' },
  { id: 'identity', title: 'Identité', description: 'Indiquez vos informations personnelles.' },
  { id: 'address', title: 'Adresse', description: 'Ajoutez votre adresse allemande.' },
  { id: 'phone', title: 'Téléphone', description: 'Vérifiez votre numéro mobile.' },
  { id: 'success', title: 'Checklist', description: 'Activez votre compte prestataire.' },
];

const dialCodeOptions = countries
  .filter((country) => country.dialCode)
  .map((country) => ({
    code: country.code,
    label: `${country.flag} ${country.name} (${country.dialCode})`,
    value: country.dialCode ?? '+49',
  }));

function ProviderRegisterPageContent() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const session = useSession();
  const [currentStep, setCurrentStep] = useState<WizardStep>('account');
  const [accountError, setAccountError] = useState<string | null>(null);
  const registerMutation = useRegisterMutation();
  const identityMutation = useCompleteProviderIdentityMutation();
  const addressMutation = useCompleteProviderAddressMutation();
  const phoneMutation = useCompleteProviderPhoneMutation();
  const requestPhoneMutation = useRequestProviderPhoneVerificationMutation();

  const onboardingStatusQuery = useProviderOnboardingStatus(Boolean(session.user));

  const [accountForm, setAccountForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  });

  const [identityForm, setIdentityForm] = useState<ProviderIdentityPayload>({
    firstName: '',
    lastName: '',
    gender: 'female',
    birthDate: '',
    birthCity: '',
    birthCountry: 'DE',
    nationality: 'DE',
    acceptTerms: false,
  });

  const [addressForm, setAddressForm] = useState({
    streetLine1: '',
    streetLine2: '',
    postalCode: '',
    city: '',
    region: '',
  });

  const [phoneForm, setPhoneForm] = useState({
    dialCode: '+49',
    phoneNumber: '',
    verificationCode: '',
  });
  const [codeSent, setCodeSent] = useState(false);
  const [phoneMessage, setPhoneMessage] = useState<string | null>(null);

  useEffect(() => {
    setCodeSent(false);
    setPhoneMessage(null);
  }, [phoneForm.dialCode, phoneForm.phoneNumber]);

  const progress = useMemo(() => {
    const index = steps.findIndex((step) => step.id === currentStep);
    const ratio = index / (steps.length - 1);
    return Math.max(0, Math.min(100, Math.round(ratio * 100)));
  }, [currentStep]);

  const resolveNextStep = () => {
    const status = onboardingStatusQuery.data;
    if (!session.user || !status) {
      return;
    }
    const pendingTask = status.tasks.find(
      (task) => task.id !== 'account' && task.status !== 'completed'
    );
    if (!pendingTask) {
      setCurrentStep('success');
      return;
    }
    if (pendingTask.id === 'identity') setCurrentStep('identity');
    else if (pendingTask.id === 'address') setCurrentStep('address');
    else if (pendingTask.id === 'phone') setCurrentStep('phone');
    else setCurrentStep('success');
  };

  useEffect(() => {
    if (session.user && onboardingStatusQuery.data) {
      resolveNextStep();
    }
  }, [session.user, onboardingStatusQuery.data]);

  const handleAccountSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAccountError(null);
    if (accountForm.password !== accountForm.confirmPassword) {
      setAccountError(t('providerRegister.errors.passwords', 'Les mots de passe ne correspondent pas.'));
      return;
    }
    if (!accountForm.acceptTerms) {
      setAccountError(t('providerRegister.errors.terms', 'Vous devez accepter les conditions.'));
      return;
    }
    registerMutation.mutate(
      {
        email: accountForm.email.toLowerCase(),
        password: accountForm.password,
        firstName: 'Prestataire',
        lastName: 'Saubio',
        roles: ['provider'],
        preferredLocale: i18n.language ?? 'fr',
      },
      {
        onSuccess: async () => {
          await onboardingStatusQuery.refetch();
          setCurrentStep('identity');
        },
        onError: (error: any) => {
          setAccountError(error?.message ?? t('system.error.generic'));
        },
      }
    );
  };

  const handleIdentitySubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    identityMutation.mutate(
      {
        ...identityForm,
        acceptTerms: identityForm.acceptTerms,
      },
      {
        onSuccess: async () => {
          await onboardingStatusQuery.refetch();
          setCurrentStep('address');
        },
      }
    );
  };

  const handleAddressSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    addressMutation.mutate(
      {
        ...addressForm,
        country: 'DE',
      },
      {
        onSuccess: async () => {
          await onboardingStatusQuery.refetch();
          setCurrentStep('phone');
        },
      }
    );
  };

  const normalizedPhoneNumber = useMemo(() => {
    const digits = phoneForm.phoneNumber.replace(/\D/g, '');
    if (!digits) {
      return '';
    }
    const base = `${phoneForm.dialCode}${digits}`;
    return base.startsWith('+') ? base : `+${base}`;
  }, [phoneForm.dialCode, phoneForm.phoneNumber]);

  const handleSendCode = () => {
    setPhoneMessage(null);
    if (!normalizedPhoneNumber) {
      setPhoneMessage(t('providerRegister.phone.invalid', 'Numéro invalide'));
      return;
    }
    setPhoneForm((state) => ({ ...state, verificationCode: '' }));
    requestPhoneMutation.mutate(
      { phoneNumber: normalizedPhoneNumber },
      {
        onSuccess: () => {
          setCodeSent(true);
          setPhoneMessage(t('providerRegister.phone.sent', 'Code envoyé par SMS.'));
        },
        onError: () => {
          setPhoneMessage(t('providerRegister.phone.error', 'Impossible d’envoyer le code.'));
        },
      }
    );
  };

  const handlePhoneSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!codeSent) {
      setPhoneMessage(t('providerRegister.phone.sendFirst', 'Veuillez demander un code avant de confirmer.'));
      return;
    }
    phoneMutation.mutate(
      {
        verificationCode: phoneForm.verificationCode,
      },
      {
        onSuccess: async () => {
          await onboardingStatusQuery.refetch();
          setCurrentStep('success');
        },
        onError: () => {
          setPhoneMessage(t('providerRegister.phone.invalidCode', 'Code incorrect ou expiré.'));
        },
      }
    );
  };

  useEffect(() => {
    if (!session.user) {
      setCurrentStep('account');
      return;
    }
    const stepParam = searchParams.get('step');
    if (stepParam && steps.some((step) => step.id === stepParam)) {
      setCurrentStep(stepParam as WizardStep);
    }
  }, [session.user, searchParams]);

  const renderStep = () => {
    switch (currentStep) {
      case 'account':
        return (
          <form onSubmit={handleAccountSubmit} className="space-y-4">
            <label className="space-y-2 text-sm text-saubio-slate/80">
              <span className="text-xs font-semibold uppercase tracking-wide text-saubio-slate/50">
                Email
              </span>
              <input
                type="email"
                required
                value={accountForm.email}
                onChange={(event) => setAccountForm((state) => ({ ...state, email: event.target.value }))}
                className="w-full rounded-2xl border border-saubio-forest/15 px-4 py-3 text-sm outline-none transition focus:border-saubio-forest"
              />
            </label>
            <label className="space-y-2 text-sm text-saubio-slate/80">
              <span className="text-xs font-semibold uppercase tracking-wide text-saubio-slate/50">
                {t('auth.register.password', 'Mot de passe')}
              </span>
              <input
                type="password"
                required
                minLength={8}
                value={accountForm.password}
                onChange={(event) => setAccountForm((state) => ({ ...state, password: event.target.value }))}
                className="w-full rounded-2xl border border-saubio-forest/15 px-4 py-3 text-sm outline-none transition focus:border-saubio-forest"
              />
            </label>
            <label className="space-y-2 text-sm text-saubio-slate/80">
              <span className="text-xs font-semibold uppercase tracking-wide text-saubio-slate/50">
                {t('auth.register.confirmPassword', 'Confirmer le mot de passe')}
              </span>
              <input
                type="password"
                required
                minLength={8}
                value={accountForm.confirmPassword}
                onChange={(event) =>
                  setAccountForm((state) => ({ ...state, confirmPassword: event.target.value }))
                }
                className="w-full rounded-2xl border border-saubio-forest/15 px-4 py-3 text-sm outline-none transition focus:border-saubio-forest"
              />
            </label>
            <label className="flex items-center gap-3 text-xs text-saubio-slate/70">
              <input
                type="checkbox"
                checked={accountForm.acceptTerms}
                onChange={(event) =>
                  setAccountForm((state) => ({ ...state, acceptTerms: event.target.checked }))
                }
                className="h-4 w-4 rounded border-saubio-forest/40 text-saubio-forest focus:ring-saubio-forest"
              />
              {t(
                'providerRegister.account.terms',
                "J'accepte de créer un compte prestataire Saubio conformément au RGPD."
              )}
            </label>
            {accountError ? <p className="text-xs text-red-600">{accountError}</p> : null}
            <button
              type="submit"
              disabled={registerMutation.isPending}
              className="w-full rounded-full bg-saubio-forest px-5 py-3 text-sm font-semibold text-white transition hover:bg-saubio-moss disabled:opacity-60"
            >
              {registerMutation.isPending
                ? t('providerRegister.submitting', 'Création en cours…')
                : t('providerRegister.createAccount', 'Créer mon compte')}
            </button>
            <p className="text-center text-xs text-saubio-slate/60">
              {t('auth.switch.toLogin')}{' '}
              <Link href="/login" className="font-semibold text-saubio-forest underline">
                {t('auth.switch.loginCta')}
              </Link>
            </p>
          </form>
        );
      case 'identity':
        return (
          <form onSubmit={handleIdentitySubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm text-saubio-slate/80">
                <span className="text-xs font-semibold uppercase tracking-wide text-saubio-slate/50">
                  {t('providerRegister.fields.firstName', 'Prénom')}
                </span>
                <input
                  required
                  value={identityForm.firstName}
                  onChange={(event) =>
                    setIdentityForm((state) => ({ ...state, firstName: event.target.value }))
                  }
                  className="w-full rounded-2xl border border-saubio-forest/15 px-4 py-3 text-sm outline-none transition focus:border-saubio-forest"
                />
              </label>
              <label className="space-y-2 text-sm text-saubio-slate/80">
                <span className="text-xs font-semibold uppercase tracking-wide text-saubio-slate/50">
                  {t('providerRegister.fields.lastName', 'Nom')}
                </span>
                <input
                  required
                  value={identityForm.lastName}
                  onChange={(event) =>
                    setIdentityForm((state) => ({ ...state, lastName: event.target.value }))
                  }
                  className="w-full rounded-2xl border border-saubio-forest/15 px-4 py-3 text-sm outline-none transition focus:border-saubio-forest"
                />
              </label>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm text-saubio-slate/80">
                <span className="text-xs font-semibold uppercase tracking-wide text-saubio-slate/50">
                  {t('providerRegister.fields.gender', 'Genre')}
                </span>
                <select
                  value={identityForm.gender}
                  onChange={(event) =>
                    setIdentityForm((state) => ({
                      ...state,
                      gender: event.target.value as ProviderIdentityPayload['gender'],
                    }))
                  }
                  className="w-full rounded-2xl border border-saubio-forest/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-saubio-forest"
                >
                  <option value="female">{t('providerRegister.gender.female', 'Femme')}</option>
                  <option value="male">{t('providerRegister.gender.male', 'Homme')}</option>
                  <option value="other">{t('providerRegister.gender.other', 'Autre')}</option>
                </select>
              </label>
              <label className="space-y-2 text-sm text-saubio-slate/80">
                <span className="text-xs font-semibold uppercase tracking-wide text-saubio-slate/50">
                  {t('providerRegister.fields.birthDate', 'Date de naissance')}
                </span>
                <input
                  type="date"
                  required
                  value={identityForm.birthDate}
                  onChange={(event) =>
                    setIdentityForm((state) => ({ ...state, birthDate: event.target.value }))
                  }
                  className="w-full rounded-2xl border border-saubio-forest/15 px-4 py-3 text-sm outline-none transition focus:border-saubio-forest"
                />
              </label>
            </div>

            <label className="space-y-2 text-sm text-saubio-slate/80">
              <span className="text-xs font-semibold uppercase tracking-wide text-saubio-slate/50">
                {t('providerRegister.fields.birthCity', 'Ville de naissance')}
              </span>
              <input
                required
                value={identityForm.birthCity}
                onChange={(event) =>
                  setIdentityForm((state) => ({ ...state, birthCity: event.target.value }))
                }
                className="w-full rounded-2xl border border-saubio-forest/15 px-4 py-3 text-sm outline-none transition focus:border-saubio-forest"
              />
            </label>

            <CountrySelect
              label={t('providerRegister.fields.birthCountry', 'Pays de naissance')}
              value={identityForm.birthCountry}
              onChange={(code) => setIdentityForm((state) => ({ ...state, birthCountry: code }))}
              required
            />

            <CountrySelect
              label={t('providerRegister.fields.nationality', 'Nationalité')}
              value={identityForm.nationality}
              onChange={(code) => setIdentityForm((state) => ({ ...state, nationality: code }))}
              required
            />

            <label className="flex items-start gap-3 text-xs text-saubio-slate/70">
              <input
                type="checkbox"
                checked={identityForm.acceptTerms}
                onChange={(event) =>
                  setIdentityForm((state) => ({ ...state, acceptTerms: event.target.checked }))
                }
                className="mt-1 h-4 w-4 rounded border-saubio-forest/40 text-saubio-forest focus:ring-saubio-forest"
              />
              <span>
                {t(
                  'providerRegister.identity.terms',
                  "Je confirme l'exactitude de ces informations et accepte leur vérification conformément aux normes européennes."
                )}
              </span>
            </label>

            <button
              type="submit"
              disabled={identityMutation.isPending}
              className="w-full rounded-full bg-saubio-forest px-5 py-3 text-sm font-semibold text-white transition hover:bg-saubio-moss disabled:opacity-60"
            >
              {identityMutation.isPending ? t('system.loading.generic', 'Enregistrement…') : t('system.actions.continue', 'Suivant')}
            </button>
          </form>
        );
      case 'address':
        return (
          <form onSubmit={handleAddressSubmit} className="space-y-4">
            <label className="space-y-2 text-sm text-saubio-slate/80">
              <span className="text-xs font-semibold uppercase tracking-wide text-saubio-slate/50">
                {t('providerRegister.address.street', 'Adresse')}
              </span>
              <input
                required
                value={addressForm.streetLine1}
                onChange={(event) =>
                  setAddressForm((state) => ({ ...state, streetLine1: event.target.value }))
                }
                placeholder="Ex : Friedrichstraße 1"
                className="w-full rounded-2xl border border-saubio-forest/15 px-4 py-3 text-sm outline-none transition focus:border-saubio-forest"
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm text-saubio-slate/80">
                <span className="text-xs font-semibold uppercase tracking-wide text-saubio-slate/50">
                  {t('providerRegister.address.postalCode', 'Code postal')}
                </span>
                <input
                  required
                  value={addressForm.postalCode}
                  onChange={(event) =>
                    setAddressForm((state) => ({ ...state, postalCode: event.target.value }))
                  }
                  className="w-full rounded-2xl border border-saubio-forest/15 px-4 py-3 text-sm outline-none transition focus:border-saubio-forest"
                />
              </label>
              <label className="space-y-2 text-sm text-saubio-slate/80">
                <span className="text-xs font-semibold uppercase tracking-wide text-saubio-slate/50">
                  {t('providerRegister.address.city', 'Ville')}
                </span>
                <input
                  required
                  value={addressForm.city}
                  onChange={(event) =>
                    setAddressForm((state) => ({ ...state, city: event.target.value }))
                  }
                  className="w-full rounded-2xl border border-saubio-forest/15 px-4 py-3 text-sm outline-none transition focus:border-saubio-forest"
                />
              </label>
            </div>
            <label className="space-y-2 text-sm text-saubio-slate/80">
              <span className="text-xs font-semibold uppercase tracking-wide text-saubio-slate/50">
                {t('providerRegister.address.region', 'Région (Land)')}
              </span>
              <input
                value={addressForm.region}
                onChange={(event) =>
                  setAddressForm((state) => ({ ...state, region: event.target.value }))
                }
                className="w-full rounded-2xl border border-saubio-forest/15 px-4 py-3 text-sm outline-none transition focus:border-saubio-forest"
              />
            </label>

            <p className="text-xs text-saubio-slate/60">
              {t(
                'providerRegister.address.note',
                'Les missions disponibles actuellement sont localisées en Allemagne.'
              )}
            </p>

            <button
              type="submit"
              disabled={addressMutation.isPending}
              className="w-full rounded-full bg-saubio-forest px-5 py-3 text-sm font-semibold text-white transition hover:bg-saubio-moss disabled:opacity-60"
            >
              {addressMutation.isPending ? t('system.loading.generic', 'Enregistrement…') : t('system.actions.continue', 'Suivant')}
            </button>
          </form>
        );
      case 'phone':
        return (
          <form onSubmit={handlePhoneSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-[150px_1fr]">
              <label className="space-y-2 text-sm text-saubio-slate/80">
                <span className="text-xs font-semibold uppercase tracking-wide text-saubio-slate/50">
                  Indicatif
                </span>
                <select
                  value={phoneForm.dialCode}
                  onChange={(event) =>
                    setPhoneForm((state) => ({ ...state, dialCode: event.target.value }))
                  }
                  className="w-full rounded-2xl border border-saubio-forest/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-saubio-forest"
                >
                  {dialCodeOptions.map((option) => (
                    <option key={option.code} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-2 text-sm text-saubio-slate/80">
                <span className="text-xs font-semibold uppercase tracking-wide text-saubio-slate/50">
                  {t('providerRegister.phone.number', 'Numéro de téléphone')}
                </span>
                <input
                  required
                  value={phoneForm.phoneNumber}
                  onChange={(event) =>
                    setPhoneForm((state) => ({ ...state, phoneNumber: event.target.value }))
                  }
                  placeholder="151 2345678"
                  className="w-full rounded-2xl border border-saubio-forest/15 px-4 py-3 text-sm outline-none transition focus:border-saubio-forest"
                />
              </label>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleSendCode}
                disabled={!normalizedPhoneNumber || requestPhoneMutation.isPending}
                className="rounded-full border border-saubio-forest/30 px-4 py-2 text-xs font-semibold text-saubio-forest transition hover:border-saubio-forest disabled:opacity-60"
              >
                {requestPhoneMutation.isPending
                  ? t('providerRegister.phone.sending', 'Envoi…')
                  : codeSent
                    ? t('providerRegister.phone.resend', 'Renvoyer le code')
                    : t('providerRegister.phone.send', 'Envoyer le code')}
              </button>
              {phoneMessage ? (
                <span className="text-xs text-saubio-slate/70">{phoneMessage}</span>
              ) : null}
            </div>
            <label className="space-y-2 text-sm text-saubio-slate/80">
              <span className="text-xs font-semibold uppercase tracking-wide text-saubio-slate/50">
                {t('providerRegister.phone.code', 'Code de vérification')}
              </span>
              <input
                required
                disabled={!codeSent}
                value={phoneForm.verificationCode}
                onChange={(event) =>
                  setPhoneForm((state) => ({ ...state, verificationCode: event.target.value }))
                }
                placeholder="0000"
                className="w-full rounded-2xl border border-saubio-forest/15 px-4 py-3 text-sm outline-none transition focus:border-saubio-forest"
              />
            </label>
            <p className="text-xs text-saubio-slate/60">
              {t(
                'providerRegister.phone.note',
                'Nous utilisons votre numéro uniquement pour la communication avec les clients et l’équipe Saubio.'
              )}
            </p>

            <button
              type="submit"
              disabled={phoneMutation.isPending}
              className="w-full rounded-full bg-saubio-forest px-5 py-3 text-sm font-semibold text-white transition hover:bg-saubio-moss disabled:opacity-60"
            >
              {phoneMutation.isPending ? t('system.loading.generic', 'Vérification…') : t('system.actions.finish', 'Terminer')}
            </button>
          </form>
        );
      case 'success':
        return (
          <div className="space-y-6 text-center">
            <CheckCircle2 className="mx-auto h-16 w-16 text-saubio-forest" />
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-saubio-forest">
                {t('providerRegister.success.title', 'Bienvenue chez Saubio !')}
              </h2>
              <p className="text-sm text-saubio-slate/70">
                {t(
                  'providerRegister.success.description',
                  'Votre compte est créé. Il vous reste quelques étapes pour activer votre profil et recevoir vos premières missions.'
                )}
              </p>
            </div>
            <button
              type="button"
              onClick={() => router.push('/prestataire/onboarding')}
              className="inline-flex items-center justify-center rounded-full bg-saubio-forest px-6 py-3 text-sm font-semibold text-white transition hover:bg-saubio-moss"
            >
              {t('providerRegister.success.cta', 'Voir ma checklist')}
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <SiteHeader />
      <section className="bg-saubio-mist/60 py-16">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-saubio-slate/60">
              {t('providerRegister.progress.title', 'Votre progression')}
            </p>
            <div className="mt-3 flex items-center justify-between">
              <p className="text-xl font-semibold text-saubio-forest">
                {t('providerRegister.progress.subtitle', 'Devenir prestataire')}
              </p>
              <span className="text-sm font-semibold text-saubio-forest">{progress}%</span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-white/60">
              <div
                className="h-2 rounded-full bg-saubio-forest transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <ul className="mt-4 grid gap-3 text-xs uppercase tracking-[0.25em] text-saubio-slate/50 sm:grid-cols-5">
              {steps.map((step) => {
                const index = steps.findIndex((item) => item.id === currentStep);
                const stepIndex = steps.findIndex((item) => item.id === step.id);
                const done = stepIndex < index || currentStep === 'success';
                return (
                  <li
                    key={step.id}
                    className={`rounded-full px-3 py-1 text-center ${
                      done ? 'bg-saubio-forest text-white' : 'bg-white/80 text-saubio-slate/50'
                    }`}
                  >
                    {step.title}
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <SurfaceCard variant="soft" padding="lg" className="space-y-6">
              {renderStep()}
            </SurfaceCard>

            <aside className="space-y-4">
              <SurfaceCard variant="soft" padding="lg" className="space-y-3">
                <h3 className="text-sm font-semibold text-saubio-forest">
                  {t('providerRegister.sidebar.identity', 'Pourquoi ces informations ?')}
                </h3>
                <p className="text-sm text-saubio-slate/70">
                  {t(
                    'providerRegister.sidebar.identityDesc',
                    'Saubio est une plateforme réglementée en Allemagne. Nous devons vérifier votre identité et vos coordonnées pour garantir des missions sécurisées.'
                  )}
                </p>
              </SurfaceCard>
              <SurfaceCard variant="soft" padding="lg" className="space-y-3">
                <h3 className="text-sm font-semibold text-saubio-forest">
                  {t('providerRegister.sidebar.steps', 'Ce qui vous attend ensuite')}
                </h3>
                <ul className="space-y-2 text-sm text-saubio-slate/70">
                  <li className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-saubio-forest" />
                    {t('providerRegister.sidebar.checklist.identity', 'Vérification d’identité')}
                  </li>
                  <li className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-saubio-forest" />
                    {t('providerRegister.sidebar.checklist.address', 'Adresse allemande valide')}
                  </li>
                  <li className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-saubio-forest" />
                    {t('providerRegister.sidebar.checklist.phone', 'Confirmation du numéro')}
                  </li>
                </ul>
                <p className="text-xs text-saubio-slate/50">
                  {t(
                    'providerRegister.sidebar.bottom',
                    'Compte complet = missions proposées + paiements automatiques.'
                  )}
                </p>
              </SurfaceCard>
            </aside>
          </div>
        </div>
      </section>
      <SiteFooter />
    </>
  );
}

export default function ProviderRegisterPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-saubio-slate/60">Chargement…</div>}>
      <ProviderRegisterPageContent />
    </Suspense>
  );
}
