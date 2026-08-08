import { motion, useReducedMotion } from 'motion/react'
import { useTranslation } from 'react-i18next'

interface FinaleGatherProps {
  isActive: boolean
  reducedMotion?: boolean
  enterKey?: number
  onPrimary?: () => void
  onSecondary?: () => void
}

const EDGE_MOTIFS = [
  { x: -42, y: -28, w: 56, h: 36, r: 14, color: 'linear-gradient(145deg,#A8D8F0,#A98BFA)' },
  { x: 48, y: -34, w: 14, h: 14, r: 999, color: 'radial-gradient(circle,#63D9F4,#7655F6)' },
  { x: -50, y: 36, w: 48, h: 8, r: 8, color: 'linear-gradient(90deg,#63D9F4,#7655F6)' },
  { x: 46, y: 40, w: 40, h: 28, r: 12, color: 'linear-gradient(145deg,#F6B3DD,#A98BFA)' },
  { x: 0, y: -48, w: 18, h: 18, r: 6, color: 'linear-gradient(145deg,#71C8F6,#7655F6)' },
]

export function FinaleGather({
  isActive,
  reducedMotion: reducedProp,
  enterKey = 0,
  onPrimary,
  onSecondary,
}: FinaleGatherProps) {
  const { t } = useTranslation()
  const prefersReduced = useReducedMotion()
  const reduced = reducedProp ?? prefersReduced ?? false

  if (!isActive) return null

  return (
    <div className="relative mx-auto flex h-full w-full max-w-[340px] flex-col items-center justify-center">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        {EDGE_MOTIFS.map((m, i) => (
          <motion.div
            key={`${i}-${enterKey}`}
            className="absolute left-1/2 top-1/2"
            style={{
              width: m.w,
              height: m.h,
              borderRadius: m.r,
              background: m.color,
              marginLeft: -m.w / 2,
              marginTop: -m.h / 2,
              opacity: 0.45,
            }}
            initial={reduced ? false : { x: 0, y: 0, scale: 0.6, opacity: 0.7 }}
            animate={{
              x: m.x * 2.2,
              y: m.y * 1.6,
              scale: 0.85,
              opacity: 0.35,
            }}
            transition={
              reduced
                ? { duration: 0.2 }
                : { type: 'spring', stiffness: 180, damping: 22, delay: 0.08 * i }
            }
          />
        ))}
      </div>

      <div className="relative z-10 mt-auto flex w-full flex-col items-center gap-2.5 pb-1">
        <motion.button
          type="button"
          onClick={onPrimary}
          aria-label={t('startAria')}
          className="nasouh-cta inline-flex h-[52px] w-[86%] max-w-[300px] items-center justify-center rounded-full text-[14.5px] font-medium text-white"
          initial={reduced ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: reduced ? 0 : 0.45 }}
          whileTap={{ scale: 0.98 }}
        >
          {t('start')}
        </motion.button>
        <motion.button
          type="button"
          onClick={onSecondary}
          aria-label={t('exploreAria')}
          className="inline-flex h-[44px] w-[70%] max-w-[240px] items-center justify-center rounded-full text-[13px] font-medium text-[#9167ff]/80"
          style={{
            background: 'rgba(145,103,255,0.1)',
            border: 'none',
            fontFamily: "'Lama Sans', sans-serif",
            fontWeight: 400,
          }}
          initial={reduced ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: reduced ? 0 : 0.62 }}
          whileTap={{ scale: 0.98 }}
        >
          {t('explore')}
        </motion.button>
      </div>
    </div>
  )
}
