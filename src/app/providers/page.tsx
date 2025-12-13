import type { Metadata } from 'next';
import { ProvidersLandingContent } from '../../components/providers/ProvidersLandingContent';

export const metadata: Metadata = {
  title: 'Saubio – Werde Dienstleister:in',
  description:
    'Starte als Reinigungspartner:in bei Saubio, arbeite flexibel mit geprüften Kunden und profitiere von fairer Bezahlung, Versicherungsschutz und Öko-Optionen.',
  alternates: {
    canonical: 'https://saubio.de/providers',
  },
};

export default function ProvidersLandingPage() {
  return <ProvidersLandingContent />;
}
