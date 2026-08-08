import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import type { FloatingVariant } from '../types/onboarding'

interface FloatingElementsProps {
  variant: FloatingVariant
  active?: boolean
  enterKey?: number
}

/** Soft edge motifs for finale only — scenes own their own visuals. */
export function FloatingElements({
  variant,
  active = true,
  enterKey = 0,
}: FloatingElementsProps) {
  const reduce = useReducedMotion() ?? false

  if (variant === 'none') return null

  return (
    <div className="pointer-events-none absolute inset-0 overflow-visible" aria-hidden="true">
      <AnimatePresence mode="sync">
        {active && (
          <motion.div
            key={`${variant}-${enterKey}`}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
          >
            <FinaleDust reduce={reduce} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function FinaleDust({ reduce }: { reduce: boolean }) {
  const dots = [
    { x: -70, y: -40, s: 10, c: '#63D9F4' },
    { x: 78, y: -28, s: 8, c: '#A98BFA' },
    { x: -60, y: 50, s: 7, c: '#F58EC9' },
    { x: 68, y: 56, s: 9, c: '#71C8F6' },
  ]
  return (
    <>
      {dots.map((d, i) => (
        <motion.span
          key={i}
          className="absolute left-1/2 top-1/2 rounded-full"
          style={{
            width: d.s,
            height: d.s,
            marginLeft: -d.s / 2,
            marginTop: -d.s / 2,
            background: d.c,
            opacity: 0.35,
            filter: 'blur(0.5px)',
          }}
          initial={reduce ? false : { x: 0, y: 0, opacity: 0.5 }}
          animate={{ x: d.x, y: d.y, opacity: 0.3 }}
          transition={
            reduce
              ? { duration: 0.15 }
              : { type: 'spring', stiffness: 160, damping: 20, delay: i * 0.05 }
          }
        />
      ))}
    </>
  )
}

/** Kept for ?icons=1 route */
export function GlassIconsGallery() {
  return (
    <div className="grid grid-cols-3 gap-4 p-6" aria-hidden>
      {['#63D9F4', '#7655F6', '#F58EC9', '#71C8F6', '#A98BFA', '#73DDB9'].map((c) => (
        <div
          key={c}
          className="aspect-square rounded-[22px]"
          style={{
            background: `linear-gradient(145deg, rgba(255,255,255,0.7), ${c}55)`,
            border: '1px solid rgba(255,255,255,0.5)',
          }}
        />
      ))}
    </div>
  )
}
