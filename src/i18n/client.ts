'use client';

import { createInstance, type i18n as I18nInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';
import { defaultLocale, localeResources } from '@saubio/config';

const resources = localeResources as unknown as Record<string, { translation: Record<string, unknown> }>;

export const supportedLanguages = Object.keys(resources);

export function initializeI18n(language = defaultLocale): I18nInstance {
  const instance = createInstance();
  instance.use(initReactI18next).init({
    resources,
    lng: language,
    fallbackLng: defaultLocale,
    interpolation: {
      escapeValue: false,
    },
    returnObjects: true,
    initImmediate: false,
  });

  return instance;
}
