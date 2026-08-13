import { motion } from 'motion/react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface NavigationControlsProps {
  isLast: boolean
  onNext: () => void
  onSecondary?: () => void
  isRtl: boolean
  /** Hide footer CTAs when finale scene renders its own */
  hideOnFinale?: boolean
}

export function NavigationControls({
  isLast,
  onNext,
  onSecondary,
  isRtl,
  hideOnFinale = false,
}: NavigationControlsProps) {
  const { t } = useTranslation()
  const Arrow = isRtl ? ArrowLeft : ArrowRight

  if (isLast && hideOnFinale) return null

  if (isLast) {
    return (
      <div className="flex w-full flex-col items-center gap-2">
        <motion.button
          type="button"
          onClick={onNext}
          aria-label={t('startAria')}
          className="nasouh-cta inline-flex h-[56px] w-[78%] max-w-[300px] items-center justify-center rounded-full text-[14.5px] font-medium text-white short:h-[50px]"
          whileTap={{ scale: 0.98 }}
        >
          {t('start')}
        </motion.button>
        {onSecondary && (
          <motion.button
            type="button"
            onClick={onSecondary}
            aria-label={t('exploreAria')}
            className="inline-flex h-[42px] w-[64%] max-w-[220px] items-center justify-center rounded-full text-[13px] font-medium text-[#8f83ff]/80"
            style={{
              background: 'rgba(143,131,255,0.1)',
              border: 'none',
            }}
            whileTap={{ scale: 0.98 }}
          >
            {t('explore')}
          </motion.button>
        )}
      </div>
    )
  }

  return (
    <div className="flex w-full items-center justify-center">
      <motion.button
        type="button"
        onClick={onNext}
        aria-label={t('nextAria')}
        className="nasouh-cta inline-flex h-[56px] w-[78%] max-w-[300px] items-center justify-center gap-2 rounded-full text-[14.5px] font-medium text-white transition-[filter] hover:brightness-[1.03] active:brightness-[0.97] short:h-[50px]"
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      >
        <span className="relative z-[1]">{t('next')}</span>
        <Arrow strokeWidth={1.75} size={15} aria-hidden="true" className="relative z-[1]" />
      </motion.button>
    </div>
  )
}
