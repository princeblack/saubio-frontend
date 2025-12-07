import type { ReactNode } from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Saubio – Services de nettoyage',
  description: 'Aperçu des formules Saubio : résidentiel, professionnel et services spécialisés en Allemagne.',
};

export default function ServicesLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
