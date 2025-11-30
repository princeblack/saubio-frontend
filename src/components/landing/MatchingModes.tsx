'use client';

import { useTranslation } from 'react-i18next';

export function MatchingModes() {
  const { t } = useTranslation();
  const modes = t('matching.modes', { returnObjects: true }) as {
    title: string;
    description: string;
    points: string[];
  }[];

  return (
    <section
      id="prestataires"
      className="section-container grid gap-8 rounded-5xl bg-saubio-forest px-6 py-16 text-white lg:grid-cols-2 lg:px-16"
    >
      <div className="space-y-4">
        <span className="section-heading text-saubio-sun">{t('matching.heading')}</span>
        <h2 className="headline !text-white">{t('matching.title')}</h2>
        <p className="subheadline !text-white/80">{t('matching.description')}</p>
      </div>
      <div className="grid gap-6">
        {modes.map((mode) => (
          <div
            key={mode.title}
            className="space-y-4 rounded-4xl border border-white/15 bg-white/10 p-6 backdrop-blur"
          >
            <h3 className="text-2xl font-semibold text-saubio-sun">{mode.title}</h3>
            <p className="text-sm text-white/80">{mode.description}</p>
            <ul className="grid gap-3 text-sm text-white/80">
              {mode.points.map((point) => (
                <li key={point} className="flex gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-saubio-sun" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
