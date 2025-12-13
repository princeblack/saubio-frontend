import type { Metadata } from 'next';
import {
  SectionContainer,
  SectionDescription,
  SectionHeading,
  SectionTitle,
} from '@saubio/ui';
import { SiteFooter } from '../../components/layout/SiteFooter';
import { SiteHeader } from '../../components/layout/SiteHeader';
import { SimpleMarkdown } from '../../components/legal/SimpleMarkdown';
import { haftpflichtMarkdown } from '../../content/legal';

export const metadata: Metadata = {
  title: 'Saubio – Haftpflichtversicherung',
  description: 'Informationen zum Versicherungsschutz für vermittelte Reinigungen in Deutschland.',
};

export default function HaftpflichtversicherungPage() {
  return (
    <>
      <SiteHeader />
      <main className="space-y-12 py-16">
        <SectionContainer as="section" padding="spacious" className="rounded-5xl bg-white shadow-soft-lg">
          <SectionHeading>Saubio</SectionHeading>
          <SectionTitle size="large">Haftpflichtversicherung</SectionTitle>
          <SectionDescription className="max-w-3xl">
            So sind Kund:innen und Dienstleister:innen bei Schäden während eines bestätigten Saubio-Auftrags abgesichert.
          </SectionDescription>
          <SimpleMarkdown content={haftpflichtMarkdown} className="mt-8" />
        </SectionContainer>
      </main>
      <SiteFooter />
    </>
  );
}
