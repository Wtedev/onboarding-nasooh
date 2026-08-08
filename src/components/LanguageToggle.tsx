import { useTranslation } from 'react-i18next'
import { persistLanguage } from '../i18n'
import type { Language } from '../types/onboarding'

interface LanguageToggleProps {
  /** Placed outside the phone frame */
  exterior?: boolean
}

export function LanguageToggle({ exterior = false }: LanguageToggleProps) {
  const { t, i18n } = useTranslation()
  const current = (i18n.language?.startsWith('ar') ? 'ar' : 'en') as Language
  const next: Language = current === 'ar' ? 'en' : 'ar'
  const label = current === 'ar' ? 'EN' : 'AR'

  return (
    <button
      type="button"
      onClick={() => {
        void i18n.changeLanguage(next)
        persistLanguage(next)
      }}
      aria-label={t('langToggleAria')}
      className={
        exterior
          ? 'inline-flex h-9 min-w-[40px] items-center justify-center rounded-full px-3 text-[11px] font-medium tracking-[0.06em] text-[#9167ff] transition-opacity hover:opacity-80'
          : 'inline-flex h-7 min-w-[32px] items-center justify-center rounded-full px-2 text-[9px] font-medium tracking-[0.07em] text-nasouh-ink/48'
      }
      style={
        exterior
          ? {
              background: 'rgba(255,255,255,0.55)',
            }
          : undefined
      }
    >
      {label}
    </button>
  )
}
