'use client';

import { ChangeEvent, FormEvent, Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { useRegisterMutation, useSession } from '@saubio/utils';
import { resolveRoleHome } from '../../../utils/auth';
import { LoadingIndicator } from '@saubio/ui';
import { SiteHeader } from '../../../components/layout/SiteHeader';
import { SiteFooter } from '../../../components/layout/SiteFooter';

function RegisterPageContent() {
  const { t, i18n } = useTranslation();
  const session = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const registerMutation = useRegisterMutation();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    password: '',
  });
  const inputClasses =
    'w-full rounded-2xl border border-saubio-forest/15 px-4 py-3 text-base leading-tight text-saubio-forest placeholder:text-saubio-slate/50 focus:border-saubio-forest focus:outline-none min-h-[3.25rem]';

  const redirectTarget = useMemo(() => {
    const raw = searchParams?.get('redirect');
    if (!raw) {
      return null;
    }
    return raw.startsWith('/') ? raw : null;
  }, [searchParams]);

  useEffect(() => {
    if (session.user) {
      const destination = redirectTarget ?? resolveRoleHome(session.user.roles);
      router.replace(destination);
    }
  }, [session.user, router, redirectTarget]);

  const handleChange = (key: keyof typeof form) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      setForm((state) => ({ ...state, [key]: event.target.value }));
    };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const preferredLocale = (['de', 'en', 'fr'].includes(i18n.language)
      ? i18n.language
      : i18n.language.split('-')[0]) as 'de' | 'en' | 'fr';
    registerMutation.mutate(
      {
        email: form.email,
        password: form.password,
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone || undefined,
        roles: ['client'],
        preferredLocale,
      },
      {
        onSuccess: (data) => {
          const responseRoles = data.user.roles ?? [];
          const destination =
            redirectTarget ??
            resolveRoleHome(responseRoles.length ? responseRoles : session.user?.roles);
          router.push(destination);
        },
      }
    );
  };

  return (
    <>
      <SiteHeader />
      <div className="bg-saubio-mist">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-center gap-12 px-6 py-16 lg:flex-row lg:gap-20">
        <div className="max-w-md space-y-6 text-center lg:text-left">
          <h1 className="text-4xl font-semibold text-saubio-forest">
            {t('auth.register.title')}
          </h1>
          <p className="text-saubio-slate/70">{t('auth.register.subtitle')}</p>
          <div className="flex items-center justify-center gap-2 text-sm text-saubio-slate/80 lg:justify-start">
            <span>{t('auth.switch.toLogin')}</span>
            <Link
              href={redirectTarget ? `/login?redirect=${encodeURIComponent(redirectTarget)}` : '/login'}
              className="font-semibold text-saubio-forest underline"
            >
              {t('auth.switch.loginCta')}
            </Link>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs text-saubio-slate/70 lg:justify-start">
            <span>{t('auth.switch.providerPrompt')}</span>
            <Link href="/register/provider" className="font-semibold text-saubio-forest underline">
              {t('auth.switch.providerCta')}
            </Link>
          </div>
        </div>
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md space-y-6 rounded-4xl bg-white p-8 shadow-soft-lg"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label
                htmlFor="firstName"
                className="text-sm font-semibold text-saubio-slate break-words"
              >
                {t('auth.register.firstName')}
              </label>
              <input
                id="firstName"
                required
                value={form.firstName}
                onChange={handleChange('firstName')}
                className={inputClasses}
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="lastName"
                className="text-sm font-semibold text-saubio-slate break-words"
              >
                {t('auth.register.lastName')}
              </label>
              <input
                id="lastName"
                required
                value={form.lastName}
                onChange={handleChange('lastName')}
                className={inputClasses}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label
              htmlFor="phone"
              className="text-sm font-semibold text-saubio-slate break-words"
            >
              {t('auth.register.phone')}
            </label>
            <input
              id="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange('phone')}
              className={inputClasses}
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-sm font-semibold text-saubio-slate break-words"
            >
              {t('auth.register.email')}
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={form.email}
              onChange={handleChange('email')}
              className={inputClasses}
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-sm font-semibold text-saubio-slate break-words"
            >
              {t('auth.register.password')}
            </label>
            <input
              id="password"
              type="password"
              required
              value={form.password}
              onChange={handleChange('password')}
              className={inputClasses}
            />
          </div>
          <button
            type="submit"
            disabled={registerMutation.isPending}
            className="w-full rounded-full bg-saubio-forest px-5 py-3 text-sm font-semibold text-white transition hover:bg-saubio-moss disabled:cursor-not-allowed disabled:bg-saubio-forest/60"
          >
            {registerMutation.isPending ? (
              <span className="flex items-center justify-center gap-2">
                <LoadingIndicator tone="light" size="xs" />
                {t('auth.register.submit')}
              </span>
            ) : (
              t('auth.register.submit')
            )}
          </button>
          <div className="text-center text-xs text-saubio-slate/60">
            {t('auth.switch.toLogin')}{' '}
            <Link
              href={redirectTarget ? `/login?redirect=${encodeURIComponent(redirectTarget)}` : '/login'}
              className="font-semibold text-saubio-forest"
            >
              {t('auth.switch.loginCta')}
            </Link>
          </div>
          <div className="text-center text-xs text-saubio-slate/60">
            {t('auth.switch.providerPrompt')}{' '}
            <Link href="/register/provider" className="font-semibold text-saubio-forest">
              {t('auth.switch.providerCta')}
            </Link>
          </div>
        </form>
        </div>
      </div>
      <SiteFooter />
    </>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-saubio-slate/60">Chargement…</div>}>
      <RegisterPageContent />
    </Suspense>
  );
}
