import { motion } from 'motion/react'

const CAMERA_EASE = [0.65, 0, 0.22, 1] as const
/** How wide the strip is vs the viewport */
const STRIP_RATIO = 2.8

interface PanoramaBackgroundProps {
  stage: number
  slidesCount: number
  duration: number
}

/**
 * Soft orb positions along a wide strip (percent of strip width / height).
 * Right side = first slide; pans left as stage advances.
 */
const ORBS: {
  left: string
  top: string
  size: string
  color: string
}[] = [
  // ——— Right cluster (slide 1) ———
  { left: '88%', top: '16%', size: '46%', color: 'rgba(255,255,255,0.85)' },
  { left: '82%', top: '40%', size: '52%', color: 'rgba(143,131,255,0.42)' },
  { left: '76%', top: '58%', size: '40%', color: 'rgba(99,217,244,0.38)' },
  // ——— Mid-right ———
  { left: '64%', top: '20%', size: '54%', color: 'rgba(255,255,255,0.7)' },
  { left: '58%', top: '64%', size: '48%', color: 'rgba(169,139,250,0.4)' },
  // ——— Center ———
  { left: '48%', top: '68%', size: '44%', color: 'rgba(143,131,255,0.36)' },
  { left: '42%', top: '26%', size: '42%', color: 'rgba(113,200,246,0.36)' },
  // ——— Mid-left ———
  { left: '30%', top: '56%', size: '50%', color: 'rgba(169,139,250,0.38)' },
  { left: '24%', top: '30%', size: '38%', color: 'rgba(255,255,255,0.65)' },
  // ——— Far left (later slides) ———
  { left: '12%', top: '46%', size: '54%', color: 'rgba(99,217,244,0.4)' },
  { left: '6%', top: '20%', size: '40%', color: 'rgba(255,255,255,0.6)' },
  { left: '4%', top: '70%', size: '36%', color: 'rgba(143,131,255,0.32)' },
]

/**
 * Shared panoramic atmosphere for every slide.
 * Soft light base + color blooms. Stage 0 = rightmost crop; pans left each step.
 */
export function PanoramaBackground({
  stage,
  slidesCount,
  duration,
}: PanoramaBackgroundProps) {
  const progress = stage / Math.max(1, slidesCount - 1)
  const maxShiftPct = ((STRIP_RATIO - 1) / STRIP_RATIO) * 100
  const xPct = -(maxShiftPct * (1 - progress * 0.55))

  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      style={{
        background:
          'linear-gradient(165deg, #EEF2FA 0%, #E8ECF8 42%, #F7F9FE 100%)',
      }}
      aria-hidden
    >
      <motion.div
        className="absolute inset-y-0 left-0"
        style={{
          width: `${STRIP_RATIO * 100}%`,
          willChange: 'transform',
        }}
        initial={false}
        animate={{ x: `${xPct}%` }}
        transition={{ duration, ease: CAMERA_EASE }}
      >
        {ORBS.map((orb, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              left: orb.left,
              top: orb.top,
              width: orb.size,
              height: orb.size,
              transform: 'translate(-50%, -50%)',
              background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
              filter: 'blur(32px)',
            }}
          />
        ))}
      </motion.div>
    </div>
  )
}
