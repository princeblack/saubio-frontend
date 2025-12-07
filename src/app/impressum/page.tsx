import type { Metadata } from 'next';
import {
  SectionContainer,
  SectionDescription,
  SectionHeading,
  SectionTitle,
} from '@saubio/ui';
import { SiteFooter } from '../../components/layout/SiteFooter';
import { SiteHeader } from '../../components/layout/SiteHeader';

export const metadata: Metadata = {
  title: 'Saubio – Impressum',
  description: 'Rechtliche Angaben zur Saubio GmbH, verantwortlich für die Plattform saubio.de.',
};

const sections = [
  {
    title: '1. Angaben gemäß § 5 TMG',
    content: [
      'Saubio GmbH',
      'Unter den Linden 10',
      '10117 Berlin, Deutschland',
      'Geschäftsführung: Sofia Weber, Malik Aden',
      'Handelsregister: HRB 123456, Amtsgericht Berlin-Charlottenburg',
      'USt-IdNr.: DE321654987',
    ],
  },
  {
    title: '2. Kontakt',
    content: [
      'Telefon: +49 (0)30 1234 5678',
      'E-Mail: support@saubio.de',
      'Supportzeiten: Montag – Freitag, 9–18 Uhr (MEZ)',
    ],
  },
  {
    title: '3. Verantwortlich für den Inhalt',
    content: [
      'Verantwortlich i.S.d. § 55 Abs. 2 RStV:',
      'Saubio GmbH · Unter den Linden 10 · 10117 Berlin',
    ],
  },
  {
    title: '4. Haftungsausschluss',
    content: [
      'Trotz sorgfältiger Prüfung übernehmen wir keine Haftung für die Inhalte externer Links. Für den Inhalt verlinkter Seiten sind ausschließlich deren Betreiber verantwortlich.',
      'Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen.',
    ],
  },
  {
    title: '5. Streitschlichtung',
    content: [
      'Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: https://ec.europa.eu/consumers/odr/. Unsere E-Mail-Adresse finden Sie oben im Impressum.',
    ],
  },
];

export default function ImpressumPage() {
  return (
    <>
      <SiteHeader />
      <main className="space-y-12 py-16">
        <SectionContainer as="section" padding="spacious" className="rounded-5xl bg-white shadow-soft-lg">
          <SectionHeading>Saubio</SectionHeading>
          <SectionTitle size="large">Impressum</SectionTitle>
          <SectionDescription className="max-w-2xl">
            Rechtliche Angaben zur Saubio GmbH. Bitte kontaktieren Sie uns bei Fragen zu den
            Unternehmensdaten, Verantwortlichkeiten oder Pflichtangaben nach deutschem Recht.
          </SectionDescription>
          <div className="mt-10 space-y-8 text-sm leading-relaxed text-saubio-slate/90">
            {sections.map((section) => (
              <section key={section.title} aria-labelledby={section.title}>
                <h2 className="text-base font-semibold text-saubio-forest">{section.title}</h2>
                <ul className="mt-3 space-y-1">
                  {section.content.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </SectionContainer>
      </main>
      <SiteFooter />
    </>
  );
}
