'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import { SiteHeader } from '../layout/SiteHeader';
import { SiteFooter } from '../layout/SiteFooter';
import {
  SectionHeading,
  SectionTitle,
  SectionDescription,
  SurfaceCard,
  SectionContainer,
} from '@saubio/ui';
import { CheckCircle, CalendarClock, Leaf, ShieldCheck } from 'lucide-react';

const PERK_CONFIG = [
  {
    key: 'planning',
    icon: CalendarClock,
    fallbackTitle: 'Planbare Aufträge',
    fallbackDescription:
      'Du entscheidest selbst, welche Stadtteile und Uhrzeiten für dich passen – wir zeigen dir passende Anfragen in Echtzeit.',
  },
  {
    key: 'payments',
    icon: CheckCircle,
    fallbackTitle: 'Faire Bezahlung',
    fallbackDescription:
      'Transparente Nettopreise pro Stunde, pünktliche Auszahlungen und Bonusprogramme für Stammkund:innen.',
  },
  {
    key: 'insurance',
    icon: ShieldCheck,
    fallbackTitle: 'Versichert & begleitet',
    fallbackDescription:
      'Berufshaftpflicht-Schutz, Support bei Fragen und digitale Tools für Dokumente, Rechnungen und Planung.',
  },
  {
    key: 'sustainability',
    icon: Leaf,
    fallbackTitle: 'Nachhaltige Missionen',
    fallbackDescription:
      'Saubio setzt auf geprüfte Öko-Produkte und Kund:innen, die Wert auf langfristige Zusammenarbeit legen.',
  },
] as const;

const STEP_CONFIG = [
  {
    key: 'profile',
    fallbackLabel: '1. Kurzes Profil',
    fallbackBody:
      'Sag uns, ob du als Einzelperson oder kleines Team startest. Wir prüfen deine Basisdaten innerhalb von 24h.',
  },
  {
    key: 'onboarding',
    fallbackLabel: '2. Onboarding-Call',
    fallbackBody:
      'Unser Team bespricht Verfügbarkeit, Wunschgebiete und erklärt dir die App. Du erhältst Zugang zum Partner-Portal.',
  },
  {
    key: 'firstMission',
    fallbackLabel: '3. Erste Mission buchen',
    fallbackBody:
      'Wähle passende Aufträge oder lass dich automatisch matchen. Du bestätigst Einsätze mit einem Klick.',
  },
] as const;

