import type { ReactNode } from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Saubio – Villes disponibles',
  description: 'Consultez la liste complète des villes allemandes desservies par Saubio et ses partenaires.',
};

export default function VillesLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
