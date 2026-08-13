import { motion, useReducedMotion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { CHOICE_DESTINATIONS, type DestinationId } from '../../data/onboardingContent'
import { NasouhAiLogo } from './NasouhAiLogo'
import nasouhLogo from '../../assets/nasouh-logo.png'

interface StageChoiceProps {
  isActive: boolean
  onChoose: (destination: DestinationId, choiceKey: string) => void
}

const OPTIONS = [
  { key: 'vent', featured: true },
  { key: 'calm', featured: false },
  { key: 'understand', featured: false },
  { key: 'specialist', featured: false },
] as const

const softEase = [0.22, 1, 0.36, 1] as const

const GLASS_CARD = {
  background:
    'linear-gradient(145deg, rgba(255,255,255,0.82), rgba(237,243,253,0.55))',
  border: '1px solid rgba(255,255,255,0.5)',
  boxShadow: '0 10px 24px -14px rgba(143,131,255,0.3)',
} as const

export function StageChoice({ isActive, onChoose }: StageChoiceProps) {
  const { t, i18n } = useTranslation()
  const reduced = useReducedMotion() ?? false
  const isRtl = i18n.language?.startsWith('ar') ?? true
  /**
   * Trailing nav chevron. `›` is a Unicode "mirrored" character, so as long as
   * it sits inside a run whose resolved paragraph direction is RTL, the browser
   * auto-flips its glyph to point left for us — giving the correct outward
   * direction in both languages from a single character. (Don't branch this on
   * `isRtl` — that double-flips it and the arrow ends up backwards.)
   */
  const chevron = '›'

  if (!isActive) return null

  return (
    <div className="relative h-full w-full">
      {/* Logo — same top-13% slot as slide 1's logo */}
      <div className="pointer-events-none absolute inset-x-0 top-[13%] z-10 flex justify-center px-6">
        <motion.img
          src={nasouhLogo}
          alt={t('brand')}
          className="h-9 w-auto select-none"
          draggable={false}
          initial={reduced ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: softEase }}
        />
      </div>

      {/* Title + options — starts right below the logo's slot, same offset slide 1 uses for its text block */}
      <div className="absolute inset-x-0 top-[calc(13%+4.25rem)] bottom-0 z-10 flex flex-col px-5 pb-4">
        <div className="flex min-h-0 flex-1 flex-col justify-center gap-2.5">
          <motion.h2
            className="mb-1 text-center text-[23px] font-bold leading-snug text-[#8f83ff]"
            initial={reduced ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: softEase, delay: reduced ? 0 : 0.06 }}
          >
            {t('stages.choice.title')}
          </motion.h2>

          {OPTIONS.map(({ key, featured }, i) => (
          <motion.button
            key={key}
            type="button"
            onClick={() => onChoose(CHOICE_DESTINATIONS[key], key)}
            className="flex w-full items-center gap-3 rounded-[22px] px-4 py-3.5 text-start active:scale-[0.985]"
            style={GLASS_CARD}
            initial={reduced ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.45,
              ease: softEase,
              delay: reduced ? 0 : 0.1 + 0.07 * i,
            }}
          >
            <span className="min-w-0 flex-1 text-[15px] font-normal leading-snug text-[#43368e]">
              {t(`stages.choice.options.${key}.title`)}
            </span>

            {featured ? (
              <span className="flex shrink-0 flex-col items-center gap-0.5">
                <span className="text-[10px] font-normal text-[#8f83ff]/75">
                  {t(`stages.choice.options.${key}.desc`)}
                </span>
                <NasouhAiLogo
                  variant="color"
                  className="h-4 w-auto max-w-[70px] object-contain"
                />
              </span>
            ) : (
              <span
                dir={isRtl ? 'rtl' : 'ltr'}
                className="flex shrink-0 items-center gap-1 text-[11px] font-normal text-[#8f83ff]/70"
              >
                {t(`stages.choice.options.${key}.desc`)}
                <span aria-hidden className="text-[14px] leading-none">
                  {chevron}
                </span>
              </span>
            )}
          </motion.button>
        ))}

          {/* Same trailing-edge slot as each card's small desc note (px-4 inset,
              end-aligned), same muted purple, so it reads as part of that row */}
          <motion.button
            type="button"
            dir={isRtl ? 'rtl' : 'ltr'}
            onClick={() => onChoose('home', 'explore')}
            className="mt-2 flex w-full items-center justify-end gap-1 px-4 text-[11px] font-normal text-[#8f83ff]/70"
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: reduced ? 0 : 0.42, duration: 0.4 }}
          >
            {t('stages.choice.explore')}
            <span aria-hidden className="text-[12px] leading-none">
              {chevron}
            </span>
          </motion.button>
        </div>
      </div>
    </div>
  )
}
