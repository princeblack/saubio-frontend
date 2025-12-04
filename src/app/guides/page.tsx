'use client';

import { SectionContainer, SectionDescription, SectionHeading, SectionTitle } from '@saubio/ui';
import Link from 'next/link';
import { SiteFooter } from '../../components/layout/SiteFooter';
import { SiteHeader } from '../../components/layout/SiteHeader';
import { useTranslation } from 'react-i18next';

export default function GuidesPage() {
  const { t } = useTranslation();
  const articles = t('pages.guides.articles', { returnObjects: true }) as Array<{
    title: string;
    excerpt: string;
    href: string;
  }>;

  return (
    <>
      <SiteHeader />
      <main className="space-y-12 py-16">
        <SectionContainer as="section" padding="spacious" className="rounded-5xl bg-white shadow-soft-lg">
          <SectionHeading>{t('pages.guides.heading')}</SectionHeading>
          <SectionTitle size="large">{t('pages.guides.title')}</SectionTitle>
          <SectionDescription className="max-w-2xl">
            {t('pages.guides.description')}
          </SectionDescription>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {articles.map((article) => (
              <article
                key={article.title}
                className="flex h-full flex-col rounded-4xl border border-saubio-moss/15 bg-saubio-cream/40 p-6 text-sm text-saubio-slate"
              >
                <h3 className="text-base font-semibold text-saubio-forest">{article.title}</h3>
                <p className="mt-3 flex-1">{article.excerpt}</p>
                <Link href={article.href} className="mt-4 text-sm font-semibold text-saubio-forest">
                  {t('pages.guides.readMore')}
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
