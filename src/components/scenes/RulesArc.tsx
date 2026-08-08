import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { Ear, Heart, Lock } from 'lucide-react'

interface RulesArcProps {
  isActive: boolean
  reducedMotion?: boolean
  enterKey?: number
  scatter?: boolean
  onRuleFocus?: (index: number) => void
}

const ICONS = [Ear, Heart, Lock] as const
const KEYS = ['listen', 'respect', 'privacy'] as const

export function RulesArc({
  isActive,
  reducedMotion: reducedProp,
  enterKey = 0,
  scatter = false,
  onRuleFocus,
}: RulesArcProps) {
  const { t } = useTranslation()
  const prefersReduced = useReducedMotion()
  const reduced = reducedProp ?? prefersReduced ?? false
  const [revealed, setRevealed] = useState(0)

  useEffect(() => {
    if (!isActive) {
      setRevealed(0)
      return
    }
    if (reduced) {
      setRevealed(3)
      return
    }
    setRevealed(0)
    const timers = [0, 1, 2].map((i) =>
      window.setTimeout(() => {
        setRevealed(i + 1)
        onRuleFocus?.(i)
      }, 280 + i * 900),
    )
    return () => timers.forEach(clearTimeout)
  }, [isActive, enterKey, reduced, onRuleFocus])

  if (!isActive && !scatter) return null

  return (
    <div className="relative mx-auto flex h-full w-full max-w-[340px] flex-col items-center justify-center gap-3">
      <div className="flex w-full flex-col gap-2.5">
        {KEYS.map((key, i) => {
          const Icon = ICONS[i]
          const show = i < revealed || reduced
          return (
            <motion.div
              key={`${key}-${enterKey}`}
              className="flex items-center gap-3 rounded-[20px] px-3.5 py-3"
              style={{
                background:
                  'linear-gradient(145deg, rgba(255,255,255,0.72), rgba(237,243,253,0.5))',
                boxShadow: '0 10px 24px -14px rgba(115,141,244,0.3)',
                border: '1px solid rgba(255,255,255,0.5)',
              }}
              initial={reduced ? false : { opacity: 0, scale: 0.4, x: -12 }}
              animate={
                scatter
                  ? {
                      opacity: 0.55,
                      scale: 0.55,
                      x: i === 0 ? -40 : i === 2 ? 40 : 0,
                      y: i === 1 ? -30 : 20,
                    }
                  : show
                    ? { opacity: 1, scale: 1, x: 0, y: 0 }
                    : { opacity: 0, scale: 0.4 }
              }
              transition={
                reduced
                  ? { duration: 0.2 }
                  : { type: 'spring', stiffness: 280, damping: 22, delay: reduced ? 0 : 0 }
              }
            >
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                style={{
                  background:
                    i === 0
                      ? 'linear-gradient(145deg, #63D9F4, #738DF4)'
                      : i === 1
                        ? 'linear-gradient(145deg, #F6B3DD, #A98BFA)'
                        : 'linear-gradient(145deg, #71C8F6, #7655F6)',
                }}
              >
                <Icon size={16} className="text-white" strokeWidth={1.75} aria-hidden />
              </span>
              <p className="text-[13.5px] font-medium text-nasouh-ink">
                {t(`slides.rules.${key}`)}
              </p>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
