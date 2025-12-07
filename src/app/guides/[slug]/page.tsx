'use client';

import type { Metadata } from 'next';
import {
  SectionContainer,
  SectionDescription,
  SectionHeading,
  SectionTitle,
} from '@saubio/ui';
import { SiteFooter } from '../../../components/layout/SiteFooter';
import { SiteHeader } from '../../../components/layout/SiteHeader';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export const metadata: Metadata = {
  title: 'Saubio – Guide',
  description: 'Retrouvez les guides pratiques Saubio pour organiser vos missions de nettoyage.',
};

export default function GuideDetailPage() {
  const router = useRouter();
  const { slug } = useParams<{ slug: string }>();
  const { t } = useTranslation();
  const articles = t('pages.guides.articles', { returnObjects: true }) as Array<{
    slug: string;
    title: string;
    excerpt: string;
    body: string;
  }>;
  const article = articles.find((entry) => entry.slug === slug);

  useEffect(() => {
    if (!article) {
      router.replace('/guides');
    }
  }, [article, router]);

  if (!article) {
    return null;
  }

  return (
    <>
      <SiteHeader />
      <main className="space-y-12 py-16">
        <SectionContainer as="section" padding="spacious" className="rounded-5xl bg-white shadow-soft-lg">
          <SectionHeading>{t('pages.guides.heading')}</SectionHeading>
          <SectionTitle size="large">{article.title}</SectionTitle>
          <SectionDescription className="max-w-2xl">{article.excerpt}</SectionDescription>
          <div className="mt-10 text-sm leading-relaxed text-saubio-slate">
            <p>{article.body}</p>
          </div>
          <Link href="/guides" className="mt-8 inline-flex text-sm font-semibold text-saubio-forest">
            ← {t('pages.guides.backToList')}
          </Link>
        </SectionContainer>
      </main>
      <SiteFooter />
    </>
  );
}
