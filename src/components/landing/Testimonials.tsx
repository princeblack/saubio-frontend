'use client';

import { useTranslation } from 'react-i18next';

interface Testimonial {
  name: string;
  role: string;
  quote: string;
  score: string;
}

export function Testimonials() {
  const { t } = useTranslation();
  const testimonials = t('testimonials.items', { returnObjects: true }) as Testimonial[];

  return (
    <section className="section-container" aria-labelledby="testimonials-title">
      <div className="mb-12 text-center">
        <span className="section-heading">{t('testimonials.heading')}</span>
        <h2 id="testimonials-title" className="headline">
          {t('testimonials.title')}
        </h2>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        {testimonials.map((testimonial) => (
          <article
            key={testimonial.name}
            className="flex h-full flex-col rounded-4xl border border-saubio-moss/15 bg-white p-6 text-left shadow-soft-lg"
          >
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.3em]">
              <span className="text-saubio-moss">{testimonial.role}</span>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-saubio-forest">
                {testimonial.score}
              </span>
            </div>
            <p className="mt-6 text-base font-medium text-saubio-forest">“{testimonial.quote}”</p>
            <p className="mt-auto pt-8 text-sm font-semibold text-saubio-slate/70">
              {testimonial.name}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
