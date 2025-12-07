import type { ReactNode } from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Saubio – Über uns',
  description: 'Erfahren Sie mehr über die Mission von Saubio und unsere nachhaltigen Reinigungsservices in Deutschland.',
};

export default function AboutLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
