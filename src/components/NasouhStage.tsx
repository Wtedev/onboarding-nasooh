import { useEffect, useRef, useState } from 'react'
import { animate, motion, useMotionValue } from 'motion/react'
import { slides } from '../data/slides'
import type { FaceExpression, NasouhMood, TransitionDirection } from '../types/onboarding'
import { FloatingElements } from './FloatingElements'
import { NasouhCharacter } from './NasouhCharacter'
import { SCENE_POSES, SLIDE_MOODS, scalePoseToStage } from './nasouh/scenePoses'
import {
  setSceneDragging,
  type SceneMotionApi,
} from './nasouh/useNasouhSceneMotion'

interface NasouhStageProps {
  motionApi: SceneMotionApi
  activeIndex: number
  previousIndex: number
  direction: TransitionDirection
  visualSign: number
  glowPulse: number
  isDragging: boolean
  transitionProgress: number
  reducedMotion: boolean
  floatsEnterKey: number
  isRtl?: boolean
  scenePhase?: string
}

/**
 * Single persistent Nasouh + floats — never remounted across slides.
 */
export function NasouhStage({
  motionApi,
  activeIndex,
  previousIndex,
  direction,
  visualSign,
  glowPulse,
  isDragging,
  transitionProgress,
  reducedMotion,
  floatsEnterKey,
  isRtl = true,
  scenePhase,
}: NasouhStageProps) {
  const stageRef = useRef<HTMLDivElement>(null)
  const introDone = useRef(false)
  const [mood, setMood] = useState<NasouhMood>(SLIDE_MOODS[0])
  const [floatVariant, setFloatVariant] = useState(slides[0].floating)
  const [floatsActive, setFloatsActive] = useState(false)
  const [expressionOverride, setExpressionOverride] = useState<FaceExpression | undefined>()
  const auraOpacity = useMotionValue(0)
  const bodyOpacity = useMotionValue(0)

  const {
    x,
    y,
    scale,
    rotate,
    shellScaleX,
    shellScaleY,
    glowScale,
    shadowScale,
    shadowOpacity,
    layerOffsetX,
    layerOffsetY,
    faceScale,
    measureStage,
    applyPose,
    settleToIndex,
  } = motionApi

  useEffect(() => {
    const el = stageRef.current
    measureStage(el)
    if (!el) return
    const ro = new ResizeObserver(() => measureStage(el))
    ro.observe(el)
    return () => ro.disconnect()
  }, [measureStage])

  useEffect(() => {
    setSceneDragging(motionApi.dragProgress, isDragging)
  }, [isDragging, motionApi.dragProgress])

  useEffect(() => {
    if (introDone.current) return
    introDone.current = true
    const el = stageRef.current
    measureStage(el)
    const target = scalePoseToStage(
      SCENE_POSES[0],
      el?.clientWidth || 390,
      el?.clientHeight || 620,
    )

    if (reducedMotion) {
      applyPose(target, true)
      auraOpacity.set(1)
      bodyOpacity.set(1)
      return
    }

    applyPose({ ...target, y: target.y - 24, scale: 0.7 }, true)
    auraOpacity.set(0)
    bodyOpacity.set(0)

    const timers: number[] = []
    timers.push(window.setTimeout(() => void animate(auraOpacity, 1, { duration: 0.35 }), 40))
    timers.push(
      window.setTimeout(() => {
        void animate(bodyOpacity, 1, { duration: 0.4 })
      }, 160),
    )
    timers.push(window.setTimeout(() => void settleToIndex(0, { reduced: false }), 400))
    return () => timers.forEach((id) => window.clearTimeout(id))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (isDragging) {
      const from = previousIndex
      const toward =
        transitionProgress > previousIndex
          ? Math.min(previousIndex + 1, slides.length - 1)
          : Math.max(previousIndex - 1, 0)
      const localT = Math.abs(transitionProgress - from)
      setMood(SLIDE_MOODS[localT >= 0.55 ? toward : from])
      return
    }
    setMood(SLIDE_MOODS[activeIndex])
  }, [activeIndex, previousIndex, isDragging, transitionProgress])

  useEffect(() => {
    if (isDragging) {
      setFloatsActive(false)
      return
    }
    const variant = slides[activeIndex].floating
    setFloatVariant(variant)
    if (variant === 'none') {
      setFloatsActive(false)
      return
    }
    const id = window.setTimeout(() => setFloatsActive(true), reducedMotion ? 40 : 280)
    return () => window.clearTimeout(id)
  }, [activeIndex, isDragging, reducedMotion, floatsEnterKey])

  // Scene-phase expressions (hesitant / containment / rules)
  useEffect(() => {
    if (isDragging) return
    const phase = scenePhase ?? ''

    if (activeIndex === 1) {
      if (phase === 'typing' || phase === 'expand') setExpressionOverride('curious')
      else if (phase === 'listening') setExpressionOverride('listening')
      else if (phase === 'silence' || phase === 'done') setExpressionOverride('caring')
      else setExpressionOverride('curious')
      return
    }

    if (activeIndex === 2) {
      if (phase === 'reply' || phase === 'done') {
        setMood('caring')
        setExpressionOverride('caring')
        if (!reducedMotion) {
          const base = scale.get()
          void animate(scale, base * 1.05, { type: 'spring', stiffness: 260, damping: 20 })
        }
      } else setExpressionOverride('curious')
      return
    }

    if (activeIndex === 4) {
      setExpressionOverride('listening')
      return
    }

    if (activeIndex === 6 && phase.startsWith('rule')) {
      setExpressionOverride(phase === 'rule-2' ? 'happy' : 'curious')
      return
    }

    if (activeIndex === 7) {
      setExpressionOverride('caring')
      return
    }

    setExpressionOverride(undefined)
  }, [activeIndex, scenePhase, isDragging, reducedMotion, scale])

  // RTL flip for side-biased poses (feelings, hesitant, listening)
  useEffect(() => {
    if (isDragging) return
    if (![0, 1, 4].includes(activeIndex)) return
    const target = scalePoseToStage(
      SCENE_POSES[activeIndex],
      stageRef.current?.clientWidth || 390,
      stageRef.current?.clientHeight || 620,
    )
    const flipped = isRtl ? { ...target, x: -target.x, rotate: -target.rotate } : target
    applyPose(flipped, false)
  }, [activeIndex, isRtl, isDragging, applyPose])

  const handleTap = () => {
    if (isDragging || direction !== 'idle') return
    setExpressionOverride('blinking')
    window.setTimeout(() => setExpressionOverride('happy'), 120)
    window.setTimeout(() => setExpressionOverride(undefined), 520)
  }

  const floatOpacity =
    isDragging && Math.abs(transitionProgress - activeIndex) > 0.15 ? 0.35 : 1

  const bandClass =
    activeIndex === 0
      ? 'absolute inset-x-0 top-[24%] flex h-[40%] items-start justify-center'
      : activeIndex === 1 || activeIndex === 2
        ? 'absolute inset-x-0 top-[10%] flex h-[42%] items-center justify-center'
        : activeIndex === 3
          ? 'absolute inset-x-0 top-[28%] flex h-[36%] items-center justify-center'
          : activeIndex === 6
            ? 'absolute inset-x-0 top-[52%] flex h-[28%] items-center justify-center'
            : activeIndex === 7
              ? 'absolute inset-x-0 top-[8%] flex h-[48%] items-end justify-center'
              : 'absolute inset-x-0 top-[12%] flex h-[44%] items-center justify-center'

  return (
    <div
      ref={stageRef}
      className="pointer-events-none absolute inset-x-0 top-0 bottom-0 z-[5] overflow-visible"
      aria-hidden="false"
    >
      <div className={bandClass}>
        <motion.div
          className="relative flex items-center justify-center"
          style={{ x, y, scale, rotate, opacity: bodyOpacity }}
        >
          <motion.div className="absolute inset-0" style={{ opacity: auraOpacity }} />
          {floatVariant !== 'none' && (
            <div
              className="relative flex items-center justify-center"
              style={{ opacity: floatOpacity, transition: 'opacity 180ms ease' }}
            >
              <FloatingElements
                variant={floatVariant}
                active={floatsActive && !isDragging}
                enterKey={floatsEnterKey}
              />
            </div>
          )}
          <div className="pointer-events-auto relative">
            <NasouhCharacter
              mood={mood}
              isActive
              direction={isDragging ? 'idle' : direction}
              visualSign={visualSign}
              glowPulse={glowPulse}
              reducedMotion={reducedMotion}
              expressionOverride={expressionOverride}
              shellScaleX={shellScaleX}
              shellScaleY={shellScaleY}
              layerOffsetX={layerOffsetX}
              layerOffsetY={layerOffsetY}
              glowScale={glowScale}
              shadowScale={shadowScale}
              shadowOpacity={shadowOpacity}
              faceScale={faceScale}
              idlePaused={isDragging}
              onTap={handleTap}
            />
          </div>
        </motion.div>
      </div>
    </div>
  )
}
