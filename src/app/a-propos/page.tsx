'use client';

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
  title: 'Saubio – Über uns',
  description:
    'Erfahren Sie, warum Saubio nachhaltige Reinigungsservices mit geprüften Teams in Deutschland anbietet.',
};

export default function AproposPage() {
  const { t } = useTranslation();
  const pillars = t('pages.about.pillars', { returnObjects: true }) as Array<{
    title: string;
    body: string;
  }>;

  return (
    <>
      <SiteHeader />
      <main className="space-y-12 py-16">
        <SectionContainer as="section" padding="spacious" className="rounded-5xl bg-white shadow-soft-lg">
          <SectionHeading>{t('pages.about.heading')}</SectionHeading>
          <SectionTitle size="large">{t('pages.about.title')}</SectionTitle>
          <SectionDescription className="max-w-2xl">
            {t('pages.about.description')}
          </SectionDescription>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {pillars.map((pillar) => (
              <article
                key={pillar.title}
                className="rounded-4xl border border-saubio-moss/15 bg-saubio-cream/60 p-6 text-sm text-saubio-slate"
              >
                <h3 className="text-base font-semibold text-saubio-forest">{pillar.title}</h3>
                <p className="mt-3 leading-relaxed">{pillar.body}</p>
              </article>
            ))}
          </div>
        </SectionContainer>
      </main>
      <SiteFooter />
    </>
  );
}
