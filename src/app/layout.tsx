import type { Metadata } from 'next';
import { Manrope } from 'next/font/google';
import './global.css';
import { LanguageProvider } from '../providers/LanguageProvider';
import { QueryProvider } from '../providers/QueryProvider';
import { BookingFlowWatcher } from '../components/bookings/BookingFlowWatcher';
import { CookieBanner } from '../components/system/CookieBanner';

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Saubio | Rein. Schnell. Grün.',
  description:
    'Plateforme allemande de services de nettoyage durable pour particuliers, entreprises et prestataires certifiés.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de" className={manrope.variable}>
      <body suppressHydrationWarning className="bg-saubio-mist text-saubio-slate">
        <LanguageProvider>
          <QueryProvider>
            <BookingFlowWatcher />
            {children}
            <CookieBanner />
          </QueryProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
