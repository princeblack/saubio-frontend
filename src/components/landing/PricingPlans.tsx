'use client';

import { useTranslation } from 'react-i18next';

interface PricingPlan {
  name: string;
  audience: string;
  price: string;
  features: string[];
  highlight?: boolean;
}

export function PricingPlans() {
  const { t } = useTranslation();
  const plans = t('pricing.plans', { returnObjects: true }) as PricingPlan[];

  return (
    <section id="tarifs" className="section-container">
      <div className="mb-12 text-center">
        <span className="section-heading">{t('pricing.heading')}</span>
        <h2 className="headline">{t('pricing.title')}</h2>
        <p className="subheadline mx-auto max-w-2xl">{t('pricing.description')}</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`flex h-full flex-col rounded-4xl border px-6 py-10 shadow-soft-lg ${
              plan.highlight ? 'border-saubio-sun bg-white' : 'border-saubio-moss/15 bg-white'
            }`}
          >
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-saubio-moss">
              {plan.audience}
            </span>
            <h3 className="mt-3 text-2xl font-semibold text-saubio-forest">{plan.name}</h3>
            <p className="mt-2 text-sm text-saubio-slate/70">{plan.price}</p>
            <ul className="mt-6 flex flex-1 flex-col gap-3 text-sm text-saubio-slate/80">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-saubio-forest" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <button
              type="button"
              className={`mt-8 rounded-full px-5 py-3 text-sm font-semibold ${
                plan.highlight
                  ? 'bg-saubio-forest text-white hover:bg-saubio-moss'
                  : 'border border-saubio-forest/10 text-saubio-forest hover:border-saubio-forest/30'
              }`}
            >
              {t('pricing.cta')}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
