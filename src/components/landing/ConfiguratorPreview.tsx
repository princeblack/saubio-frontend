'use client';

import { useTranslation } from 'react-i18next';

export function ConfiguratorPreview() {
  const { t } = useTranslation();
  const steps = t('configurator.steps', { returnObjects: true }) as string[];
  const frequencies = t('configurator.frequencies', { returnObjects: true }) as string[];

  return (
    <section
      id="services"
      className="section-container grid gap-10 rounded-5xl bg-white px-6 py-16 shadow-soft-lg lg:grid-cols-[1.1fr_0.9fr] lg:px-16"
    >
      <div>
        <span className="section-heading">{t('configurator.heading')}</span>
        <h2 className="headline">{t('configurator.title')}</h2>
        <p className="subheadline">{t('configurator.description')}</p>
        <ul className="mt-8 grid gap-4 text-sm text-saubio-slate/80">
          {steps.map((step, index) => (
            <li
              key={step}
              className="rounded-3xl border border-saubio-moss/15 bg-saubio-mist px-5 py-4"
            >
              {index + 1}. {step}
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-4xl border border-saubio-moss/10 bg-saubio-mist p-6">
        <div className="space-y-4 rounded-4xl bg-white p-6 shadow-soft-lg">
          <div className="grid gap-2">
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-saubio-slate/50">
              {t('configurator.frequencyLabel')}
            </label>
            <div className="flex gap-2 text-sm font-semibold">
              {frequencies.map((option, index) => (
                <button
                  key={option}
                  type="button"
                  className={`rounded-full px-4 py-2 ${
                    index === 1
                      ? 'bg-saubio-forest text-white'
                      : 'bg-saubio-mist text-saubio-slate/70'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
          <div className="grid gap-3">
            <div className="rounded-3xl border border-saubio-moss/15 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.2em] text-saubio-slate/50">
                {t('configurator.modeLabel')}
              </p>
              <p className="text-sm font-semibold text-saubio-forest">
                {t('configurator.modeValue')}
              </p>
            </div>
            <div className="rounded-3xl border border-saubio-moss/15 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.2em] text-saubio-slate/50">
                {t('configurator.preferredLabel')}
              </p>
              <p className="text-sm font-semibold text-saubio-forest">
                {t('configurator.preferredValue')}
              </p>
            </div>
          </div>
          <div className="rounded-3xl border border-saubio-moss/15 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.2em] text-saubio-slate/50">
              {t('configurator.controlLabel')}
            </p>
            <p className="text-sm font-semibold text-saubio-forest">
              {t('configurator.controlValue')}
            </p>
          </div>
          <div className="rounded-3xl border border-saubio-moss/15 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.2em] text-saubio-slate/50">
              {t('configurator.extraLabel')}
            </p>
            <p className="text-sm font-semibold text-saubio-forest">
              {t('configurator.extraValue')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
