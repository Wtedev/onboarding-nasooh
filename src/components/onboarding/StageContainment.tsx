import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import nasouhLogo from '../../assets/nasouh-logo.png'
import { FALLING_CARDS } from '../../data/onboardingContent'
import { useTypingTimeline, type TypingStep } from '../../hooks/useTypingTimeline'
import { GrainDissolveFilter, GrainDissolveOverlay, grainCardStyle } from './CrystalDissolve'
import { CARD_H, CARD_W, MoodCardVisual } from './MoodFallingCard'

interface StageContainmentProps {
  isActive: boolean
  onContinue: () => void
  onHandoffProgress?: (t: number) => void
  /** Fired the moment the "Tour Nasouh" CTA becomes visible */
  onCtaVisible?: () => void
}

type Body = {
  id: number
  cardIndex: number
  x: number
  y: number
  vx: number
  vy: number
  rotate: number
  spin: number
  born: number
}

const SIDE_MARGIN = 28
/** Max cards visible at once (still cycles through all 10 moods). */
const MAX_VISIBLE = 5
const SPAWN_GAP = 0.85
/** Soft tilt only — never a full flip. */
const MAX_TILT = 16

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n))
}

function makeBody(id: number, now: number, width: number): Body {
  const halfW = width / 2
  const maxX = Math.max(20, halfW - SIDE_MARGIN - CARD_W / 2)
  const lane = ((id * 37) % 5) - 2
  const x = clamp(lane * (maxX * 0.38) + (Math.random() - 0.5) * 18, -maxX, maxX)
  return {
    id,
    cardIndex: id % FALLING_CARDS.length,
    x,
    y: -CARD_H - 24 - Math.random() * 40,
    vx: (Math.random() - 0.5) * 32,
    vy: 110 + Math.random() * 40,
    rotate: (Math.random() - 0.5) * 14,
    spin: (Math.random() - 0.5) * 4,
    born: now,
  }
}

