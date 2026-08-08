import type { NasouhMood } from '../../types/onboarding'

/** Scene pose — design units at 390× content-band ~620, scaled at runtime */
export interface NasouhScenePose {
  x: number
  y: number
  scale: number
  rotate: number
  shellScaleX: number
  shellScaleY: number
  glowScale: number
  shadowScale: number
  shadowOpacity: number
  layerOffsetX: number
  layerOffsetY: number
  faceScale: number
}

export const DESIGN_WIDTH = 390
export const DESIGN_HEIGHT = 620

export const SCENE_POSES: NasouhScenePose[] = [
  // 0 — Falling feelings
  {
    x: 88,
    y: 8,
    scale: 0.76,
    rotate: 4,
    shellScaleX: 1.02,
    shellScaleY: 1.04,
    glowScale: 0.84,
    shadowScale: 0.7,
    shadowOpacity: 0.14,
    layerOffsetX: -2,
    layerOffsetY: 2,
    faceScale: 1.02,
  },
  // 1 — Hesitant writing
  {
    x: -48,
    y: 18,
    scale: 0.94,
    rotate: -2,
    shellScaleX: 1.04,
    shellScaleY: 0.98,
    glowScale: 1,
    shadowScale: 0.9,
    shadowOpacity: 0.18,
    layerOffsetX: 4,
    layerOffsetY: 2,
    faceScale: 1,
  },
  // 2 — Containment
  {
    x: -36,
    y: -8,
    scale: 1.08,
    rotate: -1,
    shellScaleX: 1.06,
    shellScaleY: 1.02,
    glowScale: 1.16,
    shadowScale: 1.05,
    shadowOpacity: 0.22,
    layerOffsetX: 3,
    layerOffsetY: 2,
    faceScale: 0.98,
  },
  // 3 — Similar feelings constellation
  {
    x: 12,
    y: 28,
    scale: 0.66,
    rotate: 2,
    shellScaleX: 0.96,
    shellScaleY: 1.02,
    glowScale: 0.78,
    shadowScale: 0.62,
    shadowOpacity: 0.12,
    layerOffsetX: -2,
    layerOffsetY: 1,
    faceScale: 1.04,
  },
  // 4 — Listening waves
  {
    x: 56,
    y: 22,
    scale: 0.86,
    rotate: 3,
    shellScaleX: 1.1,
    shellScaleY: 0.96,
    glowScale: 1.02,
    shadowScale: 0.88,
    shadowOpacity: 0.16,
    layerOffsetX: 5,
    layerOffsetY: 3,
    faceScale: 1,
  },
  // 5 — Anonymous
  {
    x: 0,
    y: -42,
    scale: 0.76,
    rotate: 0,
    shellScaleX: 1,
    shellScaleY: 1.04,
    glowScale: 0.88,
    shadowScale: 0.72,
    shadowOpacity: 0.14,
    layerOffsetX: 0,
    layerOffsetY: -2,
    faceScale: 1.02,
  },
  // 6 — Rules
  {
    x: 0,
    y: 48,
    scale: 0.74,
    rotate: 0,
    shellScaleX: 1.02,
    shellScaleY: 1.02,
    glowScale: 0.92,
    shadowScale: 0.78,
    shadowOpacity: 0.16,
    layerOffsetX: 0,
    layerOffsetY: 2,
    faceScale: 1,
  },
  // 7 — Finale
  {
    x: 0,
    y: 12,
    scale: 1.08,
    rotate: 0,
    shellScaleX: 1.04,
    shellScaleY: 1.02,
    glowScale: 1.18,
    shadowScale: 1.12,
    shadowOpacity: 0.22,
    layerOffsetX: 0,
    layerOffsetY: 3,
    faceScale: 0.96,
  },
]

export const SLIDE_MOODS: NasouhMood[] = [
  'curious',
  'calm',
  'caring',
  'curious',
  'calm',
  'focused',
  'caring',
  'caring',
]

export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

export function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

export function lerpPose(
  a: NasouhScenePose,
  b: NasouhScenePose,
  t: number,
): NasouhScenePose {
  return {
    x: lerp(a.x, b.x, t),
    y: lerp(a.y, b.y, t),
    scale: lerp(a.scale, b.scale, t),
    rotate: lerp(a.rotate, b.rotate, t),
    shellScaleX: lerp(a.shellScaleX, b.shellScaleX, t),
    shellScaleY: lerp(a.shellScaleY, b.shellScaleY, t),
    glowScale: lerp(a.glowScale, b.glowScale, t),
    shadowScale: lerp(a.shadowScale, b.shadowScale, t),
    shadowOpacity: lerp(a.shadowOpacity, b.shadowOpacity, t),
    layerOffsetX: lerp(a.layerOffsetX, b.layerOffsetX, t),
    layerOffsetY: lerp(a.layerOffsetY, b.layerOffsetY, t),
    faceScale: lerp(a.faceScale, b.faceScale, t),
  }
}

export function arcPose(
  a: NasouhScenePose,
  b: NasouhScenePose,
  t: number,
): NasouhScenePose {
  const base = lerpPose(a, b, t)
  const dy = b.y - a.y
  const arcAmp = clamp(Math.abs(dy) * 0.22 + 6, 4, 12)
  const arc = Math.sin(t * Math.PI) * (dy >= 0 ? -arcAmp : arcAmp)
  const stretch = 1 + Math.sin(t * Math.PI) * 0.025
  return {
    ...base,
    y: base.y + arc,
    scale: base.scale * stretch,
    shellScaleX: base.shellScaleX * (dy !== 0 ? 1 + Math.sin(t * Math.PI) * 0.02 : 1),
    shellScaleY: base.shellScaleY * (dy !== 0 ? 1 - Math.sin(t * Math.PI) * 0.015 : 1),
  }
}

export function scalePoseToStage(
  pose: NasouhScenePose,
  stageW: number,
  stageH: number,
): NasouhScenePose {
  const sx = stageW / DESIGN_WIDTH
  const sy = stageH / DESIGN_HEIGHT
  return {
    ...pose,
    x: pose.x * sx,
    y: pose.y * sy,
  }
}

export function poseAtFractional(
  fractional: number,
  stageW: number,
  stageH: number,
  curved = true,
): NasouhScenePose {
  const max = SCENE_POSES.length - 1
  const f = clamp(fractional, 0, max)
  const i0 = Math.floor(f)
  const i1 = Math.min(i0 + 1, max)
  const t = f - i0
  const a = scalePoseToStage(SCENE_POSES[i0], stageW, stageH)
  const b = scalePoseToStage(SCENE_POSES[i1], stageW, stageH)
  if (i0 === i1) return a
  return curved ? arcPose(a, b, t) : lerpPose(a, b, t)
}

export const COMPANION_PEAK: Pick<NasouhScenePose, 'scale' | 'y'> = {
  scale: 1.2,
  y: 18,
}
