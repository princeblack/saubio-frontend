'use client';

import { formatEuro } from '@saubio/utils';
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

const estimatedAmount = formatEuro(189.5);

export function HeroSection() {
  const { t } = useTranslation();
  const router = useRouter();
  const [postalCode, setPostalCode] = useState('');
  const [postalError, setPostalError] = useState<string | null>(null);

  const stats = t('hero.stats', { returnObjects: true }) as {
    availability: { label: string; value: string };
    satisfaction: { label: string; value: string };
    eco: { label: string; value: string };
  };

  const preview = t('hero.preview', { returnObjects: true }) as {
    title: string;
    serviceLabel?: string;
    service: string;
    dateLabel: string;
    dateValue: string;
    providersLabel: string;
    providersValue: string;
    ecoLabel: string;
    ecoValue: string;
    totalLabel: string;
    finalize: string;
  };
  const previewTotalValue = t('hero.preview.totalValue', { amount: estimatedAmount });

  const handlePlannerRedirect = (event: FormEvent<HTMLFormElement>) => {
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
    router.push(`/bookings/planning?postalCode=${encodeURIComponent(normalized)}`);
  };

  return (
    <SectionContainer
      as="section"
      id="hero"
      centered
      padding="spacious"
      className="grid gap-10 rounded-5xl bg-hero-gradient text-white lg:grid-cols-[1.1fr_0.9fr]"
    >
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
        <div className="space-y-3">
          <form onSubmit={handlePlannerRedirect} className="rounded-3xl border border-white/20 bg-white/10 p-4 backdrop-blur">
            <label className="flex flex-col gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-white/70">
              {t('hero.postalLabel', 'Où souhaitez-vous être servi ?')}
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  value={postalCode}
                  onChange={(event) => setPostalCode(event.target.value)}
                  placeholder={t('hero.postalPlaceholder', 'Code postal')}
                  className="flex-1 rounded-2xl border border-white/30 bg-white/80 px-4 py-3 text-base font-normal text-saubio-forest outline-none focus:border-saubio-sun"
                />
                <button
                  type="submit"
                  className="rounded-2xl bg-saubio-sun px-6 py-3 text-sm font-semibold uppercase tracking-wide text-saubio-forest shadow-soft-lg hover:bg-yellow-300"
                >
                  {t('hero.postalCta', 'Planifier')}
                </button>
              </div>
            </label>
            <p className="mt-2 text-xs text-white/80">
              {t(
                'hero.postalHelp',
                'Entrez votre code postal pour découvrir les disponibilités et tarifs près de vous.'
              )}
            </p>
            {postalError ? <p className="mt-2 text-xs text-red-200">{postalError}</p> : null}
          </form>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/register"
              className="rounded-full border border-white/40 px-6 py-3 text-sm font-semibold text-white hover:border-white"
            >
              {t('hero.secondaryCta')}
            </Link>
            <Link
              href="/register/provider"
              className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white/80 hover:border-white hover:text-white"
            >
              {t('hero.tertiaryCta')}
            </Link>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <AnalyticsCard
            variant="glass"
            label={stats.availability.label}
            value={stats.availability.value}
            icon={<Clock3 className="h-4 w-4" />}
          />
          <AnalyticsCard
            variant="glass"
            label={stats.satisfaction.label}
            value={stats.satisfaction.value}
            icon={<ShieldCheck className="h-4 w-4" />}
          />
          <AnalyticsCard
            variant="glass"
            label={stats.eco.label}
            value={stats.eco.value}
            icon={<Leaf className="h-4 w-4" />}
          />
        </div>
      </div>
      <div className="relative">
        <div className="absolute -top-8 -right-6 hidden h-32 w-32 rounded-full border-4 border-saubio-sun/60 md:block" />
        <div className="relative h-full rounded-5xl bg-white/10 p-6 backdrop-blur">
          <div className="flex flex-col gap-4 rounded-4xl bg-white/90 p-6 text-saubio-slate shadow-soft-lg">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-saubio-moss">
              {preview.title}
            </span>
            <div className="space-y-4 text-sm">
              <div>
                {preview.serviceLabel ? (
                  <label className="text-xs font-semibold uppercase tracking-[0.2em] text-saubio-slate/50">
                    {preview.serviceLabel}
                  </label>
                ) : null}
                <p className="mt-1 rounded-2xl bg-saubio-mist px-4 py-2 font-semibold text-saubio-forest">
                  {preview.service}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-saubio-moss/20 bg-white px-4 py-3">
                  <p className="text-xs text-saubio-slate/60">{preview.dateLabel}</p>
                  <p className="text-sm font-semibold text-saubio-forest">{preview.dateValue}</p>
                </div>
                <div className="rounded-2xl border border-saubio-moss/20 bg-white px-4 py-3">
                  <p className="text-xs text-saubio-slate/60">{preview.providersLabel}</p>
                  <p className="text-sm font-semibold text-saubio-forest">{preview.providersValue}</p>
                </div>
              </div>
              <div className="rounded-2xl border border-saubio-moss/20 bg-white px-4 py-3">
                <p className="text-xs text-saubio-slate/60">{preview.ecoLabel}</p>
                <p className="text-sm font-semibold text-saubio-forest">{preview.ecoValue}</p>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-saubio-slate/70">{preview.totalLabel}</span>
                <span className="text-xl font-semibold text-saubio-forest">
                  {previewTotalValue}
                </span>
              </div>
            </div>
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-full bg-saubio-forest px-6 py-3 text-sm font-semibold text-white hover:bg-saubio-moss"
            >
              {preview.finalize}
            </Link>
          </div>
        </div>
      </div>
    </SectionContainer>
  );
}
