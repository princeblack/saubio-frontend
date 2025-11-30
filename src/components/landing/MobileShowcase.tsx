'use client';

import { useTranslation } from 'react-i18next';

interface Flow {
  id: string;
  title: string;
  summary: string;
  items: string[];
}

export function MobileShowcase() {
  const { t } = useTranslation();
  const flows = t('mobile.flows', { returnObjects: true }) as Flow[];

  return (
    <section className="section-container grid gap-12 lg:grid-cols-[1.05fr_0.95fr]">
      <div className="rounded-5xl bg-saubio-forest px-8 py-12 text-white shadow-soft-lg">
        <span className="section-heading text-saubio-sun">{t('mobile.heading')}</span>
        <h2 className="headline !text-white">{t('mobile.title')}</h2>
        <p className="subheadline !text-white/80">{t('mobile.description')}</p>
        <ul className="mt-8 grid gap-4 text-sm text-white/80">
          {flows.map((flow) => (
            <li key={flow.id}>{flow.summary}</li>
          ))}
        </ul>
      </div>
      <div className="relative flex items-center justify-center">
        <div className="absolute -bottom-6 -left-6 h-32 w-32 rounded-full bg-saubio-sun/50 blur-2xl" />
        <div className="relative grid gap-6 sm:grid-cols-2">
          {flows.map((flow) => (
            <div
              key={flow.id}
              className={`rounded-4xl border border-saubio-moss/10 bg-white p-6 shadow-soft-lg ${
                flow.id === 'companies' ? 'sm:col-span-2' : ''
              }`}
            >
              <p className="text-xs uppercase tracking-[0.3em] text-saubio-moss">
                {flow.title}
              </p>
              <ul className="mt-4 space-y-2 text-sm text-saubio-slate/80">
                {flow.items.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
