import {
  AboutSection,
  ConfiguratorPreview,
  EcoHighlight,
  FinalCta,
  HeroSection,
  MatchingModes,
  MobileShowcase,
  PricingPlans,
  ServiceGrid,
  Testimonials,
  TrustBar,
  WhyChooseUs,
} from '../components/landing';
import { SiteFooter } from '../components/layout/SiteFooter';
import { SiteHeader } from '../components/layout/SiteHeader';

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main className="space-y-16 pb-24">
        <HeroSection />
        <TrustBar />
        <ConfiguratorPreview />
        <AboutSection />
        <ServiceGrid />
        <MatchingModes />
        <EcoHighlight />
        <WhyChooseUs />
        <MobileShowcase />
        <PricingPlans />
        <Testimonials />
        <FinalCta />
      </main>
      <SiteFooter />
    </>
  );
}
