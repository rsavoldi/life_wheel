'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import en from '@/locales/en.json';
import pt from '@/locales/pt.json';

const translations = { en, pt };

type Locale = keyof typeof translations;

type I18nContextType = {
  t: TFunction;
  setLanguage: (language: Locale) => void;
  currentLanguage: Locale;
};

export type TFunction = (key: string, options?: Record<string, string>) => string;

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Locale>('en');

  useEffect(() => {
    const browserLang = navigator.language.split('-')[0] as Locale;
    if (translations[browserLang]) {
      setLanguage(browserLang);
    }
  }, []);

  const t = useCallback((key: string, options?: Record<string, string>) => {
    const langToUse = language;
    const keys = key.split('.');
    let result: any = translations[langToUse];
    for (const k of keys) {
      result = result?.[k];
      if (result === undefined) {
        // Fallback to English if key not found in current language
        let fallbackResult: any = translations['en'];
        for (const fk of keys) {
          fallbackResult = fallbackResult?.[fk];
          if (fallbackResult === undefined) return key;
        }
        return fallbackResult || key;
      }
    }

    if (typeof result === 'string' && options) {
      return Object.entries(options).reduce((acc, [key, value]) => {
        return acc.replace(`{{${key}}}`, value);
      }, result);
    }

    return result || key;
  }, [language]);
  
  const handleSetLanguage = (lang: Locale) => {
    setLanguage(lang);
  };

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    // Render a placeholder or nothing on the server/first render
    // to avoid hydration mismatch.
    const tServer = (key: string): string => {
       const keys = key.split('.');
       let result: any = translations['en'];
       for (const k of keys) {
         result = result?.[k];
         if (result === undefined) return key;
       }
       return result;
    }
    const serverContext = {
      t: tServer,
      setLanguage: () => {},
      currentLanguage: 'en' as Locale,
    };
    return (
      <I18nContext.Provider value={serverContext}>
        {children}
      </I18nContext.Provider>
    );
  }

  return (
    <I18nContext.Provider value={{ t, setLanguage: handleSetLanguage, currentLanguage: language }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};
