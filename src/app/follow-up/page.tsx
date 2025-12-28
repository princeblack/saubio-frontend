'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { createApiClient } from '@saubio/utils';
import {
  SectionContainer,
  SectionHeading,
  SectionTitle,
  SectionDescription,
  SurfaceCard,
} from '@saubio/ui';
import { CheckCircle2, Mail, MapPin } from 'lucide-react';
import { SiteHeader } from '../../components/layout/SiteHeader';

type FollowUpBullet = {
  title: string;
  description: string;
};

export default function FollowUpPage() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialPostal = searchParams?.get('postalCode') ?? '';
  const [email, setEmail] = useState('');
  const [postalCode, setPostalCode] = useState(initialPostal);
  const [marketingConsent, setMarketingConsent] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const bullets = t('followUp.bullets', { returnObjects: true }) as FollowUpBullet[];

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const client = createApiClient({ includeCredentials: false });
      await client.submitPostalFollowUp({
        email,
        postalCode,
        marketingConsent,
      });
      setSubmitted(true);
    } catch (submitError) {
      console.error(submitError);
      setError(t('followUp.form.error', 'We could not save your request. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <SiteHeader />
      <div className="bg-gradient-to-b from-saubio-mist/60 via-white to-white">
        <SectionContainer id="follow-up" padding="spacious" maxWidth="full">
        <div className="mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <SectionHeading>{t('followUp.badge', 'Coming soon')}</SectionHeading>
            <SectionTitle size="large">{t('followUp.title', 'We are expanding')}</SectionTitle>
            <SectionDescription size="large">
              {t(
                'followUp.subtitle',
                'Leave your contact details and be informed as soon as Saubio opens in your area.'
              )}
            </SectionDescription>
            <div className="space-y-4 rounded-4xl border border-saubio-mist/50 bg-white/70 p-6 shadow-soft-lg">
              {bullets.map((bullet) => (
                <div key={bullet.title} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-1 h-5 w-5 text-saubio-forest" />
                  <div>
                    <p className="font-semibold text-saubio-forest">{bullet.title}</p>
                    <p className="text-sm text-saubio-slate/70">{bullet.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <SurfaceCard padding="xl" className="self-start">
            <div className="space-y-6 p-4 sm:p-6">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-saubio-slate/60">
                  {t('followUp.form.title', 'Notify me')}
                </p>
                <p className="text-sm text-saubio-slate/70">
                  {t(
                    'followUp.subtitle',
                    'Leave your contact details and be notified the moment Saubio goes live in your neighborhood.'
                  )}
                </p>
              </div>
              {submitted ? (
                <div className="space-y-4 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-saubio-mist/60 text-saubio-forest">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <h2 className="text-xl font-semibold text-saubio-forest">
                    {t('followUp.form.successTitle', 'Thank you!')}
                  </h2>
                  <p className="text-sm text-saubio-slate/70">
                    {t(
                      'followUp.form.successDescription',
                      'We will contact you as soon as we launch in your postal code.'
                    )}
                  </p>
                  <button
                    type="button"
                    onClick={() => router.push('/')}
                    className="w-full rounded-full border border-saubio-forest/30 px-5 py-3 text-sm font-semibold text-saubio-forest transition hover:border-saubio-forest/60"
                  >
                    {t('followUp.form.backHome', 'Back to homepage')}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <label className="block space-y-2 text-sm text-saubio-slate/80">
                    <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-saubio-slate/60">
                      <Mail className="h-4 w-4" />
                      {t('followUp.form.email', 'Email address')}
                    </span>
                    <input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      required
                      className="w-full rounded-3xl border border-saubio-forest/15 bg-white px-5 py-3 text-saubio-forest outline-none focus:border-saubio-forest"
                    />
                  </label>
                  <label className="block space-y-2 text-sm text-saubio-slate/80">
                    <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-saubio-slate/60">
                      <MapPin className="h-4 w-4" />
                      {t('followUp.form.postalCode', 'Postal code')}
                    </span>
                    <input
                      value={postalCode}
                      onChange={(event) => setPostalCode(event.target.value)}
                      required
                      className="w-full rounded-3xl border border-saubio-forest/15 bg-white px-5 py-3 text-saubio-forest outline-none focus:border-saubio-forest"
                    />
                  </label>
                  <label className="flex items-start gap-3 rounded-3xl border border-saubio-forest/10 bg-saubio-mist/30 px-4 py-3 text-xs text-saubio-slate/70">
                    <input
                      type="checkbox"
                      checked={marketingConsent}
                      onChange={(event) => setMarketingConsent(event.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-saubio-forest/40 text-saubio-forest focus:ring-saubio-forest"
                    />
                    <span>{t('followUp.form.consent')}</span>
                  </label>
                  {error ? <p className="text-xs text-red-500">{error}</p> : null}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded-full bg-saubio-forest px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-saubio-moss disabled:opacity-70"
                  >
                    {submitting ? t('system.loading.generic', 'Loading…') : t('followUp.form.submit')}
                  </button>
                </form>
              )}
            </div>
          </SurfaceCard>
        </div>
        </SectionContainer>
      </div>
    </>
  );
}
