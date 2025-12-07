import type { ReactNode } from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Saubio – Guide',
  description: 'Les guides pratiques Saubio pour organiser vos missions de nettoyage durable.',
};

export default function GuideDetailLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
