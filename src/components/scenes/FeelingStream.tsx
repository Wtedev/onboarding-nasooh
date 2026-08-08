import { useEffect, useState } from 'react'
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from 'motion/react'
import { useTranslation } from 'react-i18next'

interface FeelingStreamProps {
  isActive: boolean
  reducedMotion?: boolean
  enterKey?: number
  morphToField?: boolean
  transitionProgress?: number
  onMorphCard?: () => void
}

const GRADIENTS = [
  'linear-gradient(155deg, #A8D8F0 0%, #8B9CF5 48%, #C4B5F5 100%)',
  'linear-gradient(155deg, #B8E0F5 0%, #A98BFA 45%, #F39AD6 100%)',
  'linear-gradient(155deg, #9BB8F5 0%, #7655F6 50%, #FF86B7 100%)',
  'linear-gradient(155deg, #71C8F6 0%, #A98BFA 40%, #FFB09D 100%)',
  'linear-gradient(155deg, #8A9CF5 0%, #7655F6 42%, #F39AD6 100%)',
  'linear-gradient(155deg, #63D9F4 0%, #738DF4 50%, #F58EC9 100%)',
  'linear-gradient(155deg, #73DDB9 0%, #71C8F6 45%, #A98BFA 100%)',
]

interface Lane {
  textIndex: number
  baseOffset: number
  x: number
  rotate: number
  scale: number
  blur: number
  opacity: number
  z: number
  speed: number
  enterDelay: number
  isMorphTarget?: boolean
}

const LANES: Lane[] = [
  { textIndex: 2, baseOffset: -30, x: 6, rotate: -2, scale: 1, blur: 0, opacity: 1, z: 40, speed: 1.05, enterDelay: 0, isMorphTarget: true },
  { textIndex: 0, baseOffset: -200, x: -58, rotate: -9, scale: 0.82, blur: 2.5, opacity: 0.8, z: 24, speed: 0.96, enterDelay: 120 },
  { textIndex: 1, baseOffset: -370, x: 64, rotate: 8, scale: 0.78, blur: 3.5, opacity: 0.7, z: 20, speed: 0.93, enterDelay: 240 },
  { textIndex: 3, baseOffset: -540, x: -76, rotate: -12, scale: 0.68, blur: 6, opacity: 0.48, z: 10, speed: 0.88, enterDelay: 360 },
  { textIndex: 4, baseOffset: -700, x: 86, rotate: 11, scale: 0.66, blur: 7, opacity: 0.4, z: 8, speed: 0.85, enterDelay: 480 },
  { textIndex: 5, baseOffset: -860, x: -30, rotate: 4, scale: 1.1, blur: 4, opacity: 0.52, z: 30, speed: 1.08, enterDelay: 600 },
  { textIndex: 6, baseOffset: -1020, x: 40, rotate: -6, scale: 0.74, blur: 5, opacity: 0.55, z: 14, speed: 0.9, enterDelay: 720 },
]

const INITIAL_VELOCITY = 150
const CRUISE_VELOCITY = 18
const DECELERATION_DURATION = 1.5
const TRACK_HEIGHT = 780
const CARD_H = 120

function decelerateEase(t: number) {
  return 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 2.6)
}

function wrapY(baseOffset: number, travel: number, track: number) {
  const mod = (((baseOffset + travel) % track) + track) % track
  return mod - CARD_H
}

