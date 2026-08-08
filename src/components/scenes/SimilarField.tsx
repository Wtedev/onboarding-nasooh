import { useEffect, useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'

interface Point {
  id: number
  x: number
  y: number
  r: number
  color: string
  delay: number
  depth: number
}

const BASE_POINTS: Omit<Point, 'id'>[] = [
  { x: 50, y: 48, r: 7, color: '#63D9F4', delay: 0, depth: 1 },
  { x: 22, y: 32, r: 4.5, color: '#A98BFA', delay: 0.35, depth: 0.55 },
  { x: 78, y: 28, r: 5, color: '#F58EC9', delay: 0.55, depth: 0.6 },
  { x: 34, y: 68, r: 3.5, color: '#71C8F6', delay: 0.75, depth: 0.4 },
  { x: 70, y: 62, r: 4, color: '#738DF4', delay: 0.9, depth: 0.45 },
  { x: 18, y: 55, r: 3, color: '#F6B3DD', delay: 1.05, depth: 0.35 },
  { x: 86, y: 48, r: 3.2, color: '#73DDB9', delay: 1.2, depth: 0.38 },
  { x: 48, y: 22, r: 2.8, color: '#7655F6', delay: 1.35, depth: 0.3 },
]

interface SimilarFieldProps {
  isActive: boolean
  reducedMotion?: boolean
  enterKey?: number
  transitionProgress?: number
  activeIndex?: number
  isDragging?: boolean
  morphToWave?: boolean
}

export function SimilarField({
  isActive,
  reducedMotion: reducedProp,
  enterKey = 0,
  transitionProgress = 0,
  activeIndex = 3,
  isDragging = false,
  morphToWave = false,
}: SimilarFieldProps) {
  const prefersReduced = useReducedMotion()
  const reduced = reducedProp ?? prefersReduced ?? false
  const [visible, setVisible] = useState(1)

  const dragT = isDragging ? Math.abs(transitionProgress - activeIndex) : 0

  const points = useMemo(
    () => BASE_POINTS.map((p, i) => ({ ...p, id: i })),
    [],
  )

  useEffect(() => {
    if (!isActive) {
      setVisible(1)
      return
    }
    if (reduced) {
      setVisible(points.length)
      return
    }
    setVisible(1)
    const timers = points.map((_, i) =>
      window.setTimeout(() => setVisible(i + 1), 280 + i * 180),
    )
    return () => timers.forEach(clearTimeout)
  }, [isActive, enterKey, reduced, points])

  if (!isActive && !morphToWave) return null

  const p0 = points[0]
  const p1 = points[1]
  const keepTwo = morphToWave

  return (
    <div className="relative mx-auto h-full w-full max-w-[340px]" aria-hidden>
      <svg viewBox="0 0 100 100" className="h-full w-full overflow-visible">
        <defs>
          <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.2" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {visible > 1 && !keepTwo && (
          <motion.line
            x1={p0.x}
            y1={p0.y}
            x2={p1.x + dragT * 4}
            y2={p1.y - dragT * 2}
            stroke="url(#thread)"
            strokeWidth={0.6}
            strokeOpacity={0.55 + dragT * 0.2}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.6 }}
            transition={{ duration: reduced ? 0.2 : 0.8, delay: reduced ? 0 : 0.6 }}
          />
        )}
        {keepTwo && (
          <motion.line
            x1={p0.x}
            y1={p0.y}
            x2={p1.x}
            y2={p1.y}
            stroke="#738DF4"
            strokeWidth={1.2}
            strokeOpacity={0.7}
            animate={{
              d: undefined,
              pathLength: 1,
              opacity: 0.85,
            }}
          />
        )}

        <defs>
          <linearGradient id="thread" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#63D9F4" />
            <stop offset="100%" stopColor="#A98BFA" />
          </linearGradient>
        </defs>

        {points.map((p, i) => {
          if (i >= visible) return null
          if (keepTwo && i > 1) return null
          const parallax = isDragging ? dragT * (12 * p.depth) * (i % 2 === 0 ? 1 : -1) : 0
          return (
            <motion.circle
              key={`${p.id}-${enterKey}`}
              cx={p.x + parallax}
              cy={p.y + parallax * 0.4}
              r={p.r}
              fill={p.color}
              filter="url(#softGlow)"
              initial={reduced ? false : { opacity: 0, scale: 0.3 }}
              animate={{
                opacity: keepTwo && i > 1 ? 0 : 0.55 + p.depth * 0.4,
                scale: 1,
              }}
              transition={
                reduced
                  ? { duration: 0.15 }
                  : { type: 'spring', stiffness: 260, damping: 20, delay: p.delay * 0.15 }
              }
              style={{ transformOrigin: `${p.x}px ${p.y}px` }}
            >
              {!reduced && i === 0 && (
                <animate
                  attributeName="r"
                  values={`${p.r};${p.r * 1.25};${p.r}`}
                  dur="2.4s"
                  repeatCount="indefinite"
                />
              )}
            </motion.circle>
          )
        })}
      </svg>
    </div>
  )
}
