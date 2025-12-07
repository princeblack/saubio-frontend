import type { Metadata } from 'next';
import {
  SectionContainer,
  SectionDescription,
  SectionHeading,
  SectionTitle,
} from '@saubio/ui';
import { SiteFooter } from '../../components/layout/SiteFooter';
import { SiteHeader } from '../../components/layout/SiteHeader';
import agbText from '../../../AGB.md?raw';
import { marked } from 'marked';

export const metadata: Metadata = {
  title: 'Saubio – Allgemeine Geschäftsbedingungen',
  description: 'Aktuelle AGB zur Nutzung von Saubio für Kund:innen in Deutschland.',
};

export default function AgbPage() {
  return (
    <>
      <SiteHeader />
      <main className="space-y-12 py-16">
        <SectionContainer as="section" padding="spacious" className="rounded-5xl bg-white shadow-soft-lg">
          <SectionHeading>Saubio</SectionHeading>
          <SectionTitle size="large">Allgemeine Geschäftsbedingungen</SectionTitle>
          <SectionDescription className="max-w-2xl">
            Bitte lesen Sie sorgfältig, wie Saubio Verträge vermittelt und welche Nutzungsregeln gelten.
          </SectionDescription>
          <article
            className="mt-8 prose prose-slate max-w-none"
            dangerouslySetInnerHTML={{ __html: marked.parse(agbText) }}
          />
        </SectionContainer>
      </main>
      <SiteFooter />
    </>
  );
}
