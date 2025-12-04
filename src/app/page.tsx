import {
  AboutSection,
  FinalCta,
  HeroSection,
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
      <main className="space-y-16 pb-24">
        <HeroSection />
        <AboutSection />
        <ServiceGrid />
        <MatchingModes />
        <Testimonials />
        <FinalCta />
      </main>
      <SiteFooter />
    </>
  );
}
