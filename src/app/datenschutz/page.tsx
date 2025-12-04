import {
  SectionContainer,
  SectionDescription,
  SectionHeading,
  SectionTitle,
} from '@saubio/ui';
import { SiteFooter } from '../../components/layout/SiteFooter';
import { SiteHeader } from '../../components/layout/SiteHeader';

const sections = [
  {
    title: '1. Verantwortlicher',
    content: [
      'Saubio GmbH, Unter den Linden 10, 10117 Berlin',
      'E-Mail: privacy@saubio.de',
      'Datenschutzbeauftragte: Lea Hoffmann',
    ],
  },
  {
    title: '2. Erhebung und Verarbeitung personenbezogener Daten',
    content: [
      'Wir verarbeiten personenbezogene Daten, die Sie uns über Kontaktformulare, Buchungen oder das Provider-Portal übermitteln.',
      'Zu den verarbeiteten Kategorien zählen Kontaktdaten, Vertragsdaten, Zahlungsinformationen sowie Nutzungsdaten unserer Plattform.',
    ],
  },
  {
    title: '3. Zwecke und Rechtsgrundlage',
    content: [
      'Die Verarbeitung erfolgt gemäß Art. 6 Abs. 1 lit. b DSGVO zur Vertragserfüllung, lit. a für freiwillige Einwilligungen und lit. f zur Wahrung unserer berechtigten Interessen (z. B. Security, Produktverbesserung).',
    ],
  },
  {
    title: '4. Weitergabe und Dienstleister',
    content: [
      'Wir geben Daten nur an sorgfältig ausgewählte Auftragsverarbeiter weiter (Hosting, Analytik, Zahlungsdienstleister), die vertraglich zur DSGVO-Konformität verpflichtet sind.',
      'Eine Übermittlung in Drittländer erfolgt nur bei Vorliegen geeigneter Garantien (Standardvertragsklauseln).',
    ],
  },
  {
    title: '5. Speicherdauer',
    content: [
      'Personenbezogene Daten werden gelöscht, sobald der Zweck entfällt oder gesetzliche Aufbewahrungspflichten erfüllt sind.',
      'Buchungs- und Rechnungsdaten bewahren wir i. d. R. zehn Jahre gemäß HGB/Abgabenordnung auf.',
    ],
  },
  {
    title: '6. Betroffenenrechte',
    content: [
      'Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit sowie Widerspruch.',
      'Sie können sich zudem beim zuständigen Landesdatenschutzbeauftragten beschweren.',
    ],
  },
  {
    title: '7. Kontakt zum Datenschutzteam',
    content: [
      'E-Mail: privacy@saubio.de',
      'Postanschrift: Saubio GmbH – Datenschutz · Unter den Linden 10 · 10117 Berlin',
    ],
  },
];

export default function DatenschutzPage() {
  return (
    <>
      <SiteHeader />
      <main className="space-y-12 py-16">
        <SectionContainer as="section" padding="spacious" className="rounded-5xl bg-white shadow-soft-lg">
          <SectionHeading>Saubio</SectionHeading>
          <SectionTitle size="large">Datenschutzerklärung</SectionTitle>
          <SectionDescription className="max-w-2xl">
            Informationen gemäß Art. 13 und 14 DSGVO zur Verarbeitung personenbezogener Daten bei
            Nutzung der Saubio Plattform für Kunden, Unternehmen und Dienstleister.
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
