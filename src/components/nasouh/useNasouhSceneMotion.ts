import { useCallback, useEffect, useRef } from 'react'
import {
  animate,
  useMotionValue,
  useMotionValueEvent,
  type MotionValue,
} from 'motion/react'
import {
  COMPANION_PEAK,
  DESIGN_HEIGHT,
  DESIGN_WIDTH,
  SCENE_POSES,
  clamp,
  poseAtFractional,
  scalePoseToStage,
  type NasouhScenePose,
} from './scenePoses'

export interface SceneMotionApi {
  x: MotionValue<number>
  y: MotionValue<number>
  scale: MotionValue<number>
  rotate: MotionValue<number>
  shellScaleX: MotionValue<number>
  shellScaleY: MotionValue<number>
  glowScale: MotionValue<number>
  shadowScale: MotionValue<number>
  shadowOpacity: MotionValue<number>
  layerOffsetX: MotionValue<number>
  layerOffsetY: MotionValue<number>
  faceScale: MotionValue<number>
  /** Fractional slide index driven by Swiper (0 .. n-1) */
  dragProgress: MotionValue<number>
  /** Physical swipe sign: -1 left, +1 right */
  physicalSign: MotionValue<number>
  applyPose: (pose: NasouhScenePose, immediate?: boolean) => void
  setFromFractional: (fractional: number, curved?: boolean) => void
  settleToIndex: (index: number, opts?: { companionApproach?: boolean; reduced?: boolean }) => Promise<void>
  anticipate: (towardIndex: number, reduced?: boolean) => Promise<void>
  pulseSquash: () => void
  measureStage: (el: HTMLElement | null) => void
  stageSize: { w: number; h: number }
}

