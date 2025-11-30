'use client';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { defaultLocale, localeResources } from '@saubio/config';

const resources = localeResources as unknown as Record<string, { translation: Record<string, unknown> }>;

export const supportedLanguages = Object.keys(resources);

export function initializeI18n() {
  if (!i18n.isInitialized) {
    i18n.use(initReactI18next).init({
      resources,
      lng: defaultLocale,
      fallbackLng: defaultLocale,
      interpolation: {
        escapeValue: false,
      },
      returnObjects: true,
    });
  }

  return i18n;
}

export default i18n;
