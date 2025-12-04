import {
  SectionContainer,
  SectionDescription,
  SectionHeading,
  SectionTitle,
} from '@saubio/ui';
import { SiteFooter } from '../../components/layout/SiteFooter';
import { SiteHeader } from '../../components/layout/SiteHeader';

const plans = [
  {
    name: 'Essentiel',
    price: 'à partir de 32€ / h',
    perks: ['Intervenant certifié', 'Produits inclus', 'Support e-mail'],
  },
  {
    name: 'Confort',
    price: 'à partir de 38€ / h',
    perks: ['Equipe dédiée', 'Gestion du linge', 'Support prioritaire'],
  },
  {
    name: 'Entreprise',
    price: 'Sur devis',
    perks: ['Compte-rendu personnalisé', 'Horaires étendus 24/7', 'Référent Saubio dédié'],
  },
];

export default function TarifsPage() {
  return (
    <>
      <SiteHeader />
      <main className="space-y-12 py-16">
        <SectionContainer as="section" padding="spacious" className="rounded-5xl bg-white shadow-soft-lg">
          <SectionHeading>Transparence</SectionHeading>
          <SectionTitle size="large">Nos tarifs</SectionTitle>
          <SectionDescription className="max-w-2xl">
            Les prix affichés incluent les charges sociales, les assurances et le suivi qualité.
            Chaque mission fait l’objet d’une estimation en fonction de la surface et des particularités.
          </SectionDescription>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {plans.map((plan) => (
              <article key={plan.name} className="rounded-4xl border border-saubio-moss/20 bg-saubio-cream/40 p-6 text-sm text-saubio-slate">
                <h3 className="text-base font-semibold text-saubio-forest">{plan.name}</h3>
                <p className="mt-4 text-xl font-semibold text-saubio-forest">{plan.price}</p>
                <ul className="mt-4 space-y-2">
                  {plan.perks.map((perk) => (
                    <li key={perk}>{perk}</li>
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
