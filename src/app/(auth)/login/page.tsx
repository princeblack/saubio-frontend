'use client';

import { FormEvent, Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { useLoginMutation, useSession } from '@saubio/utils';
import { resolveRoleHome } from '../../../utils/auth';
import { LoadingIndicator } from '@saubio/ui';
import { SiteHeader } from '../../../components/layout/SiteHeader';
import { SiteFooter } from '../../../components/layout/SiteFooter';

function LoginPageContent() {
  const { t } = useTranslation();
  const session = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const loginMutation = useLoginMutation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    loginMutation.mutate(
      {
        email,
        password,
      },
      {
        onSuccess: (data) => {
          const responseRoles = data?.user?.roles ?? [];
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
            {t('auth.login.title')}
          </h1>
          <p className="text-saubio-slate/70">{t('auth.login.subtitle')}</p>
          <div className="flex items-center justify-center gap-2 text-sm text-saubio-slate/80 lg:justify-start">
            <span>{t('auth.switch.toRegister')}</span>
            <Link
              href={redirectTarget ? `/register?redirect=${encodeURIComponent(redirectTarget)}` : '/register'}
              className="font-semibold text-saubio-forest underline"
            >
              {t('auth.switch.registerCta')}
            </Link>
          </div>
        </div>
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md space-y-6 rounded-4xl bg-white p-8 shadow-soft-lg"
        >
          <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-semibold text-saubio-slate break-words"
              >
                {t('auth.login.email')}
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className={inputClasses}
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-semibold text-saubio-slate break-words"
              >
                {t('auth.login.password')}
              </label>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className={inputClasses}
              />
            </div>
          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full rounded-full bg-saubio-forest px-5 py-3 text-sm font-semibold text-white transition hover:bg-saubio-moss disabled:cursor-not-allowed disabled:bg-saubio-forest/60"
          >
            {loginMutation.isPending ? (
              <span className="flex items-center justify-center gap-2">
                <LoadingIndicator tone="light" size="xs" />
                {t('auth.login.submit')}
              </span>
            ) : (
              t('auth.login.submit')
            )}
          </button>
          <div className="text-center text-xs text-saubio-slate/60">
            {t('auth.switch.toRegister')}{' '}
            <Link
              href={redirectTarget ? `/register?redirect=${encodeURIComponent(redirectTarget)}` : '/register'}
              className="font-semibold text-saubio-forest"
            >
              {t('auth.switch.registerCta')}
            </Link>
          </div>
        </form>
        </div>
      </div>
      <SiteFooter />
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-saubio-slate/60">Chargement…</div>}>
      <LoginPageContent />
    </Suspense>
  );
}
