import { useEffect, useMemo } from 'react'
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  animate,
} from 'motion/react'
/**
 * Soft living gradients in Nasouh brand pastels.
 * One palette per onboarding slide — do not collapse services onto one index.
 * 0–1 locked (user-approved). 2+ = distinct two-tone washes that settle into white.
 */
const PALETTES = [
  // 0 containment — unchanged
  {
    top: '#D8E8FC',
    mid: '#C5D4F8',
    bloomA: 'rgba(113,200,246,0.55)',
    bloomB: 'rgba(169,139,250,0.42)',
    bloomC: 'rgba(99,217,244,0.35)',
  },
  // 1 solidarity — unchanged (airy sky + lavender)
  {
    top: '#F9F9FB',
    mid: '#EBF4FF',
    bloomA: 'rgba(243,232,255,0.58)',
    bloomB: 'rgba(235,244,255,0.52)',
    bloomC: 'rgba(251,249,247,0.42)',
  },
  // 2 sessions — open turquoise above, same tone a bit lower + sky → white
  {
    top: '#F7FCFB',
    mid: '#E8F7F4',
    bloomA: 'rgba(195,240,232,0.78)', // lighter open turquoise (upper)
    bloomB: 'rgba(165,220,245,0.58)',
    bloomC: 'rgba(150,225,215,0.72)', // same hue, sits lower
  },
  // 3 assessment — soft lavender + very light pink (not violet) + white
  {
    top: '#FFFBFD',
    mid: '#F8EEF4',
    bloomA: 'rgba(215,195,235,0.55)',
    bloomB: 'rgba(255,210,228,0.72)', // open light pink, not purple
    bloomC: 'rgba(255,255,255,0.75)',
  },
  // 4 courses — very light lavender + sky → white
  {
    top: '#FCFAFF',
    mid: '#F3EEFA',
    bloomA: 'rgba(220,205,245,0.7)', // was yellow → very light violet
    bloomB: 'rgba(155,200,245,0.52)',
    bloomC: 'rgba(255,255,255,0.76)',
  },
  // 5 companion — peach + soft lilac + white
  {
    top: '#FFFCFA',
    mid: '#FAEDE8',
    bloomA: 'rgba(255,175,155,0.62)',
    bloomB: 'rgba(200,175,240,0.55)',
    bloomC: 'rgba(255,255,255,0.75)',
  },
  // 6 choice — sky blue + soft teal + white
  {
    top: '#FAFCFF',
    mid: '#E4F0FA',
    bloomA: 'rgba(125,185,240,0.7)',
    bloomB: 'rgba(145,220,210,0.52)',
    bloomC: 'rgba(255,255,255,0.74)',
  },
] as const

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n))
}

function lerpHex(a: string, b: string, t: number) {
  const pa = parseInt(a.slice(1), 16)
  const pb = parseInt(b.slice(1), 16)
  const ar = (pa >> 16) & 255
  const ag = (pa >> 8) & 255
  const ab = pa & 255
  const br = (pb >> 16) & 255
  const bg = (pb >> 8) & 255
  const bb = pb & 255
  const r = Math.round(ar + (br - ar) * t)
  const g = Math.round(ag + (bg - ag) * t)
  const bl = Math.round(ab + (bb - ab) * t)
  return `#${((1 << 24) + (r << 16) + (g << 8) + bl).toString(16).slice(1)}`
}

function lerpRgba(a: string, b: string, t: number) {
  const parse = (s: string) => {
    const m = s.match(/rgba?\(([^)]+)\)/)
    if (!m) return [0, 0, 0, 1]
    const p = m[1].split(',').map((x) => parseFloat(x.trim()))
    return [p[0], p[1], p[2], p[3] ?? 1]
  }
  const A = parse(a)
  const B = parse(b)
  return `rgba(${Math.round(A[0] + (B[0] - A[0]) * t)}, ${Math.round(A[1] + (B[1] - A[1]) * t)}, ${Math.round(A[2] + (B[2] - A[2]) * t)}, ${(A[3] + (B[3] - A[3]) * t).toFixed(3)})`
}

interface SlideAtmosphereProps {
  activeIndex: number
  transitionProgress: number
  isDragging?: boolean
}

