'use client';

import type { Metadata } from 'next';
import {
  SectionContainer,
  SectionDescription,
  SectionHeading,
  SectionTitle,
} from '@saubio/ui';
import { SiteFooter } from '../../components/layout/SiteFooter';
import { SiteHeader } from '../../components/layout/SiteHeader';
import { useTranslation } from 'react-i18next';

export const metadata: Metadata = {
  title: 'Saubio – Tarifs et estimations',
  description: 'Comprenez comment les prestataires Saubio fixent leurs tarifs horaires et obtenez une fourchette indicative.',
};

export default function TarifsPage() {
  const { t } = useTranslation();
  const plans = t('pages.tariffs.plans', {
    returnObjects: true,
  }) as Array<{ name: string; price: string; perks: string[] }>;

  return (
    <>
      <SiteHeader />
      <main className="space-y-12 py-16">
        <SectionContainer as="section" padding="spacious" className="rounded-5xl bg-white shadow-soft-lg">
          <SectionHeading>{t('pages.tariffs.heading')}</SectionHeading>
          <SectionTitle size="large">{t('pages.tariffs.title')}</SectionTitle>
          <SectionDescription className="max-w-2xl">
            {t('pages.tariffs.description')}
          </SectionDescription>
          <p className="mt-4 text-sm text-saubio-slate/70">{t('pages.tariffs.disclaimer')}</p>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {plans.map((plan) => (
              <article
                key={plan.name}
                className="rounded-4xl border border-saubio-moss/20 bg-saubio-cream/40 p-6 text-sm text-saubio-slate"
              >
                <h3 className="text-base font-semibold text-saubio-forest">{plan.name}</h3>
                <p className="mt-4 text-xl font-semibold text-saubio-forest">{plan.price}</p>
                <ul className="mt-4 space-y-2">
                  {plan.perks.map((perk) => (
                    <li key={perk}>{perk}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </SectionContainer>
      </main>
      <SiteFooter />
    </>
  );
}
