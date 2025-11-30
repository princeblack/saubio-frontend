'use client';

import { useTranslation } from 'react-i18next';

export function AboutSection() {
  const { t } = useTranslation();
  const highlights = t('about.highlights', { returnObjects: true }) as {
    title: string;
    description: string;
  }[];
  const cards = t('about.cards', { returnObjects: true }) as {
    title: string;
    description: string;
  }[];

  return (
    <section
      id="about"
      className="section-container grid gap-12 lg:grid-cols-[0.9fr_1.1fr]"
    >
      <div className="space-y-6">
        <span className="section-heading">{t('about.heading')}</span>
        <h2 className="headline">{t('about.title')}</h2>
        <p className="subheadline">{t('about.description')}</p>
        <dl className="grid gap-6 sm:grid-cols-2">
          {highlights.map((item) => (
            <div key={item.title}>
              <dt className="text-sm font-semibold text-saubio-forest">{item.title}</dt>
              <dd className="mt-2 text-sm text-saubio-slate/80">{item.description}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div className="relative">
        <div className="absolute -left-8 top-10 hidden h-36 w-36 rounded-full bg-saubio-sun/60 blur-xl md:block" />
        <div className="relative grid gap-6 sm:grid-cols-2">
          {cards.map((card) => (
            <div
              key={card.title}
              className="rounded-4xl border border-saubio-moss/10 bg-white p-6 text-sm text-saubio-slate shadow-soft-lg"
            >
              <h3 className="text-base font-semibold text-saubio-forest">{card.title}</h3>
              <p className="mt-2 text-saubio-slate/70">{card.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