export function SlideAtmosphere({
  activeIndex,
  transitionProgress,
  isDragging = false,
}: SlideAtmosphereProps) {
  const prefersReduced = useReducedMotion() ?? false
  const max = PALETTES.length - 1
  const fractional = isDragging ? transitionProgress : activeIndex
  const i0 = Math.max(0, Math.min(max, Math.floor(fractional)))
  const i1 = Math.min(max, i0 + 1)
  const t = clamp01(fractional - i0)

  const palette = useMemo(() => {
    const A = PALETTES[i0] ?? PALETTES[0]
    const B = PALETTES[i1] ?? A
    return {
      top: lerpHex(A.top, B.top, t),
      mid: lerpHex(A.mid, B.mid, t),
      bloomA: lerpRgba(A.bloomA, B.bloomA, t),
      bloomB: lerpRgba(A.bloomB, B.bloomB, t),
      bloomC: lerpRgba(A.bloomC, B.bloomC, t),
    }
  }, [i0, i1, t])

  // Continuous soft drift (Motion values — no React state per frame)
  const driftX = useMotionValue(0)
  const driftY = useMotionValue(0)
  const drift2X = useMotionValue(0)
  const drift2Y = useMotionValue(0)
  const hueShift = useMotionValue(0)

  const springX = useSpring(driftX, { stiffness: 18, damping: 22 })
  const springY = useSpring(driftY, { stiffness: 18, damping: 22 })
  const spring2X = useSpring(drift2X, { stiffness: 14, damping: 20 })
  const spring2Y = useSpring(drift2Y, { stiffness: 14, damping: 20 })

  useEffect(() => {
    if (prefersReduced) {
      driftX.set(0)
      driftY.set(0)
      drift2X.set(0)
      drift2Y.set(0)
      return
    }
    const c1 = animate(driftX, [0, 18, -12, 0], {
      duration: 18,
      repeat: Infinity,
      ease: 'easeInOut',
    })
    const c2 = animate(driftY, [0, -14, 10, 0], {
      duration: 22,
      repeat: Infinity,
      ease: 'easeInOut',
    })
    const c3 = animate(drift2X, [0, -22, 16, 0], {
      duration: 26,
      repeat: Infinity,
      ease: 'easeInOut',
    })
    const c4 = animate(drift2Y, [0, 18, -10, 0], {
      duration: 20,
      repeat: Infinity,
      ease: 'easeInOut',
    })
    const c5 = animate(hueShift, [0, 1, 0], {
      duration: 14,
      repeat: Infinity,
      ease: 'easeInOut',
    })
    return () => {
      c1.stop()
      c2.stop()
      c3.stop()
      c4.stop()
      c5.stop()
    }
  }, [prefersReduced, driftX, driftY, drift2X, drift2Y, hueShift])

  // Slide-enter nudge so colors feel alive on change
  useEffect(() => {
    if (prefersReduced || isDragging) return
    void animate(driftY, driftY.get() - 8, { duration: 0.5 }).then(() =>
      animate(driftY, 0, { type: 'spring', stiffness: 40, damping: 18 }),
    )
  }, [activeIndex]) // eslint-disable-line react-hooks/exhaustive-deps

  const bloomCOpacity = useTransform(hueShift, [0, 1], [0.55, 0.85])
  // Slides 2+ settle into pure white; 0–1 keep the original soft ice end
  const settleWhite = activeIndex >= 2 ? '#FFFFFF' : '#F7F9FE'
  const flipVertical = activeIndex <= 1
  const sessionsSlide = activeIndex === 2
  const baseGradient = flipVertical
    ? // Slides 1–2: flip top↔bottom — softer field up top, color wash lower
      `linear-gradient(165deg, ${settleWhite} 0%, ${palette.mid} 55%, ${palette.top} 100%)`
    : activeIndex >= 2
      ? `linear-gradient(165deg, ${palette.top} 0%, ${palette.mid} 28%, ${settleWhite} 68%, ${settleWhite} 100%)`
      : `linear-gradient(165deg, ${palette.top} 0%, ${palette.mid} 48%, ${settleWhite} 100%)`

  const bloomAClass = flipVertical
    ? 'absolute -left-[20%] bottom-[-12%] h-[68%] w-[80%] rounded-full'
    : sessionsSlide
      ? 'absolute -left-[18%] top-[2%] h-[58%] w-[78%] rounded-full'
      : 'absolute -left-[20%] -top-[10%] h-[70%] w-[80%] rounded-full'

  const bloomBClass = flipVertical
    ? 'absolute -right-[25%] bottom-[4%] h-[62%] w-[75%] rounded-full'
    : 'absolute -right-[25%] top-[8%] h-[65%] w-[75%] rounded-full'

  const bloomCClass = flipVertical
    ? 'absolute bottom-[-6%] left-[8%] h-[52%] w-[90%] rounded-full'
    : sessionsSlide
      ? 'absolute left-[6%] top-[40%] h-[58%] w-[88%] rounded-full'
      : 'absolute bottom-[-15%] left-[10%] h-[55%] w-[90%] rounded-full'

  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      aria-hidden
    >
      {/* Base wash — ice → soft tint */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: baseGradient,
        }}
        transition={
          prefersReduced
            ? { duration: 0.2 }
            : isDragging
              ? { duration: 0.05 }
              : { duration: 0.85, ease: [0.22, 1, 0.36, 1] }
        }
      />

      {/* Living blooms — flipped vertically on slides 1–2 */}
      <motion.div
        className={bloomAClass}
        style={{
          background: `radial-gradient(ellipse at 40% 40%, ${palette.bloomA} 0%, transparent 68%)`,
          filter: 'blur(28px)',
          x: springX,
          y: springY,
          willChange: 'transform',
        }}
      />
      <motion.div
        className={bloomBClass}
        style={{
          background: `radial-gradient(ellipse at 55% 45%, ${palette.bloomB} 0%, transparent 70%)`,
          filter: 'blur(32px)',
          x: spring2X,
          y: spring2Y,
          willChange: 'transform',
        }}
      />
      <motion.div
        className={bloomCClass}
        style={{
          background: `radial-gradient(ellipse at 50% 30%, ${palette.bloomC} 0%, transparent 72%)`,
          filter: 'blur(36px)',
          opacity: bloomCOpacity,
          willChange: 'opacity',
        }}
      />

      {/* Slide 1: white bloom under logo — same language as the lower color blooms */}
      {activeIndex === 0 ? (
        <div
          className="absolute left-1/2 top-[2%] h-[58%] w-[88%] -translate-x-1/2 rounded-full"
          style={{
            background:
              'radial-gradient(ellipse at 50% 38%, rgba(255,255,255,0.72) 0%, rgba(255,255,255,0.28) 42%, transparent 70%)',
            filter: 'blur(32px)',
          }}
        />
      ) : null}

      {/* Soft milky veil — slides 3+ only */}
      {activeIndex >= 2 ? (
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.08) 42%, rgba(255,255,255,0.35) 100%)',
          }}
        />
      ) : null}
    </div>
  )
}
