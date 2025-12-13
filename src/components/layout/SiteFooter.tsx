'use client';

import { appConfig } from '@saubio/config';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

export function SiteFooter() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer id="faq" className="bg-saubio-forest text-saubio-cream" aria-label="Footer">
      <div className="section-container grid gap-10 lg:grid-cols-[2fr_1fr_1fr_1fr]">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Image
              src="/saubio-wordmark-light.svg"
              alt="Saubio"
              width={190}
              height={64}
              className="h-12 w-auto"
            />
            <span className="sr-only">Saubio</span>
          </div>
          <p className="text-sm text-saubio-cream/70">{t('footer.description')}</p>
          <form className="flex w-full max-w-sm items-center gap-3">
            <label htmlFor="newsletter" className="sr-only">
              {t('footer.newsletterPlaceholder')}
            </label>
            <input
              id="newsletter"
              type="email"
              placeholder={t('footer.newsletterPlaceholder')}
              className="h-11 flex-1 rounded-full border-none bg-white/10 px-4 text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-saubio-sun/60"
            />
            <button
              type="submit"
              className="rounded-full bg-saubio-sun px-4 py-2 text-sm font-semibold text-saubio-forest hover:bg-yellow-300"
            >
              {t('footer.newsletterCta')}
            </button>
          </form>
        </div>
        <div className="space-y-3">
          <h3 className="text-sm uppercase tracking-[0.3em] text-saubio-cream/60">
            {t('footer.sections.company')}
          </h3>
          <ul className="space-y-2 text-sm text-saubio-cream/70">
            <li>
              <Link href="/a-propos" className="hover:text-white">
                {t('footer.links.about')}
              </Link>
            </li>
            <li>
              <Link href="/services" className="hover:text-white">
                {t('footer.links.services')}
              </Link>
            </li>
            <li>
              <Link href="/tarifs" className="hover:text-white">
                {t('footer.links.pricing')}
              </Link>
            </li>
            <li>
              <Link href="/guides" className="hover:text-white">
                {t('footer.links.blog')}
              </Link>
            </li>
            <li>
              <Link href="/faq" className="hover:text-white">
                {t('footer.links.faq')}
              </Link>
            </li>
          </ul>
        </div>
        <div className="space-y-3">
          <h3 className="text-sm uppercase tracking-[0.3em] text-saubio-cream/60">
            {t('footer.sections.legal')}
          </h3>
          <ul className="space-y-2 text-sm text-saubio-cream/70">
            <li>
              <Link href="/impressum" className="hover:text-white">
                {t('footer.links.imprint')}
              </Link>
            </li>
            <li>
              <Link href="/community" className="hover:text-white">
                {t('footer.links.community')}
              </Link>
            </li>
            <li>
              <Link href="/datenschutz" className="hover:text-white">
                {t('footer.links.privacy')}
              </Link>
            </li>
            <li>
              <Link href="/agb" className="hover:text-white">
                {t('footer.links.terms')}
              </Link>
            </li>
            <li>
              <Link href="/widerrufsbelehrung" className="hover:text-white">
                {t('footer.links.withdrawal')}
              </Link>
            </li>
            <li>
              <Link href="/haftpflichtversicherung" className="hover:text-white">
                {t('footer.links.liability')}
              </Link>
            </li>
          </ul>
        </div>
        <div className="space-y-3">
          <h3 className="text-sm uppercase tracking-[0.3em] text-saubio-cream/60">
            {t('footer.sections.contact')}
          </h3>
          <p className="text-sm text-saubio-cream/70">
            {t('footer.contact.address')}
            <br />
            {appConfig.supportPhone}
            <br />
            {appConfig.supportEmail}
          </p>
          <div className="flex gap-3">
            <Link
              href="https://www.linkedin.com"
              className="rounded-full border border-white/20 p-2 text-white/70 hover:border-white hover:text-white"
            >
              <span className="sr-only">LinkedIn</span>in
            </Link>
            <Link
              href="https://www.instagram.com"
              className="rounded-full border border-white/20 p-2 text-white/70 hover:border-white hover:text-white"
            >
              <span className="sr-only">Instagram</span>ig
            </Link>
            <Link
              href="https://www.facebook.com"
              className="rounded-full border border-white/20 p-2 text-white/70 hover:border-white hover:text-white"
            >
              <span className="sr-only">Facebook</span>fb
            </Link>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-6 text-center text-xs uppercase tracking-[0.3em] text-white/60">
        {t('footer.copyright', { year })}
      </div>
    </footer>
  );
}
