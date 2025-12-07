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
  title: 'Saubio – Nachhaltige Reinigungsservices in Deutschland',
  description:
    'Saubio bringt Privat- und Geschäftskund:innen mit geprüften Reinigungskräften in deutschen Großstädten zusammen – inkl. Öko-Produkten und Support.',
  keywords: ['Saubio', 'Reinigungsservice', 'Putzfrau Berlin', 'Nachhaltige Reinigung', 'Haushaltshilfe Deutschland'],
  alternates: {
    canonical: 'https://saubio.de/',
  },
  openGraph: {
    title: 'Saubio – Services de nettoyage professionnels',
    description: 'Buchen Sie geprüfte Reinigungskräfte, vergleichen Sie Preise und verfolgen Sie Ihre Einsätze mit Saubio.',
    url: 'https://saubio.de/',
    siteName: 'Saubio',
    locale: 'de_DE',
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
      'Saubio vermittelt zertifizierte Reinigungskräfte in Deutschland – mit Öko-Produkten und persönlichem Support.',
    areaServed: { '@type': 'Country', name: 'Germany' },
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
