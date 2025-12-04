import {
  SectionContainer,
  SectionDescription,
  SectionHeading,
  SectionTitle,
} from '@saubio/ui';
import { SiteFooter } from '../../components/layout/SiteFooter';
import { SiteHeader } from '../../components/layout/SiteHeader';

const pillars = [
  {
    title: 'Durabilité radicale',
    body: 'Produits certifiés, itinéraires optimisés et compensation systématique des émissions pour chaque mission.',
  },
  {
    title: 'Qualité vérifiée',
    body: 'Prestataires audités, reporting transparent et indicateurs en temps réel accessibles aux clients.',
  },
  {
    title: 'Technologie humaine',
    body: 'Outils numériques simples pour orchestrer les équipes mais avec un support local joignable 7j/7.',
  },
];

export default function AproposPage() {
  return (
    <>
      <SiteHeader />
      <main className="space-y-12 py-16">
        <SectionContainer as="section" padding="spacious" className="rounded-5xl bg-white shadow-soft-lg">
          <SectionHeading>Saubio</SectionHeading>
          <SectionTitle size="large">À propos de nous</SectionTitle>
          <SectionDescription className="max-w-2xl">
            Saubio est né à Berlin avec une mission simple : rendre le nettoyage professionnel
            durable accessible aux particuliers comme aux entreprises, sans compromis sur la
            qualité ni sur la simplicité.
          </SectionDescription>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {pillars.map((pillar) => (
              <article key={pillar.title} className="rounded-4xl border border-saubio-moss/15 bg-saubio-cream/60 p-6 text-sm text-saubio-slate">
                <h3 className="text-base font-semibold text-saubio-forest">{pillar.title}</h3>
                <p className="mt-3 leading-relaxed">{pillar.body}</p>
              </article>
            ))}
          </div>
        </SectionContainer>
      </main>
      <SiteFooter />
    </>
  );
}
