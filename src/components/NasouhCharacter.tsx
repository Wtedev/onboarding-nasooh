import { useEffect, useId, useMemo, useState } from 'react'
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  type MotionValue,
} from 'motion/react'
import type { NasouhCharacterProps } from '../types/onboarding'
import {
  CORE_BREATH,
  CORE_PATHS,
  MOOD_ENERGY,
  SECONDARY_PATHS,
  SHELL_BREATH,
  SHELL_PATHS,
} from './nasouh/faceSystem'
import { NasouhFace } from './nasouh/NasouhFace'
import { useExpressionTimeline } from './nasouh/useExpressionTimeline'

function asMV(
  value: number | MotionValue<number> | { get: () => number } | undefined,
  fallback: number,
): MotionValue<number> | number {
  if (value == null) return fallback
  if (typeof value === 'number') return value
  return value as MotionValue<number>
}

/**
 * Soft Pastel Glassmorphism character.
 * Scene transforms live in NasouhStage; this owns glass layers + face.
 */
export function NasouhCharacter({
  mood,
  direction = 'idle',
  isActive = true,
  reducedMotion: reducedProp,
  visualSign = 0,
  glowPulse = 0,
  expressionOverride,
  className = '',
  shellScaleX: shellScaleXProp,
  shellScaleY: shellScaleYProp,
  layerOffsetX: layerOffsetXProp,
  layerOffsetY: layerOffsetYProp,
  glowScale: glowScaleProp,
  shadowScale: shadowScaleProp,
  shadowOpacity: shadowOpacityProp,
  faceScale: faceScaleProp,
  idlePaused = false,
  onTap,
}: NasouhCharacterProps) {
  const rawId = useId()
  const uid = useMemo(() => rawId.replace(/:/g, ''), [rawId])
  const prefersReduced = useReducedMotion()
  const reduced = reducedProp ?? prefersReduced ?? false
  const live = Boolean(isActive && !reduced && !idlePaused)
  const energy = MOOD_ENERGY[mood]
  const [tapFlash, setTapFlash] = useState(0)

  const expression = useExpressionTimeline({
    mood,
    enabled: isActive && !idlePaused,
    reducedMotion: reduced,
    override: expressionOverride,
  })

  const driftX = useMotionValue(0)
  const coreShiftX = useMotionValue(energy.coreX)
  const coreShiftY = useMotionValue(energy.coreY)
  const secondaryX = useMotionValue(energy.secondaryX)
  const secondaryY = useMotionValue(energy.secondaryY)
  const bodyOpacity = useMotionValue(energy.density)
  const highlightX = useMotionValue(0)
  const tapScale = useMotionValue(1)

  const shellScaleX = asMV(shellScaleXProp as MotionValue<number> | number | undefined, 1)
  const shellScaleY = asMV(shellScaleYProp as MotionValue<number> | number | undefined, 1)
  const sceneLayerX = asMV(layerOffsetXProp as MotionValue<number> | number | undefined, 0)
  const sceneLayerY = asMV(layerOffsetYProp as MotionValue<number> | number | undefined, 0)
  const glowScale = asMV(glowScaleProp as MotionValue<number> | number | undefined, 1)
  const shadowScale = asMV(shadowScaleProp as MotionValue<number> | number | undefined, 1)
  const shadowOpacity = asMV(shadowOpacityProp as MotionValue<number> | number | undefined, 0.24)
  const faceScale = asMV(faceScaleProp as MotionValue<number> | number | undefined, 1)

  const coreD = CORE_PATHS[mood]
  const breathD = CORE_BREATH[mood]
  const shellD = SHELL_PATHS[mood]
  const shellBreath = SHELL_BREATH[mood]
  const secondaryD = SECONDARY_PATHS[mood]

  useEffect(() => {
    coreShiftX.set(energy.coreX)
    coreShiftY.set(energy.coreY)
    secondaryX.set(energy.secondaryX)
    secondaryY.set(energy.secondaryY)
    bodyOpacity.set(energy.density)
  }, [
    energy.coreX,
    energy.coreY,
    energy.secondaryX,
    energy.secondaryY,
    energy.density,
    coreShiftX,
    coreShiftY,
    secondaryX,
    secondaryY,
    bodyOpacity,
  ])

  useEffect(() => {
    if (!isActive || reduced || direction === 'idle' || idlePaused) {
      driftX.set(0)
      return
    }
    const logical = direction === 'forward' ? 1 : -1
    const sign = visualSign !== 0 ? Math.sign(visualSign) : logical
    void animate(driftX, sign * 4, { duration: 0.18 }).then(() =>
      animate(driftX, 0, { duration: 0.45, ease: [0.22, 0.9, 0.28, 1] }),
    )
    void animate(coreShiftX, energy.coreX + sign * 6, { duration: 0.2 }).then(() =>
      animate(coreShiftX, energy.coreX, { duration: 0.5, ease: [0.22, 0.9, 0.28, 1] }),
    )
    void animate(secondaryX, energy.secondaryX + sign * 8, { duration: 0.32 }).then(() =>
      animate(secondaryX, energy.secondaryX, { duration: 0.65, ease: [0.22, 0.9, 0.28, 1] }),
    )
    void animate(highlightX, sign * 3, { duration: 0.25 }).then(() =>
      animate(highlightX, 0, { duration: 0.55 }),
    )
  }, [
    direction,
    isActive,
    reduced,
    visualSign,
    idlePaused,
    energy.coreX,
    energy.secondaryX,
    driftX,
    coreShiftX,
    secondaryX,
    highlightX,
  ])

  useEffect(() => {
    if (!glowPulse || reduced) return
    void animate(bodyOpacity, Math.min(0.96, energy.density + 0.08), { duration: 0.1 }).then(() =>
      animate(bodyOpacity, energy.density, { duration: 0.32 }),
    )
  }, [glowPulse, reduced, energy.density, bodyOpacity])

  // Mood-specific idle (only when live)
  useEffect(() => {
    if (!live) return
    let cancelled = false
    const loop = async () => {
      while (!cancelled) {
        if (mood === 'curious') {
          await animate(coreShiftX, energy.coreX + 3, { duration: 2.4, ease: 'easeInOut' })
          if (cancelled) break
          await animate(coreShiftY, energy.coreY - 2.5, { duration: 2.2, ease: 'easeInOut' })
          if (cancelled) break
          await animate(coreShiftX, energy.coreX - 2, { duration: 2.6, ease: 'easeInOut' })
        } else if (mood === 'calm') {
          await animate(coreShiftY, energy.coreY - 1.2, { duration: 3.8, ease: 'easeInOut' })
          if (cancelled) break
          await animate(coreShiftY, energy.coreY + 1.2, { duration: 3.8, ease: 'easeInOut' })
          if (cancelled) break
          await animate(secondaryX, energy.secondaryX - 3, { duration: 4.2, ease: 'easeInOut' })
        } else if (mood === 'focused') {
          await animate(coreShiftX, energy.coreX + 1.5, { duration: 4.5, ease: 'easeInOut' })
          if (cancelled) break
          await animate(coreShiftY, energy.coreY - 2, { duration: 3.5, ease: 'easeInOut' })
          if (cancelled) break
          await new Promise((r) => setTimeout(r, 400))
        } else if (mood === 'excited') {
          await animate(coreShiftY, energy.coreY - 2.5, { duration: 2.0, ease: 'easeInOut' })
          if (cancelled) break
          await animate(bodyOpacity, Math.min(0.96, energy.density + 0.06), {
            duration: 1.6,
            ease: 'easeInOut',
          })
          if (cancelled) break
          await animate(coreShiftY, energy.coreY + 1.5, { duration: 2.0, ease: 'easeInOut' })
          if (cancelled) break
          await animate(bodyOpacity, energy.density, { duration: 1.6, ease: 'easeInOut' })
        } else {
          // caring — slow breath
          await animate(coreShiftY, energy.coreY - 1, { duration: 4.5, ease: 'easeInOut' })
          if (cancelled) break
          await animate(secondaryY, energy.secondaryY + 1.5, { duration: 4.8, ease: 'easeInOut' })
          if (cancelled) break
          await animate(coreShiftY, energy.coreY + 1, { duration: 4.5, ease: 'easeInOut' })
        }
        if (cancelled) break
        await animate(secondaryX, energy.secondaryX + 1.5, { duration: 3.2, ease: 'easeInOut' })
        if (cancelled) break
        await animate(secondaryY, energy.secondaryY - 1, { duration: 3.0, ease: 'easeInOut' })
      }
    }
    void loop()
    return () => {
      cancelled = true
    }
  }, [
    live,
    mood,
    energy.coreX,
    energy.coreY,
    energy.secondaryX,
    energy.secondaryY,
    energy.density,
    coreShiftX,
    coreShiftY,
    secondaryX,
    secondaryY,
    bodyOpacity,
  ])

  useEffect(() => {
    if (!tapFlash) return
    void animate(tapScale, 0.96, { duration: 0.08 }).then(() =>
      animate(tapScale, 1, { type: 'spring', stiffness: 420, damping: 18 }),
    )
    void animate(secondaryX, secondaryX.get() + 3, { duration: 0.12 }).then(() =>
      animate(secondaryX, energy.secondaryX, { duration: 0.35 }),
    )
  }, [tapFlash, tapScale, secondaryX, energy.secondaryX])

  const showWaves = mood === 'calm' && (expression === 'listening' || expression === 'caring')
  const showProcess = expression === 'processing'
  const showInsight = mood === 'focused' && expression === 'happy'

  const gBody = `gb-${uid}`
  const gShell = `gs-${uid}`
  const gMilk = `gm-${uid}`
  const gSecondary = `gsec-${uid}`
  const gShadow = `gsh-${uid}`
  const gFace = `gfc-${uid}`
  const fSoft = `fs-${uid}`
  const fShell = `fsh-${uid}`
  const fGlow = `fg-${uid}`
  const fField = `ff-${uid}`
  const fFace = `nfg-${uid}`
  const fGrain = `ngr-${uid}`
  const maskShell = `ms-${uid}`

  const handlePointer = () => {
    if (!onTap || idlePaused) return
    setTapFlash((n) => n + 1)
    onTap()
  }

  return (
    <motion.div
      className={`nasouh-character relative mx-auto flex items-center justify-center ${onTap ? 'cursor-pointer max-md:cursor-auto' : ''} ${className}`}
      aria-hidden={onTap ? undefined : 'true'}
      role={onTap ? 'button' : undefined}
      tabIndex={onTap ? 0 : undefined}
      onClick={handlePointer}
      onKeyDown={(e) => {
        if (onTap && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          handlePointer()
        }
      }}
      style={{ scale: tapScale }}
    >
      <motion.svg
        viewBox="0 0 200 200"
        className="relative h-full w-full overflow-visible"
        style={{
          x: driftX,
          scaleX: typeof shellScaleX === 'number' ? shellScaleX : shellScaleX,
          scaleY: typeof shellScaleY === 'number' ? shellScaleY : shellScaleY,
        }}
      >
        <defs>
          <linearGradient id={gBody} x1="18%" y1="12%" x2="88%" y2="92%">
            <stop offset="0%" stopColor={energy.cyan} stopOpacity="0.95" />
            <stop offset="38%" stopColor={energy.sky} stopOpacity="0.92" />
            <stop offset="62%" stopColor={energy.mid} stopOpacity="0.95" />
            <stop offset="100%" stopColor={energy.violet} stopOpacity="0.98" />
          </linearGradient>
          <radialGradient id={`${gBody}-glow`} cx="36%" cy="30%" r="55%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.55" />
            <stop offset="45%" stopColor={energy.cyan} stopOpacity="0.15" />
            <stop offset="100%" stopColor={energy.deep} stopOpacity="0" />
          </radialGradient>
          <radialGradient id={gShell} cx="38%" cy="28%" r="70%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.88" />
            <stop offset="35%" stopColor="#F7FAFF" stopOpacity="0.62" />
            <stop offset="70%" stopColor="#E8EEFC" stopOpacity="0.38" />
            <stop offset="100%" stopColor={energy.sky} stopOpacity="0.14" />
          </radialGradient>
          <linearGradient id={gMilk} x1="15%" y1="0%" x2="85%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.72" />
            <stop offset="40%" stopColor="#F7FAFF" stopOpacity="0.38" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.12" />
          </linearGradient>
          <linearGradient id={gSecondary} x1="10%" y1="20%" x2="90%" y2="90%">
            <stop offset="0%" stopColor={energy.accent} stopOpacity="0.85" />
            <stop offset="55%" stopColor={energy.mid} stopOpacity="0.75" />
            <stop offset="100%" stopColor={energy.deep} stopOpacity="0.7" />
          </linearGradient>
          <radialGradient id={gShadow} cx="50%" cy="40%" r="50%">
            <stop offset="0%" stopColor={energy.mid} stopOpacity="0.45" />
            <stop offset="100%" stopColor={energy.violet} stopOpacity="0" />
          </radialGradient>
          <radialGradient id={gFace} cx="45%" cy="40%" r="55%">
            <stop offset="0%" stopColor={energy.mid} stopOpacity="0.55" />
            <stop offset="60%" stopColor={energy.violet} stopOpacity="0.22" />
            <stop offset="100%" stopColor={energy.cyan} stopOpacity="0" />
          </radialGradient>
          <filter id={fSoft} x="-35%" y="-35%" width="170%" height="170%">
            <feGaussianBlur stdDeviation="7" />
          </filter>
          <filter id={fShell} x="-12%" y="-12%" width="124%" height="124%">
            <feGaussianBlur stdDeviation="0.85" />
          </filter>
          <filter id={fGlow} x="-28%" y="-28%" width="156%" height="156%">
            <feGaussianBlur stdDeviation="3.8" />
          </filter>
          <filter id={fField} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.2" />
          </filter>
          <filter id={fFace} x="-35%" y="-35%" width="170%" height="170%">
            <feGaussianBlur stdDeviation="2.4" />
          </filter>
          <filter id={fGrain} x="-6%" y="-6%" width="112%" height="112%">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" result="n" />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.03 0"
              in="n"
              result="g"
            />
            <feComposite in="g" in2="SourceGraphic" operator="in" />
          </filter>
          <mask id={maskShell}>
            <motion.path
              d={shellD}
              fill="#FFFFFF"
              animate={live ? { d: [shellD, shellBreath, shellD] } : { d: shellD }}
              transition={
                live
                  ? { duration: 5.2, repeat: Infinity, ease: 'easeInOut' }
                  : { duration: 0.55 }
              }
            />
          </mask>
        </defs>

        <motion.ellipse
          cx="100"
          cy="176"
          rx="46"
          ry="11"
          fill={`url(#${gShadow})`}
          filter={`url(#${fSoft})`}
          style={{
            scale: typeof shadowScale === 'number' ? shadowScale : shadowScale,
            opacity: typeof shadowOpacity === 'number' ? shadowOpacity : shadowOpacity,
          }}
        />

        <motion.path
          d={shellD}
          fill={energy.sky}
          filter={`url(#${fSoft})`}
          style={{ scale: typeof glowScale === 'number' ? glowScale : glowScale }}
          animate={live ? { opacity: [0.1, 0.16, 0.1] } : { opacity: 0.12 }}
          transition={live ? { duration: 5.5, repeat: Infinity, ease: 'easeInOut' } : undefined}
        />

        <motion.g
          style={{
            x: secondaryX,
            y: secondaryY,
          }}
        >
          <motion.g
            style={{
              x: typeof sceneLayerX === 'number' ? sceneLayerX : sceneLayerX,
              y: typeof sceneLayerY === 'number' ? sceneLayerY : sceneLayerY,
            }}
          >
            <motion.path
              d={secondaryD}
              fill={`url(#${gSecondary})`}
              filter={`url(#${fGlow})`}
              opacity={0.62}
              animate={live ? { opacity: [0.52, 0.68, 0.52] } : { opacity: 0.58 }}
              transition={live ? { duration: 4.4, repeat: Infinity, ease: 'easeInOut' } : undefined}
            />
            <path d={secondaryD} fill="#FFFFFF" opacity={0.32} filter={`url(#${fField})`} />
          </motion.g>
        </motion.g>

        <motion.g style={{ x: coreShiftX, y: coreShiftY, opacity: bodyOpacity }}>
          <motion.path
            d={coreD}
            fill={`url(#${gBody})`}
            filter={`url(#${fField})`}
            animate={live ? { d: [coreD, breathD, coreD] } : { d: coreD }}
            transition={
              live
                ? { duration: 4.8, repeat: Infinity, ease: 'easeInOut' }
                : { duration: 0.55, ease: [0.22, 0.9, 0.28, 1] }
            }
          />
          <motion.path
            d={coreD}
            fill={`url(#${gBody}-glow)`}
            opacity={0.7}
            animate={live ? { d: [coreD, breathD, coreD] } : { d: coreD }}
            transition={
              live
                ? { duration: 4.8, repeat: Infinity, ease: 'easeInOut' }
                : { duration: 0.55 }
            }
          />
          <motion.ellipse
            cx="78"
            cy="88"
            rx="28"
            ry="22"
            fill={energy.cyan}
            filter={`url(#${fGlow})`}
            opacity={0.35}
            animate={
              live ? { cx: [74, 86, 74], opacity: [0.28, 0.42, 0.28] } : { opacity: 0.32 }
            }
            transition={live ? { duration: 5.6, repeat: Infinity, ease: 'easeInOut' } : undefined}
          />
          <motion.ellipse
            cx="128"
            cy="120"
            rx="22"
            ry="18"
            fill={energy.accent}
            filter={`url(#${fGlow})`}
            opacity={0.3}
            animate={
              live ? { cy: [118, 108, 118], opacity: [0.22, 0.38, 0.22] } : { opacity: 0.28 }
            }
            transition={live ? { duration: 6.2, repeat: Infinity, ease: 'easeInOut' } : undefined}
          />
          <path
            d={coreD}
            fill="#FFFFFF"
            filter={`url(#${fGrain})`}
            opacity={0.35}
            style={{ mixBlendMode: 'soft-light' }}
          />
        </motion.g>

        <motion.path
          d={shellD}
          fill={`url(#${gShell})`}
          filter={`url(#${fShell})`}
          opacity={0.68}
          animate={live ? { d: [shellD, shellBreath, shellD] } : { d: shellD }}
          transition={
            live ? { duration: 5.2, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.55 }
          }
        />
        <motion.path
          d={shellD}
          fill={`url(#${gMilk})`}
          opacity={0.42}
          mask={`url(#${maskShell})`}
          animate={live ? { opacity: [0.36, 0.48, 0.36] } : { opacity: 0.4 }}
          transition={live ? { duration: 4.6, repeat: Infinity, ease: 'easeInOut' } : undefined}
        />
        <path
          d="M55 50C72 28 118 24 145 48C132 42 100 44 78 58C64 68 56 78 55 50Z"
          fill="#FFFFFF"
          opacity={0.38}
          filter={`url(#${fShell})`}
        />

        <motion.path
          d="M62 58C78 36 118 32 142 48"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeOpacity="0.55"
          filter={`url(#${fShell})`}
          style={{ x: highlightX }}
        />
        <motion.path
          d="M70 68C82 54 108 50 126 58"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeOpacity="0.35"
          style={{ x: highlightX }}
        />
        <motion.path
          d="M78 66C88 58 106 60 112 72C106 76 92 78 82 74C74 70 74 68 78 66Z"
          fill="#FFFFFF"
          opacity={0.42}
          filter={`url(#${fShell})`}
          style={{ x: highlightX }}
        />

        {mood === 'focused' && live && expression === 'thinking' && (
          <motion.circle
            r="2.2"
            fill="#FFFFFF"
            initial={{ cx: 80, cy: 118, opacity: 0 }}
            animate={{
              cx: [80, 100, 116],
              cy: [118, 104, 120],
              opacity: [0, 0.7, 0],
            }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1 }}
          />
        )}

        <motion.g style={{ scale: typeof faceScale === 'number' ? faceScale : faceScale }}>
          <NasouhFace
            expression={expression}
            showSoundWaves={showWaves && live}
            showProcessDots={showProcess && live}
            showInsightMark={showInsight && live}
            reducedMotion={reduced}
            glowFilterId={fFace}
            facePlateColor={energy.faceField}
            faceFieldGradientId={gFace}
          />
        </motion.g>
      </motion.svg>
    </motion.div>
  )
}
