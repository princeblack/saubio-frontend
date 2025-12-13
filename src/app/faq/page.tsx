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
import { faqSections } from '../../content/legal';

export const metadata: Metadata = {
  title: 'Saubio – FAQ & Hilfe',
  description: 'Antworten auf die häufigsten Fragen rund um Buchung, Preise, Versicherung und Support.',
};

export default function FaqPage() {
  return (
    <>
      <SiteHeader />
      <main className="space-y-12 py-16">
        <SectionContainer as="section" padding="spacious" className="rounded-5xl bg-white shadow-soft-lg">
          <SectionHeading>Saubio</SectionHeading>
          <SectionTitle size="large">Häufige Fragen</SectionTitle>
          <SectionDescription className="max-w-3xl">
            Hier finden Sie kompakte Antworten zur Buchung, Bezahlung, Versicherung und zum Support von saubio.de.
          </SectionDescription>
          <div className="mt-10 space-y-8">
            {faqSections.map((section, sectionIndex) => (
              <div key={section.title} className="rounded-3xl border border-saubio-slate/10 bg-saubio-sand/30 p-6">
                <h3 className="text-xl font-semibold text-saubio-forest">{section.title}</h3>
                <div className="mt-4 space-y-4">
                  {section.items.map((item, itemIndex) => (
                    <details
                      key={`${sectionIndex}-${itemIndex}`}
                      className="group rounded-3xl border border-saubio-slate/15 bg-white/80"
                    >
                      <summary className="flex cursor-pointer items-center justify-between gap-4 px-6 py-4 text-left text-base font-semibold text-saubio-forest">
                        <span>{item.question}</span>
                        <span className="text-2xl leading-none text-saubio-forest transition-transform duration-300 group-open:rotate-45">
                          +
                        </span>
                      </summary>
                      <div className="px-6 pb-6">
                        <SimpleMarkdown content={item.answer} className="!mt-4 space-y-3 text-sm text-saubio-slate" />
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </SectionContainer>
      </main>
      <SiteFooter />
    </>
  );
}
