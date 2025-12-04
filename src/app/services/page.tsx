import { SectionContainer, SectionDescription, SectionHeading, SectionTitle } from '@saubio/ui';
import { SiteFooter } from '../../components/layout/SiteFooter';
import { SiteHeader } from '../../components/layout/SiteHeader';

const offerings = [
  {
    title: 'Résidentiel premium',
    details: ['Entretien hebdomadaire ou ponctuel', 'Gestion des clés sécurisée', 'Checklist personnalisée'],
  },
  {
    title: 'Espaces professionnels',
    details: ['Bureaux, retail et coworkings', 'Service de jour ou de nuit', 'Rapports et audits qualité'],
  },
  {
    title: 'Services spécialisés',
    details: ['Grand ménage & remise en état', 'Nettoyage écologique de tissus', 'Prestations événementielles'],
  },
];

export default function ServicesPage() {
  return (
    <>
      <SiteHeader />
      <main className="space-y-12 py-16">
        <SectionContainer as="section" padding="spacious" className="rounded-5xl bg-white shadow-soft-lg">
          <SectionHeading>Nos offres</SectionHeading>
          <SectionTitle size="large">Services Saubio</SectionTitle>
          <SectionDescription className="max-w-2xl">
            Composez un programme sur mesure en combinant nos formules résidentielles, professionnelles
            et spécialisées. Les prestations sont couvertes par nos assurances et suivies par un Customer
            Success Manager.
          </SectionDescription>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {offerings.map((offer) => (
              <article key={offer.title} className="rounded-4xl border border-saubio-moss/15 bg-saubio-cream/50 p-6 text-sm text-saubio-slate">
                <h3 className="text-base font-semibold text-saubio-forest">{offer.title}</h3>
                <ul className="mt-4 space-y-2">
                  {offer.details.map((detail) => (
                    <li key={detail}>{detail}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </SectionContainer>
      </main>
      <SiteFooter />
    </>
  );
}
