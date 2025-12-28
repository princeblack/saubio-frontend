'use client';

import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import { appConfig, type LocaleCode } from '@saubio/config';
import { initializeI18n } from '../i18n/client';

const STORAGE_KEY = 'saubio-lang';

type LanguageContextValue = {
  language: LocaleCode;
  changeLanguage: (lng: string) => void;
};

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

type Props = {
  children: ReactNode;
};

export function LanguageProvider({ children }: Props) {
  const [i18n] = useState(() => initializeI18n(appConfig.defaultLocale));
  const [language, setLanguage] = useState<LocaleCode>(
    (i18n.language as LocaleCode) || appConfig.defaultLocale
  );

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      return;
    }
    const normalized = appConfig.locales.includes(saved as LocaleCode)
      ? (saved as LocaleCode)
      : appConfig.defaultLocale;
    if (normalized !== i18n.language) {
      i18n.changeLanguage(normalized);
      setLanguage(normalized);
    }
  }, [i18n]);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
    }
  }, [language]);

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      changeLanguage: (lng: string) => {
        if (lng === language) return;
        const normalized = appConfig.locales.includes(lng as LocaleCode)
          ? (lng as LocaleCode)
          : appConfig.defaultLocale;
        i18n.changeLanguage(normalized);
        setLanguage(normalized);
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(STORAGE_KEY, normalized);
        }
      },
    }),
    [i18n, language]
  );

  return (
    <LanguageContext.Provider value={value}>
      <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
