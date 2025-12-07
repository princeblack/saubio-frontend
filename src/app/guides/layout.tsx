import type { ReactNode } from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Saubio – Guides & actus',
  description: 'Conseils et ressources Saubio pour optimiser vos missions de nettoyage.',
};

export default function GuidesLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