export function ProvidersLandingContent() {
  const { t } = useTranslation();
  const perks = PERK_CONFIG.map(({ key, icon, fallbackTitle, fallbackDescription }) => ({
    icon,
    title: t(`providersLanding.perks.${key}.title`, fallbackTitle),
    description: t(`providersLanding.perks.${key}.description`, fallbackDescription),
  }));
  const steps = STEP_CONFIG.map(({ key, fallbackLabel, fallbackBody }) => ({
    label: t(`providersLanding.steps.${key}.label`, fallbackLabel),
    body: t(`providersLanding.steps.${key}.body`, fallbackBody),
  }));

  return (
    <div className="min-h-screen bg-saubio-mist/40">
      <SiteHeader />
      <main className="space-y-16 pb-16">
        <SectionContainer
          as="section"
          padding="spacious"
          maxWidth="full"
          className="bg-gradient-to-br from-saubio-forest to-saubio-moss text-white"
        >
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-6">
              <SectionHeading className="!text-saubio-sun">
                {t('providersLanding.hero.eyebrow', 'Flexibel arbeiten mit Saubio')}
              </SectionHeading>
              <SectionTitle className="!text-white">
                {t('providersLanding.hero.title', 'Werde Teil unseres Dienstleister-Netzwerks')}
              </SectionTitle>
              <SectionDescription className="!text-white/85" size="large">
                {t(
                  'providersLanding.hero.description',
                  'Saubio bringt erfahrene Reinigungskräfte mit verlässlichen Kund:innen zusammen. Wir übernehmen Marketing, Rechnungen und Support – du konzentrierst dich auf deine Einsätze.'
                )}
              </SectionDescription>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/register/provider"
                  className="flex-1 rounded-full bg-white px-6 py-3 text-center text-sm font-semibold text-saubio-forest shadow-soft-lg hover:bg-saubio-sun/90"
                >
                  {t('providersLanding.hero.primaryCta', 'Jetzt als Dienstleister registrieren')}
                </Link>
                <Link
                  href="#benefits"
                  className="flex-1 rounded-full border border-white/40 px-6 py-3 text-center text-sm font-semibold text-white/90"
                >
                  {t('providersLanding.hero.secondaryCta', 'Mehr erfahren')}
                </Link>
              </div>
            </div>
            <figure className="relative h-full w-full">
              <div className="relative h-full w-full overflow-hidden rounded-5xl border border-white/30 shadow-soft-lg">
                <Image
                  src="/providers/team.png"
                  alt={t('providersLanding.hero.figureAlt', 'Diverses Saubio-Dienstleisterteam')}
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width:1024px) 100vw, 520px"
                />
              </div>
              <figcaption className="mt-4 text-center text-xs font-semibold uppercase tracking-[0.3em] text-white/70">
                {t('providersLanding.hero.caption', 'Gemeinsam mit geprüften Profis in ganz Deutschland')}
              </figcaption>
            </figure>
          </div>
        </SectionContainer>

        <SectionContainer id="benefits" as="section" padding="comfortable">
          <div className="space-y-4 text-center">
            <SectionHeading>{t('providersLanding.benefits.heading', 'Vorteile für Partner:innen')}</SectionHeading>
            <SectionTitle size="default">{t('providersLanding.benefits.title', 'Warum Saubio?')}</SectionTitle>
            <SectionDescription className="mx-auto max-w-3xl text-saubio-slate/80">
              {t(
                'providersLanding.benefits.description',
                'Wir kombinieren persönliche Betreuung mit digitalen Tools: so kannst du Aufträge planen, Kundenbewertungen sammeln und faire Honorare sichern.'
              )}
            </SectionDescription>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {perks.map(({ title, description, icon: Icon }) => (
              <SurfaceCard key={title} padding="lg" className="h-full space-y-3">
                <Icon className="h-8 w-8 text-saubio-forest" />
                <p className="text-lg font-semibold text-saubio-forest">{title}</p>
                <p className="text-sm text-saubio-slate/70">{description}</p>
              </SurfaceCard>
            ))}
          </div>
        </SectionContainer>

        <SectionContainer as="section" padding="comfortable" className="bg-white">
          <div className="mx-auto max-w-5xl space-y-6 text-center">
            <SectionHeading>{t('providersLanding.steps.heading', 'In drei Schritten startklar')}</SectionHeading>
            <SectionTitle>{t('providersLanding.steps.title', 'So läuft das Onboarding')}</SectionTitle>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {steps.map((step) => (
                <SurfaceCard key={step.label} padding="lg" className="h-full space-y-2">
                  <p className="text-sm font-semibold text-saubio-forest">{step.label}</p>
                  <p className="text-sm text-saubio-slate/70">{step.body}</p>
                </SurfaceCard>
              ))}
            </div>
          </div>
        </SectionContainer>

        <SectionContainer as="section" padding="comfortable">
          <SurfaceCard className="mx-auto flex max-w-5xl flex-col gap-6 border-saubio-forest/15 bg-white/90 p-8 text-center">
            <SectionHeading>{t('providersLanding.final.heading', 'Bereit für neue Aufträge?')}</SectionHeading>
            <SectionTitle>{t('providersLanding.final.title', 'Starte jetzt als Saubio-Dienstleister:in')}</SectionTitle>
            <SectionDescription className="text-saubio-slate/70">
              {t(
                'providersLanding.final.description',
                'Registriere dich kostenlos, stelle dein Profil ein und erhalte deine ersten geprüften Anfragen. Unser Team begleitet dich vom ersten Gespräch bis zum regelmäßigen Kundenstamm.'
              )}
            </SectionDescription>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/register/provider"
                className="rounded-full bg-saubio-forest px-8 py-3 text-sm font-semibold text-white shadow-soft-lg hover:bg-saubio-moss"
              >
                {t('providersLanding.hero.primaryCta', 'Jetzt als Dienstleister registrieren')}
              </Link>
              <Link
                href="/prestataire/onboarding"
                className="rounded-full border border-saubio-forest/30 px-8 py-3 text-sm font-semibold text-saubio-forest hover:border-saubio-forest"
              >
                {t('providersLanding.final.secondaryCta', 'Weitere Infos zum Ablauf')}
              </Link>
            </div>
          </SurfaceCard>
        </SectionContainer>
      </main>
      <SiteFooter />
    </div>
  );
}
