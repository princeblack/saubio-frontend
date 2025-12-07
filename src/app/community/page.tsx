import type { Metadata } from 'next';
import {
  SectionContainer,
  SectionDescription,
  SectionHeading,
  SectionTitle,
} from '@saubio/ui';
import { SiteFooter } from '../../components/layout/SiteFooter';
import { SiteHeader } from '../../components/layout/SiteHeader';
import communityText from '../../../Community-Richtlinien.md?raw';
import { marked } from 'marked';

export const metadata: Metadata = {
  title: 'Saubio – Community-Richtlinien',
  description:
    'Die Saubio-Richtlinien sorgen für Vertrauen und Sicherheit zwischen Kund:innen und Dienstleister:innen in Deutschland.',
};

export default function CommunityRichtlinienPage() {
  return (
    <>
      <SiteHeader />
      <main className="space-y-12 py-16">
        <SectionContainer as="section" padding="spacious" className="rounded-5xl bg-white shadow-soft-lg">
          <SectionHeading>Saubio</SectionHeading>
          <SectionTitle size="large">Community-Richtlinien</SectionTitle>
          <SectionDescription className="max-w-3xl">
            Gemeinsam sorgen wir für ein respektvolles und sicheres Erlebnis auf saubio.de.
          </SectionDescription>
          <article
            className="mt-8 prose prose-slate max-w-none"
            dangerouslySetInnerHTML={{ __html: marked.parse(communityText) }}
          />
        </SectionContainer>
      </main>
      <SiteFooter />
    </>
  );
}
