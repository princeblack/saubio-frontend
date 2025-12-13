'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

const STORAGE_KEY = 'saubio-cookie-consent';

type Consent = {
  preferences: boolean;
  stats: boolean;
  marketing: boolean;
};

const defaultConsent: Consent = {
  preferences: true,
  stats: true,
  marketing: true,
};

export function CookieBanner() {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selection, setSelection] = useState<Consent>(defaultConsent);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Consent;
        setSelection(parsed);
        setVisible(false);
      } else {
        setVisible(true);
      }
    } catch (error) {
      console.error('Failed to read cookie consent', error);
      setVisible(true);
    }
  }, []);

  const persist = (value: Consent) => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  };

  const handleAcceptAll = () => {
    persist(defaultConsent);
    setSelection(defaultConsent);
    setVisible(false);
  };

  const handleEssentialOnly = () => {
    const next: Consent = {
      preferences: false,
      stats: false,
      marketing: false,
    };
    persist(next);
    setSelection(next);
    setVisible(false);
  };

  const handleSave = () => {
    persist(selection);
    setVisible(false);
    setShowSettings(false);
  };

  if (!visible) {
    return null;
  }

  const settingsList = [
    { key: 'preferences' as const, label: t('cookie.labels.preferences') },
    { key: 'stats' as const, label: t('cookie.labels.stats') },
    { key: 'marketing' as const, label: t('cookie.labels.marketing') },
  ];

  return (
    <div className="fixed inset-x-0 bottom-4 z-50 flex justify-center px-4">
      <div className="w-full max-w-4xl rounded-4xl border border-saubio-slate/20 bg-white p-6 shadow-2xl">
        <div className="space-y-3 text-sm text-saubio-slate">
          <h2 className="text-lg font-semibold text-saubio-forest">{t('cookie.title')}</h2>
          <p>{t('cookie.body')}</p>
          <p>{t('cookie.consent')}</p>
          <p>{t('cookie.decline')}</p>
          <p>
            {t('cookie.more')}{' '}
            <Link href="/datenschutz" className="font-semibold text-saubio-forest underline">
              Datenschutz
            </Link>
            .
          </p>
        </div>

        {showSettings && (
          <div className="mt-6 rounded-3xl bg-saubio-sand/50 p-4">
            <p className="text-sm font-semibold text-saubio-forest">{t('cookie.buttons.settings')}</p>
            <div className="mt-3 space-y-2">
              {settingsList.map(({ key, label }) => (
                <label key={key} className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 text-sm text-saubio-slate">
                  <span>{label}</span>
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-saubio-slate/40 text-saubio-forest focus:ring-saubio-forest"
                    checked={selection[key]}
                    onChange={(event) =>
                      setSelection((prev) => ({
                        ...prev,
                        [key]: event.target.checked,
                      }))
                    }
                  />
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          {!showSettings && (
            <>
              <button
                type="button"
                className="flex-1 rounded-full bg-saubio-forest px-4 py-2 text-sm font-semibold text-white hover:bg-saubio-forest/90"
                onClick={handleAcceptAll}
              >
                {t('cookie.buttons.accept')}
              </button>
              <button
                type="button"
                className="flex-1 rounded-full border border-saubio-forest/40 px-4 py-2 text-sm font-semibold text-saubio-forest hover:border-saubio-forest"
                onClick={handleEssentialOnly}
              >
                {t('cookie.buttons.essential')}
              </button>
            </>
          )}
          {showSettings ? (
            <button
              type="button"
              className="flex-1 rounded-full bg-saubio-forest px-4 py-2 text-sm font-semibold text-white hover:bg-saubio-forest/90"
              onClick={handleSave}
            >
              {t('cookie.buttons.save')}
            </button>
          ) : (
            <button
              type="button"
              className="rounded-full border border-saubio-forest/40 px-4 py-2 text-sm font-semibold text-saubio-forest hover:border-saubio-forest"
              onClick={() => setShowSettings(true)}
            >
              {t('cookie.buttons.settings')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
