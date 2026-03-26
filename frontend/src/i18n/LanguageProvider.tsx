import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import {
  LANGUAGE_OPTIONS,
  RTL_LANGUAGES,
  type SupportedLanguage,
  translations,
} from '@/i18n/translations';

interface I18nContextValue {
  language: SupportedLanguage;
  setLanguage: (language: SupportedLanguage) => void;
  t: (key: string, fallback?: string) => string;
  languageOptions: Array<{ code: SupportedLanguage; label: string }>;
  isRtl: boolean;
}

const I18N_STORAGE_KEY = 'app-language';

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

function getInitialLanguage(): SupportedLanguage {
  const stored = localStorage.getItem(I18N_STORAGE_KEY);
  if (stored === 'en' || stored === 'nl' || stored === 'ur' || stored === 'ar') {
    return stored;
  }

  return 'en';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<SupportedLanguage>(getInitialLanguage);

  const isRtl = RTL_LANGUAGES.includes(language);

  useEffect(() => {
    localStorage.setItem(I18N_STORAGE_KEY, language);
    document.documentElement.lang = language;
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.body.dir = isRtl ? 'rtl' : 'ltr';
    document.body.dataset.direction = isRtl ? 'rtl' : 'ltr';
  }, [isRtl, language]);

  const value = useMemo<I18nContextValue>(
    () => ({
      language,
      setLanguage,
      languageOptions: LANGUAGE_OPTIONS,
      isRtl,
      t: (key: string, fallback?: string) =>
        translations[language][key] ?? translations.en[key] ?? fallback ?? key,
    }),
    [isRtl, language]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within LanguageProvider');
  }

  return context;
}
