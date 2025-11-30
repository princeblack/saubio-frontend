'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';

export function FinalCta() {
  const { t } = useTranslation();
  const points = t('cta.points', { returnObjects: true }) as string[];

  return (
    <section className="section-container rounded-5xl bg-saubio-forest px-6 py-16 text-white lg:px-16">
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <span className="section-heading text-saubio-sun">{t('cta.heading')}</span>
          <h2 className="headline !text-white">{t('cta.title')}</h2>
          <p className="subheadline !text-white/80">{t('cta.description')}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/register"
              className="rounded-full bg-saubio-sun px-6 py-3 text-sm font-semibold text-saubio-forest shadow-soft-lg hover:bg-yellow-300"
            >
              {t('cta.primary')}
            </Link>
            <Link
              href="/contact"
              className="rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white hover:border-white"
            >
              {t('cta.secondary')}
            </Link>
          </div>
        </div>
        <div className="rounded-4xl border border-white/15 bg-white/10 p-6 text-sm text-white/80 backdrop-blur">
          <p className="text-xs uppercase tracking-[0.3em] text-saubio-sun">{t('cta.pointsTitle')}</p>
          <ul className="mt-5 space-y-3">
            {points.map((point) => (
              <li key={point}>• {point}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
