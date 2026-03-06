import { createIsomorphicFn } from '@tanstack/react-start';
import { getCookie } from '@tanstack/react-start/server';
import i18n from 'i18next';
import LanguajeDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import commonEN from './locales/en/common.json';
import commonES from './locales/es/common.json';

export const i18nCookieName = 'i18nextLng' as const;
export const defaultNS = 'common' as const;

export const resources = {
  es: {
    common: commonES,
  },
  en: {
    common: commonEN,
  },
} as const;

i18n
  .use(LanguajeDetector)
  .use(initReactI18next)
  .init({
    lng: 'es',
    fallbackLng: 'es',
    defaultNS,
    resources,
    ns: ['common'],
    supportedLngs: ['es', 'en'],
    detection: {
      order: ['cookie'],
      lookupCookie: i18nCookieName,
      caches: ['cookie'],
      cookieMinutes: 60 * 24 * 365,
    },
    interpolation: {
      escapeValue: false,
    },
  });

export const setSSRLanguaje = createIsomorphicFn()
  .server(async () => {
    const languaje = getCookie(i18nCookieName);
    await i18n.changeLanguage(languaje || 'es');
  })
  .client(() => {});

export default i18n;
