import { SectionContainer, SectionDescription, SectionHeading, SectionTitle } from '@saubio/ui';
import Link from 'next/link';
import { SiteFooter } from '../../components/layout/SiteFooter';
import { SiteHeader } from '../../components/layout/SiteHeader';

const articles = [
  {
    title: 'Guide du nettoyage écologique',
    excerpt: 'Comment concilier efficacité, sécurité sanitaire et respect de l’environnement.',
    href: '#',
  },
  {
    title: 'Checklist entrée / sortie',
    excerpt: 'Les étapes clés pour rendre un appartement impeccable lors d’un déménagement.',
    href: '#',
  },
  {
    title: 'Planifier une prestation short notice',
    excerpt: 'Processus Saubio pour mobiliser une équipe en moins de 48h.',
    href: '#',
  },
];

export default function GuidesPage() {
  return (
    <>
      <SiteHeader />
      <main className="space-y-12 py-16">
        <SectionContainer as="section" padding="spacious" className="rounded-5xl bg-white shadow-soft-lg">
          <SectionHeading>Guides & actus</SectionHeading>
          <SectionTitle size="large">Conseils Saubio</SectionTitle>
          <SectionDescription className="max-w-2xl">
            Ressources pratiques pour les particuliers, les entreprises et les prestataires.
            Retrouvez nos meilleures pratiques en matière d’organisation, de produits écoresponsables
            et de gestion des interventions.
          </SectionDescription>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {articles.map((article) => (
              <article key={article.title} className="flex h-full flex-col rounded-4xl border border-saubio-moss/15 bg-saubio-cream/40 p-6 text-sm text-saubio-slate">
                <h3 className="text-base font-semibold text-saubio-forest">{article.title}</h3>
                <p className="mt-3 flex-1">{article.excerpt}</p>
                <Link href={article.href} className="mt-4 text-sm font-semibold text-saubio-forest">
                  Lire la suite →
                </Link>
              </article>
            ))}
          </div>
        </SectionContainer>
      </main>
      <SiteFooter />
    </>
  );
}