export function useNasouhSceneMotion(reducedMotion: boolean): SceneMotionApi {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const scale = useMotionValue(0.78)
  const rotate = useMotionValue(-2)
  const shellScaleX = useMotionValue(1)
  const shellScaleY = useMotionValue(1.03)
  const glowScale = useMotionValue(1)
  const shadowScale = useMotionValue(0.9)
  const shadowOpacity = useMotionValue(0.2)
  const layerOffsetX = useMotionValue(-3)
  const layerOffsetY = useMotionValue(2)
  const faceScale = useMotionValue(1)
  const dragProgress = useMotionValue(0)
  const physicalSign = useMotionValue(0)

  const stageRef = useRef({ w: DESIGN_WIDTH, h: DESIGN_HEIGHT })
  const draggingRef = useRef(false)
  const settlingRef = useRef(false)

  const applyPose = useCallback(
    (pose: NasouhScenePose, immediate = true) => {
      const run = (mv: MotionValue<number>, v: number) => {
        if (immediate || reducedMotion) mv.set(v)
        else void animate(mv, v, { type: 'spring', stiffness: 280, damping: 28 })
      }
      run(x, pose.x)
      run(y, pose.y)
      run(scale, pose.scale)
      run(rotate, pose.rotate)
      run(shellScaleX, pose.shellScaleX)
      run(shellScaleY, pose.shellScaleY)
      run(glowScale, pose.glowScale)
      run(shadowScale, pose.shadowScale)
      run(shadowOpacity, pose.shadowOpacity)
      run(layerOffsetX, pose.layerOffsetX)
      run(layerOffsetY, pose.layerOffsetY)
      run(faceScale, pose.faceScale)
    },
    [
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
      reducedMotion,
    ],
  )

  const setFromFractional = useCallback(
    (fractional: number, curved = true) => {
      if (settlingRef.current && !draggingRef.current) return
      const pose = poseAtFractional(
        fractional,
        stageRef.current.w,
        stageRef.current.h,
        curved && !reducedMotion,
      )
      x.set(pose.x)
      y.set(pose.y)
      scale.set(pose.scale)
      rotate.set(pose.rotate)
      shellScaleX.set(pose.shellScaleX)
      shellScaleY.set(pose.shellScaleY)
      glowScale.set(pose.glowScale)
      shadowScale.set(pose.shadowScale)
      shadowOpacity.set(pose.shadowOpacity)
      layerOffsetX.set(pose.layerOffsetX)
      layerOffsetY.set(pose.layerOffsetY)
      faceScale.set(pose.faceScale)
    },
    [
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
      reducedMotion,
    ],
  )

  useMotionValueEvent(dragProgress, 'change', (p) => {
    if (!draggingRef.current) return
    setFromFractional(p, true)
  })

  const anticipate = useCallback(
    async (towardIndex: number, reduced = false) => {
      if (reduced || reducedMotion) return
      const current = scalePoseToStage(
        SCENE_POSES[clamp(towardIndex, 0, SCENE_POSES.length - 1)],
        stageRef.current.w,
        stageRef.current.h,
      )
      const curScale = scale.get()
      await animate(scale, curScale * 0.97, { duration: 0.1 })
      await animate(layerOffsetX, layerOffsetX.get() + 2, { duration: 0.1 })
      void current
    },
    [scale, layerOffsetX, reducedMotion],
  )

  const settleToIndex = useCallback(
    async (
      index: number,
      opts?: { companionApproach?: boolean; reduced?: boolean },
    ) => {
      settlingRef.current = true
      draggingRef.current = false
      const target = scalePoseToStage(
        SCENE_POSES[clamp(index, 0, SCENE_POSES.length - 1)],
        stageRef.current.w,
        stageRef.current.h,
      )
      const reduced = opts?.reduced || reducedMotion
      const spring = { type: 'spring' as const, stiffness: reduced ? 400 : 260, damping: reduced ? 40 : 24 }

      if (reduced) {
        applyPose(target, true)
        settlingRef.current = false
        return
      }

      // Companion approach overshoot
      if (opts?.companionApproach && index === SCENE_POSES.length - 1) {
        const peakY = COMPANION_PEAK.y * (stageRef.current.h / DESIGN_HEIGHT)
        await Promise.all([
          animate(scale, COMPANION_PEAK.scale, { duration: 0.28, ease: [0.22, 0.9, 0.28, 1] }),
          animate(y, peakY, { duration: 0.28, ease: [0.22, 0.9, 0.28, 1] }),
        ])
      }

      // Courses squash on arrival
      // Soft landing squash on listening slide (index 4)
      if (index === 4) {
        await Promise.all([
          animate(y, target.y + 4, { duration: 0.22 }),
          animate(shellScaleX, 1.1, { duration: 0.18 }),
          animate(shellScaleY, 0.94, { duration: 0.18 }),
          animate(scale, target.scale * 1.02, { duration: 0.22 }),
        ])
        await Promise.all([
          animate(y, target.y - 10, { type: 'spring', stiffness: 320, damping: 18 }),
          animate(shellScaleX, target.shellScaleX, spring),
          animate(shellScaleY, target.shellScaleY, spring),
        ])
      }

      await Promise.all([
        animate(x, target.x, spring),
        animate(y, target.y, spring),
        animate(scale, target.scale, spring),
        animate(rotate, target.rotate, spring),
        animate(shellScaleX, target.shellScaleX, spring),
        animate(shellScaleY, target.shellScaleY, spring),
        animate(glowScale, target.glowScale, spring),
        animate(shadowScale, target.shadowScale, spring),
        animate(shadowOpacity, target.shadowOpacity, spring),
        animate(layerOffsetX, target.layerOffsetX, {
          type: 'spring',
          stiffness: 200,
          damping: 22,
          delay: 0.05,
        }),
        animate(layerOffsetY, target.layerOffsetY, {
          type: 'spring',
          stiffness: 200,
          damping: 22,
          delay: 0.05,
        }),
        animate(faceScale, target.faceScale, spring),
      ])

      settlingRef.current = false
    },
    [
      applyPose,
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
      reducedMotion,
    ],
  )

  const pulseSquash = useCallback(() => {
    if (reducedMotion) return
    const s = scale.get()
    void animate(scale, s * 0.98, { duration: 0.08 }).then(() =>
      animate(scale, s, { type: 'spring', stiffness: 400, damping: 22 }),
    )
  }, [scale, reducedMotion])

  const measureStage = useCallback((el: HTMLElement | null) => {
    if (!el) return
    const r = el.getBoundingClientRect()
    if (r.width > 0 && r.height > 0) {
      stageRef.current = { w: r.width, h: r.height }
    }
  }, [])

  // Expose dragging flag via dragProgress side channel — set by stage
  useEffect(() => {
    ;(dragProgress as MotionValue<number> & { __setDragging?: (v: boolean) => void }).__setDragging =
      (v: boolean) => {
        draggingRef.current = v
      }
  }, [dragProgress])

  return {
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
    dragProgress,
    physicalSign,
    applyPose,
    setFromFractional,
    settleToIndex,
    anticipate,
    pulseSquash,
    measureStage,
    stageSize: stageRef.current,
  }
}

export function setSceneDragging(dragProgress: MotionValue<number>, dragging: boolean) {
  const flag = (dragProgress as MotionValue<number> & { __setDragging?: (v: boolean) => void })
    .__setDragging
  flag?.(dragging)
}
