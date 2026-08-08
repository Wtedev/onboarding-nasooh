import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import type { Language } from '../../types/onboarding'

interface ContainmentMessageProps {
  isActive: boolean
  language: Language
  reducedMotion?: boolean
  enterKey?: number
  morphToPoint?: boolean
  onPhaseChange?: (phase: 'pulse' | 'reply' | 'done') => void
}

export function ContainmentMessage({
  isActive,
  language,
  reducedMotion: reducedProp,
  enterKey = 0,
  morphToPoint = false,
  onPhaseChange,
}: ContainmentMessageProps) {
  const { t } = useTranslation()
  const prefersReduced = useReducedMotion()
  const reduced = reducedProp ?? prefersReduced ?? false
  const isRtl = language === 'ar'
  const isCompact = typeof window !== 'undefined' && window.innerWidth < 360
  const reply = t(isCompact ? 'containmentDemo.replyShort' : 'containmentDemo.reply')
  const [show, setShow] = useState(false)
  const timers = useRef<number[]>([])

  useEffect(() => {
    timers.current.forEach(clearTimeout)
    timers.current = []
    if (!isActive) {
      setShow(false)
      return
    }
    onPhaseChange?.('pulse')
    if (reduced) {
      setShow(true)
      onPhaseChange?.('reply')
      return
    }
    setShow(false)
    const id = window.setTimeout(() => {
      setShow(true)
      onPhaseChange?.('reply')
      timers.current.push(
        window.setTimeout(() => onPhaseChange?.('done'), language === 'ar' ? 2000 : 2200),
      )
    }, 520)
    timers.current.push(id)
    return () => {
      timers.current.forEach(clearTimeout)
      timers.current = []
    }
  }, [isActive, enterKey, reduced, language, onPhaseChange])

  if (!isActive) return null

  return (
    <div className="relative mx-auto flex w-full max-w-[340px] flex-col items-center gap-3 px-1">
      <AnimatePresence>
        {show && (
          <motion.div
            className="me-auto w-full max-w-[92%]"
            style={{ transformOrigin: isRtl ? 'top right' : 'top left' }}
            initial={
              reduced
                ? false
                : { opacity: 0, scaleX: 0.08, scaleY: 0.5, filter: 'blur(6px)', y: -8 }
            }
            animate={
              morphToPoint
                ? { opacity: 0.9, scaleX: 0.12, scaleY: 0.12, borderRadius: 999, y: 20 }
                : {
                    opacity: 1,
                    scaleX: [0.08, 1.04, 1],
                    scaleY: [0.5, 1, 1],
                    filter: 'blur(0px)',
                    y: 0,
                  }
            }
            exit={{ opacity: 0, scale: 0.9 }}
            transition={
              morphToPoint
                ? { type: 'spring', stiffness: 240, damping: 22 }
                : reduced
                  ? { duration: 0.2 }
                  : { duration: 0.55, times: [0, 0.72, 1], ease: [0.16, 1, 0.3, 1] }
            }
            dir={isRtl ? 'rtl' : 'ltr'}
          >
            <div
              className="rounded-2xl px-3.5 py-2.5"
              style={{
                background:
                  'linear-gradient(145deg, rgba(255,255,255,0.86), rgba(99,217,244,0.2) 55%, rgba(169,139,250,0.18))',
                boxShadow:
                  '0 14px 32px -14px rgba(99,217,244,0.42), inset 0 1px 0 rgba(255,255,255,0.65)',
                border: '1px solid rgba(255,255,255,0.55)',
              }}
            >
              {!morphToPoint && (
                <>
                  <div className="mb-1 flex items-center gap-1.5">
                    <span
                      className="inline-block h-1.5 w-1.5 rounded-full"
                      style={{
                        background: 'radial-gradient(circle, #63D9F4, #7655F6)',
                        boxShadow: '0 0 8px rgba(99,217,244,0.7)',
                      }}
                    />
                    <span className="text-[10px] font-medium text-nasouh-ink/45">{t('brand')}</span>
                  </div>
                  <motion.p
                    className="text-[13px] leading-relaxed text-nasouh-ink"
                    initial={reduced ? false : { opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: reduced ? 0 : 0.28, duration: 0.25 }}
                  >
                    {reply}
                  </motion.p>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
