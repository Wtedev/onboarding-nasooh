import { motion, useReducedMotion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import nasouhLogo from '../assets/nasouh-logo.png'
import { PanoramaBackground } from '../components/onboarding/PanoramaBackground'

interface PlaceholderScreenProps {
  onBackToStart: () => void
}

const softEase = [0.22, 1, 0.36, 1] as const

/**
 * Stands in for every real app destination in this prototype. Same
 * atmosphere as the onboarding flow, so landing here never feels like a
 * dead end — just a clearly-marked placeholder with a way back.
 */
export function PlaceholderScreen({ onBackToStart }: PlaceholderScreenProps) {
  const { t } = useTranslation()
  const reduced = useReducedMotion() ?? false

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden px-8 text-center">
      <PanoramaBackground stage={0} slidesCount={1} duration={0} />

      <motion.img
        src={nasouhLogo}
        alt={t('brand')}
        className="z-10 h-11 w-auto select-none"
        draggable={false}
        initial={reduced ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease: softEase }}
      />

      <motion.p
        className="z-10 mt-4 max-w-[270px] text-[14px] font-medium leading-relaxed text-[#43368e]"
        initial={reduced ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: softEase, delay: reduced ? 0 : 0.1 }}
      >
        {t('placeholder.text')}
      </motion.p>

      <motion.button
        type="button"
        onClick={onBackToStart}
        className="z-10 mt-7 text-[13px] font-medium text-[#8f83ff]"
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: reduced ? 0 : 0.25 }}
      >
        {t('placeholder.back')}
      </motion.button>
    </div>
  )
}