export function StageContainment({
  isActive,
  onContinue,
  onCtaVisible,
}: StageContainmentProps) {
  const { t, i18n } = useTranslation()
  const reduced = useReducedMotion() ?? false
  const mirrored = i18n.language.startsWith('ar')
  const [phase, setPhase] = useState<
    | 'fall'
    | 'line1'
    | 'line2'
    | 'line2Hold'
  >('fall')
  const [typed, setTyped] = useState('')
  const [showCta, setShowCta] = useState(false)
  const [showLogo, setShowLogo] = useState(false)
  const [ctaInstant, setCtaInstant] = useState(false)
  const [frames, setFrames] = useState<Body[]>([])
  const [heldLine1, setHeldLine1] = useState('')
  const [heldLine2, setHeldLine2] = useState('')
  const stopped = useRef(false)
  const textAlive = useRef(true)
  /** Survives leave/return so Back shows the CTA immediately */
  const hasShownCta = useRef(false)
  const fieldRef = useRef<HTMLDivElement>(null)
  const bodies = useRef<Body[]>([])
  const nextId = useRef(0)
  const lastSpawn = useRef(0)
  const fieldH = useRef(640)
  const phaseRef = useRef(phase)
  phaseRef.current = phase

  useEffect(() => {
    if (!isActive) {
      stopped.current = true
      textAlive.current = false
      setPhase('fall')
      setTyped('')
      setHeldLine1('')
      setHeldLine2('')
      setShowCta(false)
      setShowLogo(false)
      setCtaInstant(false)
      bodies.current = []
      setFrames([])
      return
    }
    stopped.current = false
    textAlive.current = true

    const line2 =
      `${t('stages.containment.line2Lead')}${t('stages.containment.line2Tail')}`
    const returning = hasShownCta.current

    if (returning) {
      // Back to slide 1 — keep CTA visible from the first frame
      setShowLogo(true)
      setShowCta(true)
      setCtaInstant(true)
      onCtaVisible?.()
      setPhase('line2Hold')
      setHeldLine1(t('stages.containment.line1'))
      setHeldLine2(line2)
      setTyped(line2)
    } else {
      setShowCta(false)
      setShowLogo(false)
      setCtaInstant(false)
      setPhase('fall')
      setHeldLine1('')
      setHeldLine2('')
      setTyped('')
    }

    if (reduced) {
      setShowLogo(true)
      setPhase('line2Hold')
      setHeldLine1(t('stages.containment.line1'))
      setTyped(line2)
      setHeldLine2(line2)
      setShowCta(true)
      setCtaInstant(true)
      onCtaVisible?.()
      hasShownCta.current = true
      setFrames(
        FALLING_CARDS.slice(0, MAX_VISIBLE).map((_, i) => ({
          id: i,
          cardIndex: i,
          x: ((i % 2) * 2 - 1) * 48,
          y: 110 + i * (CARD_H * 0.55),
          vx: 0,
          vy: 0,
          rotate: (i % 2 === 0 ? -1 : 1) * (6 + i),
          spin: 0,
          born: 0,
        })),
      )
      return
    }

    let logoT = 0
    if (!returning) {
      // Logo first; text starts only after logo upward settle (onAnimationComplete)
      logoT = window.setTimeout(() => {
        if (!stopped.current) setShowLogo(true)
      }, 640)
    }

    let raf = 0
    let last = performance.now()
    // Spawn first card immediately
    lastSpawn.current = performance.now() - SPAWN_GAP * 1000
    nextId.current = 0
    bodies.current = []

    const tick = (now: number) => {
      if (stopped.current) return
      const dt = Math.min(0.033, (now - last) / 1000)
      last = now
      const el = fieldRef.current
      const width = Math.max(el?.clientWidth ?? 0, 320)
      const height = Math.max(el?.clientHeight ?? 0, 480)
      fieldH.current = height
      const halfW = width / 2
      const maxX = Math.max(16, halfW - SIDE_MARGIN - CARD_W / 2)

      if (
        bodies.current.length < MAX_VISIBLE &&
        now - lastSpawn.current > SPAWN_GAP * 1000
      ) {
        bodies.current.push(makeBody(nextId.current++, now, width))
        lastSpawn.current = now
      }

      for (const b of bodies.current) {
        b.vy += 26 * dt
        b.y += b.vy * dt
        b.x += b.vx * dt
        b.rotate = clamp(b.rotate + b.spin * dt, -MAX_TILT, MAX_TILT)
        if (Math.abs(b.rotate) >= MAX_TILT - 0.01) b.spin *= -0.55
        b.spin *= 0.992

        if (b.x < -maxX) {
          b.x = -maxX
          b.vx = Math.abs(b.vx) * 0.85
          b.spin = clamp(b.spin * -0.6, -5, 5)
        } else if (b.x > maxX) {
          b.x = maxX
          b.vx = -Math.abs(b.vx) * 0.85
          b.spin = clamp(b.spin * -0.6, -5, 5)
        }
      }

      for (let i = 0; i < bodies.current.length; i++) {
        for (let j = i + 1; j < bodies.current.length; j++) {
          const a = bodies.current[i]
          const b = bodies.current[j]
          const dx = b.x - a.x
          const dy = b.y - a.y
          const minDx = CARD_W * 0.9
          const minDy = CARD_H * 0.88
          if (Math.abs(dx) < minDx && Math.abs(dy) < minDy) {
            const overlapX = minDx - Math.abs(dx)
            const overlapY = minDy - Math.abs(dy)
            if (overlapX < overlapY) {
              const push = (overlapX / 2 + 1) * Math.sign(dx || 1)
              a.x -= push
              b.x += push
              const avx = a.vx
              a.vx = b.vx * 0.7 - 18 * Math.sign(push)
              b.vx = avx * 0.7 + 18 * Math.sign(push)
              a.spin = clamp(a.spin + 2.2, -5, 5)
              b.spin = clamp(b.spin - 2.2, -5, 5)
            } else {
              const push = (overlapY / 2 + 1) * Math.sign(dy || 1)
              a.y -= push
              b.y += push
              const tmp = a.vy
              a.vy = Math.min(b.vy, tmp) * 0.65
              b.vy = Math.max(tmp, b.vy) * 0.95 + 8
            }
            a.x = clamp(a.x, -maxX, maxX)
            b.x = clamp(b.x, -maxX, maxX)
            a.rotate = clamp(a.rotate, -MAX_TILT, MAX_TILT)
            b.rotate = clamp(b.rotate, -MAX_TILT, MAX_TILT)
          }
        }
      }

      bodies.current = bodies.current.filter((b) => b.y < height + CARD_H)
      setFrames(bodies.current.map((b) => ({ ...b })))
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      stopped.current = true
      cancelAnimationFrame(raf)
      if (logoT) clearTimeout(logoT)
    }
  }, [isActive, reduced, t])

  const line1Steps = useMemo<TypingStep[]>(
    () => [
      {
        action: 'type',
        text: t('stages.containment.line1'),
        baseDelay: 16,
        endDelay: 108,
        pace: 'easeOut',
      },
      { action: 'hold', duration: 160 },
    ],
    [t],
  )

  const line2Full = useMemo(
    () => `${t('stages.containment.line2Lead')}${t('stages.containment.line2Tail')}`,
    [t],
  )

  const line2Steps = useMemo<TypingStep[]>(
    () => [
      {
        action: 'type',
        text: t('stages.containment.line2Lead'),
        baseDelay: 48,
        endDelay: 62,
        pace: 'linear',
      },
      { action: 'hold', duration: 380 },
      {
        action: 'type',
        text: t('stages.containment.line2Tail'),
        baseDelay: 26,
        endDelay: 34,
        pace: 'linear',
      },
      { action: 'hold', duration: 120 },
    ],
    [t],
  )

  useTypingTimeline({
    steps: line1Steps,
    enabled: isActive && phase === 'line1' && !reduced,
    reducedMotion: false,
    finalText: t('stages.containment.line1'),
    onText: setTyped,
    onPhase: (p) => {
      if (p === 'done') {
        setHeldLine1(t('stages.containment.line1'))
        setTyped('')
        setPhase('line2')
      }
    },
  })

  useTypingTimeline({
    steps: line2Steps,
    enabled: isActive && phase === 'line2' && !reduced,
    reducedMotion: false,
    finalText: line2Full,
    onText: setTyped,
    onPhase: (p) => {
      if (p === 'done') {
        setHeldLine2(line2Full)
        setShowCta(true)
        onCtaVisible?.()
        hasShownCta.current = true
        // Hold final two-line lockup — no loop / no re-type
        setPhase('line2Hold')
      }
    },
  })

  if (!isActive) return null

  const h = fieldH.current
  const showCursor = (phase === 'line1' || phase === 'line2') && !reduced
  const softIn = { opacity: 1, y: 0, filter: 'blur(0px)' } as const
  const headlineStyle = {
    color: '#8f83ff',
    WebkitTextFillColor: '#8f83ff',
  } as const
  // Headline size: 20px — tight two-line lockup under the logo
  const headlineClass =
    'max-w-[300px] bg-transparent text-center text-[20px] font-bold leading-[1.2]'
  const line1Text = t('stages.containment.line1')
  return (
    <div className="relative h-full w-full">
      <div
        ref={fieldRef}
        className="absolute inset-0 z-[2] overflow-hidden"
        style={{ paddingInline: SIDE_MARGIN }}
        aria-hidden
      >
        {frames.map((b) => {
          const card = FALLING_CARDS[b.cardIndex]
          if (!card) return null
          const progress = clamp(b.y / Math.max(1, h), 0, 1)
          // Transparent at spawn; fully solid by mid-page
          const midT = clamp(progress / 0.5, 0, 1)
          const opacity = midT * midT * (3 - 2 * midT) // smoothstep
          // blur at start of fall, clear by mid-screen
          const enterBlur =
            progress >= 0.45 ? 0 : (1 - progress / 0.45) * 6
          const dissolve = progress < 0.48 ? 0 : clamp((progress - 0.48) / 0.52, 0, 1)
          const filterId = `grain-dissolve-${b.id}`

          return (
            <div
              key={b.id}
              className="absolute left-1/2 top-0 will-change-transform"
              style={{
                width: CARD_W,
                height: CARD_H,
                marginLeft: -CARD_W / 2,
                transform: `translate3d(${b.x}px, ${b.y}px, 0) rotate(${b.rotate}deg)`,
                opacity,
                filter: enterBlur > 0.05 ? `blur(${enterBlur.toFixed(2)}px)` : undefined,
              }}
            >
              <GrainDissolveFilter id={filterId} strength={dissolve} />
              <div
                className="relative h-full w-full"
                style={grainCardStyle(dissolve, filterId)}
              >
                <MoodCardVisual
                  cardId={card.id}
                  support={t(`stages.containment.cards.${card.id}.support`)}
                  feeling={t(`stages.containment.cards.${card.id}.feeling`)}
                  mirrored={mirrored}
                />
              </div>
              <GrainDissolveOverlay seed={b.id} strength={dissolve} />
            </div>
          )
        })}
      </div>

      {/* Soft wash removed on slide 1 — atmosphere reads without overlay */}

      {/* Logo — rises upward first; typing starts after it settles */}
      <div className="pointer-events-none absolute inset-x-0 top-[13%] z-10 flex justify-center px-6">
        <AnimatePresence>
          {showLogo && (
            <motion.img
              key="nasouh-logo"
              src={nasouhLogo}
              alt={t('brand')}
              className="h-9 w-auto select-none"
              draggable={false}
              initial={reduced ? false : { opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.78, ease: [0.22, 1, 0.36, 1] }}
              onAnimationComplete={() => {
                if (stopped.current || !textAlive.current || reduced) return
                // Only kick off typing after the first logo entrance
                if (phaseRef.current === 'fall') {
                  window.setTimeout(() => {
                    if (!stopped.current && textAlive.current && phaseRef.current === 'fall') {
                      setPhase('line1')
                    }
                  }, 120)
                }
              }}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Text — typing only (no slide-in); starts after logo */}
      <div className="pointer-events-none absolute inset-x-0 top-[calc(13%+4.25rem)] z-10 flex justify-center px-6">
        <div className="flex min-h-[56px] w-full max-w-[300px] justify-center">
          <AnimatePresence>
            {(phase === 'line1' || phase === 'line2' || phase === 'line2Hold') && (
              <motion.div
                key="headline"
                className={headlineClass}
                style={headlineStyle}
                aria-live="polite"
                initial={false}
                animate={softIn}
              >
                {/* Always reserve both rows so typing line2 doesn't jump the block */}
                <p className="m-0">
                  {phase === 'line1' ? typed : heldLine1 || line1Text}
                  {phase === 'line1' && showCursor && (
                    <span
                      className="nasouh-caret ms-0.5 inline-block h-[14px] w-[2px] translate-y-0.5 align-middle"
                      style={{
                        background: '#8f83ff',
                        WebkitTextFillColor: 'initial',
                      }}
                    />
                  )}
                </p>
                <p className="m-0 min-h-[1.2em]">
                  {phase === 'line1'
                    ? '\u00A0'
                    : phase === 'line2'
                      ? typed || '\u00A0'
                      : heldLine2 || typed || '\u00A0'}
                  {phase === 'line2' && showCursor && (
                    <span
                      className="nasouh-caret ms-0.5 inline-block h-[14px] w-[2px] translate-y-0.5 align-middle"
                      style={{
                        background: '#8f83ff',
                        WebkitTextFillColor: 'initial',
                      }}
                    />
                  )}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex flex-col items-center px-6 pb-0">
        {showCta && (
          <motion.button
            type="button"
            className="pointer-events-auto nasouh-cta h-[52px] w-[62%] max-w-[225px] rounded-full text-[15px] font-medium text-white"
            onClick={onContinue}
            initial={ctaInstant || reduced ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.35, ease: [0.22, 1, 0.36, 1] }}
          >
            {t('stages.containment.cta')}
          </motion.button>
        )}
      </div>
    </div>
  )
}
