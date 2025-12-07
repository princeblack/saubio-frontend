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
  title: 'Saubio – Allgemeine Geschäftsbedingungen',
  description:
    'Lesen Sie die Vertragsbedingungen für Kund:innen und Dienstleister:innen, die Saubio zur Buchung von Reinigungsleistungen nutzen.',
};

const sections = [
  {
    title: '1. Geltungsbereich',
    content: [
      'Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für alle Verträge zwischen Saubio GmbH und Kund:innen sowie Dienstleister:innen, die Reinigungsleistungen über die Plattform buchen oder anbieten.',
    ],
  },
  {
    title: '2. Vertragsschluss',
    content: [
      'Die Präsentation der Leistungen auf saubio.de stellt kein rechtlich bindendes Angebot dar. Ein Vertrag kommt erst zustande, wenn wir die Buchung bestätigen.',
    ],
  },
  {
    title: '3. Leistungen und Mitwirkungspflichten',
    content: [
      'Kund:innen haben sicherzustellen, dass der Zugang zu den Räumlichkeiten gewährleistet ist und besondere Hinweise (z. B. empfindliche Materialien) vorab kommuniziert werden.',
      'Dienstleister:innen verpflichten sich zur sorgfältigen Ausführung und Einhaltung der Qualitätsstandards von Saubio.',
    ],
  },
  {
    title: '4. Preise und Zahlung',
    content: [
      'Sämtliche Preise verstehen sich inklusive der gesetzlichen Mehrwertsteuer. Bezahlmethoden werden während des Checkout-Prozesses angezeigt.',
      'Saubio ist berechtigt, Vorauszahlungen oder Kautionen für kurzfristige oder umfangreiche Einsätze zu verlangen.',
    ],
  },
  {
    title: '5. Stornierungen',
    content: [
      'Kostenlose Stornierungen sind bis 24 Stunden vor Leistungsbeginn möglich, sofern in der Buchungsbestätigung nichts anderes vereinbart wurde.',
      'Bei kurzfristigen Absagen können Ausfallgebühren bis zu 100 % des Auftragswertes anfallen.',
    ],
  },
  {
    title: '6. Haftung',
    content: [
      'Saubio haftet nur für Vorsatz und grobe Fahrlässigkeit sowie bei Verletzung wesentlicher Vertragspflichten. In letzterem Fall ist die Haftung auf den vertragstypischen, vorhersehbaren Schaden begrenzt.',
    ],
  },
  {
    title: '7. Schlussbestimmungen',
    content: [
      'Es gilt deutsches Recht unter Ausschluss des UN-Kaufrechts. Gerichtsstand ist Berlin.',
      'Sollte eine Bestimmung unwirksam sein, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt.',
    ],
  },
];

export default function AgbPage() {
  return (
    <>
      <SiteHeader />
      <main className="space-y-12 py-16">
        <SectionContainer as="section" padding="spacious" className="rounded-5xl bg-white shadow-soft-lg">
          <SectionHeading>Saubio</SectionHeading>
          <SectionTitle size="large">Allgemeine Geschäftsbedingungen</SectionTitle>
          <SectionDescription className="max-w-2xl">
            Diese AGB regeln die Nutzung der Saubio Plattform für Privatkund:innen, Unternehmen und
            Partner:innen. Bitte lesen Sie die Bedingungen aufmerksam, bevor Sie Buchungen
            abschließen oder Dienstleistungen anbieten.
          </SectionDescription>
          <div className="mt-10 space-y-8 text-sm leading-relaxed text-saubio-slate/90">
            {sections.map((section) => (
              <section key={section.title}>
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
