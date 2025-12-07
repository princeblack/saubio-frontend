import type { ReactNode } from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Saubio – Tarifs et estimations',
  description: 'Comprenez comment les prestataires Saubio fixent leurs tarifs horaires et obtenez une fourchette indicative.',
};

export default function TarifsLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
