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

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <div className="bg-amber-100 text-amber-900 text-center py-3 text-sm font-medium">
        Saubio est actuellement en développement. Les services sont indisponibles pour le moment.
      </div>
      <main className="space-y-10 pb-24">
        <HeroSection />
        <HowItWorks />
        <AboutSection />
        <BenefitsSection />
        <ServiceGrid />
        <MatchingModes />
        <Testimonials />
        <CitiesSection />
        {/* <FinalCta /> */}
      </main>
      <SiteFooter />
    </>
  );
}
