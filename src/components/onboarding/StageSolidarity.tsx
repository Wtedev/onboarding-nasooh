import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import erthSvg from '../../assets/erth.svg'

interface StageSolidarityProps {
  isActive: boolean
  onContinue: () => void
}

const CX = 100
const CY = 92
const GLOBE_R = 52
/** Dark purple — matched to reference orbits */
const ORBIT = '#43368E'
const ORBIT_STROKE = 0.4

/**
 * Three rings sized from the reference: each one's envelope stays within
 * ~1.1x the globe radius across, so they read as orbits crossing the sphere
 * rather than flat belts around its waist. The third sits shallower to break
 * up the symmetry of the two steep ones.
 */
const ORBIT_DEFS: {
  rx: number
  ry: number
  rot: number
  dy: number
  delay: number
  /** Which end of the ring the stroke starts drawing from */
  fromLeft?: boolean
}[] = [
  { rx: 60, ry: 21, rot: 44, dy: 2, delay: 0.1 },
  { rx: 57, ry: 23, rot: -26, dy: 6, delay: 0.6, fromLeft: true },
  { rx: 60, ry: 17, rot: 12, dy: 8, delay: 1.1, fromLeft: true },
]

const DRAW = 0.9
/**
 * Share of the draw spent on the near half. The far half is mostly hidden
 * behind the globe, so giving it less time keeps the sweep across the visible
 * face from stalling once the stroke passes behind.
 */
const NEAR_SHARE = 0.65

/**
 * The near/far split of a tilted orbit falls exactly on the major-axis
 * endpoints, so the front arc is the half-ellipse between them that bulges
 * downward. Both endpoints sit outside the globe, where the full ring behind
 * already draws the same curve — so the joins are invisible.
 *
 * `loop` starts at the same point as `frontArc` and traverses the near half
 * first, so drawing both from their start keeps the two layers on the same
 * point of the curve and the stroke reads as one line winding around the globe.
 */
const ORBITS = ORBIT_DEFS.map((o) => {
  const cy = CY + o.dy
  const rad = (o.rot * Math.PI) / 180
  const dx = o.rx * Math.cos(rad)
  const dyy = o.rx * Math.sin(rad)
  const right = `${(CX + dx).toFixed(2)} ${(cy + dyy).toFixed(2)}`
  const left = `${(CX - dx).toFixed(2)} ${(cy - dyy).toFixed(2)}`
  // Reversing the endpoints flips the sweep flag, tracing the same near half
  // in the opposite direction.
  const start = o.fromLeft ? left : right
  const end = o.fromLeft ? right : left
  const sweep = o.fromLeft ? 0 : 1
  const nearHalf = `A ${o.rx} ${o.ry} ${o.rot} 0 ${sweep} ${end}`
  const farHalf = `A ${o.rx} ${o.ry} ${o.rot} 0 ${sweep} ${start}`
  return {
    ...o,
    cy,
    frontArc: `M ${start} ${nearHalf}`,
    loop: `M ${start} ${nearHalf} ${farHalf}`,
  }
})

export function StageSolidarity({ isActive, onContinue }: StageSolidarityProps) {
  const { t } = useTranslation()
  const reduced = useReducedMotion() ?? false
  const [globeReady, setGlobeReady] = useState(false)
  const [orbitsReady, setOrbitsReady] = useState(false)

  useEffect(() => {
    if (!isActive) {
      setGlobeReady(false)
      setOrbitsReady(false)
      return
    }
    if (reduced) {
      setGlobeReady(true)
      setOrbitsReady(true)
      return
    }

    setGlobeReady(false)
    setOrbitsReady(false)

    const t1 = window.setTimeout(() => setGlobeReady(true), 180)
    const t2 = window.setTimeout(() => setOrbitsReady(true), 480)

    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
    }
  }, [isActive, reduced])

  if (!isActive) return null

  const softEase = [0.22, 1, 0.36, 1] as const

  return (
    <div className="relative flex h-full w-full flex-col">
      <div className="relative min-h-0 flex-1 px-3" aria-hidden>
        <svg
          viewBox="0 0 200 200"
          className="mx-auto h-full w-full max-w-[420px]"
        >
          <defs>
            <clipPath id="globeClip">
              <circle cx={CX} cy={CY} r={GLOBE_R} />
            </clipPath>
          </defs>

          {globeReady && (
            <circle
              cx={CX}
              cy={CY}
              r={GLOBE_R + 5}
              fill="rgba(255,255,255,0.4)"
            />
          )}

          {/* Full loop behind the globe, drawn from the near side around */}
          {orbitsReady &&
            ORBITS.map((o, i) => (
              <motion.path
                key={`back-${i}`}
                d={o.loop}
                fill="none"
                stroke={ORBIT}
                strokeWidth={ORBIT_STROKE}
                strokeLinecap="round"
                initial={reduced ? false : { pathLength: 0 }}
                animate={{ pathLength: [0, 0.5, 1] }}
                transition={{
                  duration: reduced ? 0 : DRAW,
                  times: [0, NEAR_SHARE, 1],
                  ease: 'linear',
                  delay: reduced ? 0 : o.delay,
                }}
              />
            ))}

          {/* Earth */}
          {globeReady && (
            <motion.g
              initial={reduced ? false : { scale: 0.82, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={
                reduced
                  ? { duration: 0 }
                  : { type: 'spring', stiffness: 140, damping: 18, mass: 0.95 }
              }
              style={{ transformOrigin: `${CX}px ${CY}px` }}
            >
              <image
                href={erthSvg}
                x={CX - GLOBE_R}
                y={CY - GLOBE_R}
                width={GLOBE_R * 2}
                height={GLOBE_R * 2}
                clipPath="url(#globeClip)"
                preserveAspectRatio="xMidYMid meet"
              />
            </motion.g>
          )}

          {/* Near half of each ring, passing over the continents */}
          {orbitsReady &&
            ORBITS.map((o, i) => (
              <motion.path
                key={`front-${i}`}
                d={o.frontArc}
                fill="none"
                stroke={ORBIT}
                strokeWidth={ORBIT_STROKE}
                strokeLinecap="round"
                initial={reduced ? false : { pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{
                  duration: reduced ? 0 : DRAW * NEAR_SHARE,
                  ease: 'linear',
                  delay: reduced ? 0 : o.delay,
                }}
              />
            ))}
        </svg>

      </div>

      <div className="z-10 flex shrink-0 flex-col items-center gap-1 px-6 pb-0 text-center">
        <motion.h2
          className="text-[23px] font-bold leading-snug text-[#9167ff]"
          initial={reduced ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: softEase, delay: reduced ? 0 : 0.15 }}
        >
          {t('stages.solidarity.title')}
        </motion.h2>
        <motion.p
          className="max-w-[320px] text-[15px] font-medium leading-[1.4] text-[#43368e]"
          initial={reduced ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.95, ease: softEase, delay: reduced ? 0 : 0.32 }}
        >
          {t('stages.solidarity.description')}
        </motion.p>
        <motion.button
          type="button"
          className="nasouh-cta mt-4 h-[52px] w-[62%] max-w-[225px] rounded-full text-[15px] font-medium text-white"
          onClick={onContinue}
          initial={reduced ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, ease: softEase, delay: reduced ? 0 : 0.7 }}
        >
          {t('stages.solidarity.cta')}
        </motion.button>
      </div>
    </div>
  )
}
