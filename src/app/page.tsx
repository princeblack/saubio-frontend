import {
  AboutSection,
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
      <main className="space-y-24 pb-24">
        <HeroSection />
        <HowItWorks />
        <AboutSection />
        <ServiceGrid />
        <MatchingModes />
        <Testimonials />
        {/* <FinalCta /> */}
      </main>
      <SiteFooter />
    </>
  );
}