function StreamCard({
  lane,
  travel,
  text,
  isRtl,
  morphToField,
  visible,
}: {
  lane: Lane
  travel: MotionValue<number>
  text: string
  isRtl: boolean
  morphToField: boolean
  visible: boolean
}) {
  const mirrorX = isRtl ? -lane.x : lane.x
  const y = useTransform(travel, (d) => wrapY(lane.baseOffset, d * lane.speed, TRACK_HEIGHT))
  const morphing = morphToField && lane.isMorphTarget

  return (
    <motion.div
      className="absolute left-1/2 top-0 w-[200px] origin-center overflow-hidden rounded-[24px] short:w-[170px]"
      style={{
        x: mirrorX,
        y,
        zIndex: lane.z,
        scale: lane.scale,
        rotate: lane.rotate,
        filter: `blur(${lane.blur}px)`,
        background: GRADIENTS[lane.textIndex % GRADIENTS.length],
        boxShadow: lane.scale >= 1
          ? '0 16px 36px -16px rgba(118,85,246,0.38), inset 0 1px 0 rgba(255,255,255,0.55)'
          : '0 10px 24px -14px rgba(115,141,244,0.28)',
        border: '1px solid rgba(255,255,255,0.35)',
        marginLeft: '-100px',
        pointerEvents: 'none',
      }}
      animate={{
        opacity: visible ? (morphToField && !lane.isMorphTarget ? 0 : lane.opacity) : 0,
        ...(morphing
          ? {
              x: 0,
              scaleX: 1.35,
              scaleY: 0.48,
              borderRadius: 999,
              filter: 'blur(0px)',
              rotate: 0,
            }
          : {}),
      }}
      transition={
        morphing
          ? { type: 'spring', stiffness: 220, damping: 22 }
          : { opacity: { duration: 0.35 } }
      }
      aria-hidden
    >
      <div className="flex min-h-[108px] items-center px-4 py-3.5 short:min-h-[96px] short:px-3">
        <p
          className="text-[14px] font-medium leading-snug text-white short:text-[13px]"
          style={{ opacity: morphing ? 0 : 1 }}
          dir={isRtl ? 'rtl' : 'ltr'}
        >
          {text}
        </p>
      </div>
    </motion.div>
  )
}

export function FeelingStream({
  isActive,
  reducedMotion: reducedProp,
  enterKey = 0,
  morphToField = false,
}: FeelingStreamProps) {
  const { t, i18n } = useTranslation()
  const prefersReduced = useReducedMotion()
  const reduced = reducedProp ?? prefersReduced ?? false
  const isRtl = i18n.language?.startsWith('ar') ?? true
  const items = t('feelingCards.items', { returnObjects: true }) as string[]

  const travel = useMotionValue(0)
  const [revealed, setRevealed] = useState(0)

  useEffect(() => {
    if (!isActive || reduced || morphToField) return
    travel.set(0)
    setRevealed(0)
    let raf = 0
    let last = performance.now()
    const t0 = performance.now()
    let stopped = false

    const timers = LANES.map((lane, i) =>
      window.setTimeout(() => {
        if (!stopped) setRevealed(i + 1)
      }, lane.enterDelay),
    )

    const tick = (now: number) => {
      if (stopped) return
      const dt = Math.min(0.048, (now - last) / 1000)
      last = now
      const elapsed = (now - t0) / 1000
      let velocity = CRUISE_VELOCITY
      if (elapsed < DECELERATION_DURATION) {
        const e = decelerateEase(elapsed / DECELERATION_DURATION)
        velocity = INITIAL_VELOCITY + (CRUISE_VELOCITY - INITIAL_VELOCITY) * e
      }
      travel.set(travel.get() + velocity * dt)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      stopped = true
      cancelAnimationFrame(raf)
      timers.forEach(clearTimeout)
    }
  }, [isActive, enterKey, reduced, morphToField, travel])

  if (!isActive && !morphToField) return null

  if (reduced) {
    return (
      <div className="relative mx-auto flex h-full w-full max-w-[320px] flex-col items-center justify-center gap-3">
        {[2, 0, 4].map((idx, i) => (
          <motion.div
            key={idx}
            className="w-[88%] rounded-[22px] px-4 py-3.5"
            style={{
              background: GRADIENTS[idx],
              border: '1px solid rgba(255,255,255,0.35)',
              opacity: 1 - i * 0.15,
              transform: `scale(${1 - i * 0.06})`,
            }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1 - i * 0.15, y: 0 }}
          >
            <p className="text-[13px] font-medium text-white" dir={isRtl ? 'rtl' : 'ltr'}>
              {items[idx]}
            </p>
          </motion.div>
        ))}
      </div>
    )
  }

  return (
    <div className="relative mx-auto h-full w-full max-w-[340px] overflow-hidden" aria-hidden>
      {LANES.map((lane, i) => (
        <StreamCard
          key={`${lane.textIndex}-${i}-${enterKey}`}
          lane={lane}
          travel={travel}
          text={items[lane.textIndex] ?? ''}
          isRtl={isRtl}
          morphToField={morphToField}
          visible={i < revealed}
        />
      ))}
    </div>
  )
}
