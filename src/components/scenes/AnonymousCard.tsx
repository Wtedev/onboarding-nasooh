import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { useTranslation } from 'react-i18next'

interface AnonymousCardProps {
  isActive: boolean
  reducedMotion?: boolean
  enterKey?: number
  morphToIcons?: boolean
  onPhaseChange?: (phase: 'profile' | 'scrub' | 'bubble' | 'done') => void
}

export function AnonymousCard({
  isActive,
  reducedMotion: reducedProp,
  enterKey = 0,
  morphToIcons = false,
  onPhaseChange,
}: AnonymousCardProps) {
  const { t, i18n } = useTranslation()
  const prefersReduced = useReducedMotion()
  const reduced = reducedProp ?? prefersReduced ?? false
  const isRtl = i18n.language?.startsWith('ar') ?? true
  const [step, setStep] = useState(0) // 0 profile, 1 scrubbing, 2 bubble

  useEffect(() => {
    if (!isActive) {
      setStep(0)
      return
    }
    onPhaseChange?.('profile')
    if (reduced) {
      setStep(2)
      onPhaseChange?.('bubble')
      return
    }
    setStep(0)
    const t1 = window.setTimeout(() => {
      setStep(1)
      onPhaseChange?.('scrub')
    }, 900)
    const t2 = window.setTimeout(() => {
      setStep(2)
      onPhaseChange?.('bubble')
      onPhaseChange?.('done')
    }, 2400)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [isActive, enterKey, reduced, onPhaseChange])

  if (!isActive && !morphToIcons) return null

  const scrub = step >= 1
  const bubble = step >= 2 || morphToIcons

  return (
    <div className="relative mx-auto flex h-full w-full max-w-[300px] items-center justify-center">
      <motion.div
        className="w-full overflow-hidden"
        style={{
          background:
            'linear-gradient(155deg, rgba(255,255,255,0.78), rgba(237,243,253,0.55))',
          boxShadow:
            '0 16px 36px -16px rgba(115,141,244,0.35), inset 0 1px 0 rgba(255,255,255,0.7)',
          border: '1px solid rgba(255,255,255,0.5)',
        }}
        animate={
          morphToIcons
            ? { scale: 0.3, opacity: 0.4, borderRadius: 999, height: 48 }
            : bubble
              ? {
                  borderRadius: 22,
                  scale: 1,
                  paddingTop: 14,
                  paddingBottom: 14,
                }
              : { borderRadius: 28, scale: 1 }
        }
        transition={{ type: 'spring', stiffness: 240, damping: 22 }}
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {!bubble ? (
          <div className="space-y-3 px-5 py-5">
            <div className="flex items-center gap-3">
              <motion.div
                className="h-12 w-12 rounded-full"
                style={{
                  background: 'linear-gradient(145deg, #71C8F6, #A98BFA)',
                }}
                animate={{
                  filter: scrub ? 'blur(8px)' : 'blur(0px)',
                  opacity: scrub ? 0.45 : 1,
                }}
              />
              <div className="flex-1 space-y-1.5">
                <motion.p
                  className="text-[14px] font-medium text-nasouh-ink"
                  animate={{ opacity: scrub ? 0.35 : 1 }}
                >
                  {scrub ? '————' : t('anonymousDemo.name')}
                </motion.p>
                <motion.p
                  className="text-[12px] text-nasouh-ink/50"
                  animate={{ opacity: scrub ? 0 : 1, height: scrub ? 0 : 'auto' }}
                >
                  {t('anonymousDemo.age')} · {t('anonymousDemo.city')}
                </motion.p>
              </div>
            </div>
            <motion.div
              className="h-2 rounded-full bg-nasouh-ink/10"
              animate={{ opacity: scrub ? 0 : 1, scaleX: scrub ? 0.3 : 1 }}
            />
            <motion.div
              className="h-2 w-2/3 rounded-full bg-nasouh-ink/8"
              animate={{ opacity: scrub ? 0 : 1 }}
            />
            <motion.p
              className="text-[11px] text-nasouh-ink/35"
              animate={{ opacity: scrub ? 0.5 : 1 }}
            >
              {scrub ? '•' : t('anonymousDemo.id')}
            </motion.p>
          </div>
        ) : (
          <motion.p
            className="px-5 text-[14px] leading-relaxed text-nasouh-ink"
            initial={reduced ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: morphToIcons ? 0 : 1, y: 0 }}
          >
            {t('anonymousDemo.message')}
          </motion.p>
        )}
      </motion.div>
    </div>
  )
}
