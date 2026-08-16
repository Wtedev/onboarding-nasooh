import { motion, useReducedMotion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import erthImg from '../../assets/Erth2.png'

interface StageSolidarityProps {
  isActive: boolean
  onContinue: () => void
}

export function StageSolidarity({ isActive, onContinue }: StageSolidarityProps) {
  const { t } = useTranslation()
  const reduced = useReducedMotion() ?? false

  if (!isActive) return null

  const softEase = [0.22, 1, 0.36, 1] as const

  return (
    <div className="relative flex h-full w-full flex-col">
      <div
        className="relative flex min-h-0 flex-1 items-center justify-center px-3"
        aria-hidden
      >
        <motion.img
          src={erthImg}
          alt=""
          draggable={false}
          className="h-[220px] w-auto max-w-[92%] select-none object-contain will-change-transform"
          animate={reduced ? undefined : { y: [0, -8, 0] }}
          transition={
            reduced
              ? undefined
              : { duration: 4.6, repeat: Infinity, ease: 'easeInOut' }
          }
        />
      </div>

      <div className="z-10 flex shrink-0 flex-col items-center gap-1 px-6 pb-0 text-center">
        <motion.h2
          className="text-[23px] font-bold leading-snug text-[#8f83ff]"
          initial={reduced ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: softEase, delay: reduced ? 0 : 0.15 }}
        >
          {t('stages.solidarity.title')}
        </motion.h2>
        <motion.p
          className="max-w-[320px] text-[15px] font-medium leading-[1.4] text-[#43368e]"
          initial={reduced ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.95, ease: softEase, delay: reduced ? 0 : 0.32 }}
        >
          {t('stages.solidarity.description')}
        </motion.p>
        <motion.button
          type="button"
          className="nasouh-cta mt-4 h-[52px] w-[62%] max-w-[225px] rounded-full text-[15px] font-medium text-white"
          onClick={onContinue}
          initial={reduced ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, ease: softEase, delay: reduced ? 0 : 0.7 }}
        >
          {t('stages.solidarity.cta')}
        </motion.button>
      </div>
    </div>
  )
}
