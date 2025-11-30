'use client';

import { useTranslation } from 'react-i18next';

export function EcoHighlight() {
  const { t } = useTranslation();
  const points = t('eco.points', { returnObjects: true }) as string[];
  const metrics = t('eco.metrics', { returnObjects: true }) as Record<string, string>;

  return (
    <section
      id="entreprises"
      className="section-container grid gap-12 rounded-5xl bg-saubio-cream px-6 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:px-16"
    >
      <div>
        <span className="section-heading">{t('eco.heading')}</span>
        <h2 className="headline">{t('eco.title')}</h2>
        <p className="subheadline">{t('eco.description')}</p>
        <ul className="mt-8 grid gap-4 text-sm text-saubio-slate/80 sm:grid-cols-2">
          {points.map((point) => (
            <li
              key={point}
              className="rounded-3xl border border-saubio-moss/20 bg-white px-5 py-4"
            >
              {point}
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-4xl border border-saubio-moss/15 bg-white p-6 text-sm text-saubio-slate shadow-soft-lg">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-saubio-moss">
          {t('eco.metricsTitle')}
        </p>
        <dl className="mt-6 space-y-5 text-sm">
          {Object.entries(metrics).map(([key, value]) => (
            <div key={key}>
              <dt className="text-saubio-slate/60">
                {t(`eco.metricLabels.${key}`, { defaultValue: key })}
              </dt>
              <dd className="text-2xl font-semibold text-saubio-forest">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
