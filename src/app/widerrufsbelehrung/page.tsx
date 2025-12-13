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
import { widerrufsbelehrungMarkdown } from '../../content/legal';

export const metadata: Metadata = {
  title: 'Saubio – Widerrufsbelehrung',
  description: 'Informationen zu Widerrufsrechten für Kund:innen in Deutschland.',
};

export default function WiderrufsbelehrungPage() {
  return (
    <>
      <SiteHeader />
      <main className="space-y-12 py-16">
        <SectionContainer as="section" padding="spacious" className="rounded-5xl bg-white shadow-soft-lg">
          <SectionHeading>Saubio</SectionHeading>
          <SectionTitle size="large">Widerrufsbelehrung</SectionTitle>
          <SectionDescription className="max-w-2xl">
            Hier finden Sie alle Informationen zu Ihrem gesetzlichen Widerrufsrecht bei vermittelten Saubio-Dienstleistungen.
          </SectionDescription>
          <SimpleMarkdown content={widerrufsbelehrungMarkdown} className="mt-8" />
        </SectionContainer>
      </main>
      <SiteFooter />
    </>
  );
}
