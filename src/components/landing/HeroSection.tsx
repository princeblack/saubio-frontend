'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AnalyticsCard,
  SectionContainer,
  SectionDescription,
  SectionHeading,
  SectionTitle,
} from '@saubio/ui';
import { Clock3, Leaf, ShieldCheck } from 'lucide-react';
import { createApiClient } from '@saubio/utils';

export function HeroSection() {
  const { t } = useTranslation();
  const router = useRouter();
  const [postalCode, setPostalCode] = useState('');
  const [postalError, setPostalError] = useState<string | null>(null);
  const [isCheckingCoverage, setCheckingCoverage] = useState(false);

  const stats = t('hero.stats', { returnObjects: true }) as {
    availability: { label: string; value: string };
    satisfaction: { label: string; value: string };
    eco: { label: string; value: string };
  };

  const handlePlannerRedirect = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalized = postalCode.trim();
    if (!normalized) {
      setPostalError(t('hero.postalErrorRequired', 'Merci de saisir un code postal.'));
      return;
    }
    if (!/^[0-9A-Za-z ]{4,8}$/.test(normalized)) {
      setPostalError(t('hero.postalErrorFormat', 'Ce code postal ne semble pas valide.'));
      return;
    }
    setPostalError(null);
    setCheckingCoverage(true);
    try {
      const client = createApiClient({ includeCredentials: false });
      const coverage = await client.checkPostalCoverage(normalized);
      if (coverage.covered) {
        router.push(`/bookings/planning?postalCode=${encodeURIComponent(normalized)}`);
        return;
      }
      if (coverage.reason && coverage.reason !== 'uncovered') {
        setPostalError(
          t('hero.postalCoverageError', "Ce code postal n'est pas reconnu ou n'est pas desservi.")
        );
        return;
      }
      const params = new URLSearchParams({ postalCode: normalized });
      if (coverage.city) {
        params.set('city', coverage.city);
      }
      router.push(`/follow-up?${params.toString()}`);
    } catch (error) {
      console.error(error);
      setPostalError(
        t(
          'hero.postalCoverageRequestError',
          'Nous ne parvenons pas à vérifier la couverture pour le moment. Merci de réessayer.'
        )
      );
    } finally {
      setCheckingCoverage(false);
    }
  };

  return (
    <SectionContainer
      as="section"
      id="hero"
      centered={false}
      padding="spacious"
      maxWidth="full"
      className="rounded-none bg-hero-gradient text-white"
    >
      <div className="mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <SectionHeading tone="sun" className="!text-saubio-sun">
            {t('hero.badge')}
          </SectionHeading>
        <SectionTitle as="h1" size="large" className="!text-white">
          {t('hero.titleLine')}
          <br />
          <span className="text-saubio-sun">{t('hero.titleHighlight')}</span>
        </SectionTitle>
        <SectionDescription size="large" className="!text-white/85">
          {t('hero.description')}
        </SectionDescription>
        <div className="grid gap-4 sm:grid-cols-3">
          <AnalyticsCard
            variant="glass"
            size="compact"
            label={stats.availability.label}
            value={stats.availability.value}
            icon={<Clock3 className="h-4 w-4" />}
          />
          <AnalyticsCard
            variant="glass"
            size="compact"
            label={stats.satisfaction.label}
            value={stats.satisfaction.value}
            icon={<ShieldCheck className="h-4 w-4" />}
          />
          <AnalyticsCard
            variant="glass"
            size="compact"
            label={stats.eco.label}
            value={stats.eco.value}
            icon={<Leaf className="h-4 w-4" />}
          />
        </div>
        </div>
        <div className="relative mx-auto w-full max-w-xl justify-self-end">
          <div className="absolute -top-8 -right-6 hidden h-32 w-32 rounded-full border-4 border-saubio-sun/60 md:block" />
          <div className="relative flex h-full flex-col rounded-5xl bg-white/10 p-6 backdrop-blur">
            <div className="flex flex-1 flex-col gap-6 rounded-4xl bg-white/90 p-6 text-saubio-forest shadow-soft-lg">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-saubio-moss">
              {t('hero.postalLabel', 'Où souhaitez-vous être servi ?')}
            </span>
            <form onSubmit={handlePlannerRedirect} className="space-y-4">
              <input
                value={postalCode}
                onChange={(event) => setPostalCode(event.target.value)}
                placeholder={t('hero.postalPlaceholder', 'Code postal')}
                className="w-full rounded-3xl border border-saubio-moss/30 bg-white px-5 py-4 text-base text-saubio-forest outline-none focus:border-saubio-sun"
              />
              {postalError ? <p className="text-xs text-red-500">{postalError}</p> : null}
              <p className="text-xs text-saubio-slate/70">
                {t(
                  'hero.postalHelp',
                  'Entrez votre code postal pour découvrir les disponibilités et tarifs près de vous.'
                )}
              </p>
              <button
                type="submit"
                disabled={isCheckingCoverage}
                className="w-full rounded-3xl bg-saubio-sun px-6 py-3 text-sm font-semibold uppercase tracking-wide text-saubio-forest shadow-soft-lg hover:bg-yellow-300 disabled:opacity-70"
              >
                {isCheckingCoverage ? t('hero.postalChecking', 'Vérification…') : t('hero.postalCta', 'Planifier')}
              </button>
            </form>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/providers"
                className="flex-1 rounded-full border border-saubio-forest/20 px-6 py-3 text-center text-sm font-semibold text-saubio-forest hover:border-saubio-forest"
              >
                {t('hero.secondaryCta')}
              </Link>
              <Link
                href="/register"
                className="flex-1 rounded-full border border-saubio-forest/10 px-6 py-3 text-center text-sm font-semibold text-saubio-forest/80 hover:border-saubio-forest"
              >
                {t('hero.tertiaryCta')}
              </Link>
            </div>
          </div>
          <p className="mt-4 text-center text-xs text-white/70">
            {t('hero.postalDisclaimer', 'Vos informations resteront confidentielles.')}
          </p>
        </div>
        </div>
      </div>
    </SectionContainer>
  );
}
