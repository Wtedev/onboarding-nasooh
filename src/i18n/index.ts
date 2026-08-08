import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import type { Language } from '../types/onboarding'
import ar from './locales/ar.json'
import en from './locales/en.json'

const STORAGE_KEY = 'nasouh-lang'

export function getStoredLanguage(): Language {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'ar' || stored === 'en') return stored
  return 'ar'
}

export function applyDocumentLanguage(lang: Language) {
  document.documentElement.lang = lang
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
}

export function persistLanguage(lang: Language) {
  localStorage.setItem(STORAGE_KEY, lang)
  applyDocumentLanguage(lang)
}

const initialLang = getStoredLanguage()
applyDocumentLanguage(initialLang)

void i18n.use(initReactI18next).init({
  resources: {
    ar: { translation: ar },
    en: { translation: en },
  },
  lng: initialLang,
  fallbackLng: 'ar',
  interpolation: { escapeValue: false },
})

export default i18n
