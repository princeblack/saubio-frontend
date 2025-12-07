import type { Metadata } from 'next';
import Script from 'next/script';
import {
  AboutSection,
  BenefitsSection,
  CitiesSection,
  FinalCta,
  HeroSection,
  HowItWorks,
  MatchingModes,
  ServiceGrid,
  Testimonials,
} from '../components/landing';
import { SiteFooter } from '../components/layout/SiteFooter';
import { SiteHeader } from '../components/layout/SiteHeader';

export const metadata: Metadata = {
  title: 'Saubio – Nettoyage durable en Allemagne',
  description:
    'Saubio connecte particuliers et entreprises avec des prestataires de nettoyage certifiés, produits écologiques et support 7j/7.',
  keywords: [
    'saubio',
    'nettoyage durable',
    'prestataire ménage',
    'services de nettoyage Allemagne',
    'ménage éco',
  ],
  alternates: {
    canonical: 'https://saubio.de/',
  },
  openGraph: {
    title: 'Saubio – Services de nettoyage professionnels',
    description:
      'Réservez un prestataire de confiance, comparez les tarifs et suivez vos missions avec Saubio.',
    url: 'https://saubio.de/',
    siteName: 'Saubio',
    locale: 'fr_FR',
    type: 'website',
  },
};

export default function HomePage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Saubio',
    url: 'https://saubio.de',
    logo: 'https://saubio.de/saubio-wordmark.svg',
    description:
      'Plateforme Saubio : prestataires de nettoyage certifiés, produits écologiques et support client 7j/7.',
    areaServed: {
      '@type': 'Country',
      name: 'Germany',
    },
    contactPoint: [
      {
        '@type': 'ContactPoint',
        email: 'support@saubio.de',
        contactType: 'customer support',
        availableLanguage: ['French', 'German', 'English'],
      },
    ],
    sameAs: ['https://www.linkedin.com/company/saubio', 'https://www.instagram.com/saubio'],
  };

  return (
    <>
      <SiteHeader />
      <div className="bg-amber-100 text-amber-900 text-center py-3 text-sm font-medium">
        Saubio est actuellement en développement. Les services sont indisponibles pour le moment.
      </div>
      <Script
        id="saubio-ld"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="space-y-10 pb-24">
        <HeroSection />
        <HowItWorks />
        <AboutSection />
        <BenefitsSection />
        <ServiceGrid />
        <MatchingModes />
        {/* <Testimonials /> */}
        {/* <CitiesSection /> */}
        {/* <FinalCta /> */}
      </main>
      <SiteFooter />
    </>
  );
}
