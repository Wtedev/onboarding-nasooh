import type { FaceExpression, NasouhMood } from '../../types/onboarding'

export type EyeShape =
  | { kind: 'oval'; rx: number; ry: number; ox?: number; oy?: number }
  | { kind: 'arc'; d: string; width?: number }
  | { kind: 'line'; x1: number; y1: number; x2: number; y2: number; width?: number }
  | { kind: 'dot'; r: number; ox?: number; oy?: number }

export type MouthShape =
  | { kind: 'none' }
  | { kind: 'line'; x1: number; y1: number; x2: number; y2: number; width?: number }
  | { kind: 'arc'; d: string; width?: number }
  | { kind: 'dot'; cx: number; cy: number; r: number }
  | { kind: 'wave'; d: string; width?: number }

export interface FaceLayout {
  left: EyeShape
  right: EyeShape
  mouth: MouthShape
  offsetX: number
  offsetY: number
  tilt: number
  glow: number
}

const L = -13
const R = 13
const EY = -4

export const FACE_LAYOUTS: Record<FaceExpression, FaceLayout> = {
  neutral: {
    left: { kind: 'oval', rx: 4, ry: 9, ox: L, oy: EY },
    right: { kind: 'oval', rx: 4, ry: 9, ox: R, oy: EY },
    mouth: { kind: 'none' },
    offsetX: 0,
    offsetY: 0,
    tilt: 0,
    glow: 0.3,
  },
  curious: {
    left: { kind: 'oval', rx: 4.4, ry: 9.8, ox: L - 1, oy: EY - 3 },
    right: { kind: 'oval', rx: 2.8, ry: 5.8, ox: R + 3, oy: EY + 1 },
    mouth: { kind: 'dot', cx: 3, cy: 13, r: 2.6 },
    offsetX: 3,
    offsetY: -2,
    tilt: -8,
    glow: 0.35,
  },
  listening: {
    left: { kind: 'line', x1: L - 1, y1: EY - 8, x2: L - 1, y2: EY + 8, width: 5.5 },
    right: { kind: 'line', x1: R - 2, y1: EY - 8, x2: R - 2, y2: EY + 8, width: 5.5 },
    mouth: { kind: 'line', x1: -9, y1: 12, x2: 8, y2: 13, width: 4.5 },
    offsetX: -5,
    offsetY: 0,
    tilt: -5,
    glow: 0.32,
  },
  thinking: {
    left: { kind: 'oval', rx: 3.6, ry: 7.8, ox: L + 2, oy: EY - 5 },
    right: { kind: 'oval', rx: 3.2, ry: 5.8, ox: R + 3, oy: EY - 1 },
    mouth: {
      kind: 'wave',
      d: 'M-12 13 Q-5 10.5 0 13.5 Q5 16 12 12.5',
      width: 3.6,
    },
    offsetX: 4,
    offsetY: -3,
    tilt: 5,
    glow: 0.28,
  },
  happy: {
    left: { kind: 'oval', rx: 4.2, ry: 9.2, ox: L, oy: EY - 1 },
    right: { kind: 'oval', rx: 4.2, ry: 9.2, ox: R, oy: EY - 1 },
    mouth: { kind: 'arc', d: 'M-12.5 11 Q0 20 12.5 11', width: 5.2 },
    offsetX: 0,
    offsetY: 0,
    tilt: 0,
    glow: 0.35,
  },
  laughing: {
    left: {
      kind: 'arc',
      d: `M${L - 6} ${EY + 2} Q${L} ${EY - 7} ${L + 6} ${EY + 2}`,
      width: 6,
    },
    right: {
      kind: 'arc',
      d: `M${R - 6} ${EY + 2} Q${R} ${EY - 7} ${R + 6} ${EY + 2}`,
      width: 6,
    },
    mouth: { kind: 'arc', d: 'M-16 10 Q0 24 16 10', width: 5.8 },
    offsetX: 0,
    offsetY: -3,
    tilt: 0,
    glow: 0.4,
  },
  caring: {
    left: { kind: 'line', x1: L + 2, y1: EY - 5.6, x2: L + 2, y2: EY + 5.6, width: 5.8 },
    right: { kind: 'line', x1: R - 2, y1: EY - 5.6, x2: R - 2, y2: EY + 5.6, width: 5.8 },
    mouth: { kind: 'arc', d: 'M-8 12 Q0 16 8 12', width: 4.2 },
    offsetX: 0,
    offsetY: 1,
    tilt: 2,
    glow: 0.38,
  },
  concerned: {
    left: { kind: 'oval', rx: 3.8, ry: 8.2, ox: L + 2.5, oy: EY },
    right: { kind: 'oval', rx: 3.8, ry: 8.2, ox: R - 2.5, oy: EY },
    mouth: { kind: 'arc', d: 'M-10 14.5 Q0 12.5 10 14.5', width: 4.2 },
    offsetX: 0,
    offsetY: 1,
    tilt: 0,
    glow: 0.28,
  },
  blinking: {
    left: { kind: 'line', x1: L - 5, y1: EY, x2: L + 5, y2: EY, width: 5.5 },
    right: { kind: 'line', x1: R - 5, y1: EY, x2: R + 5, y2: EY, width: 5.5 },
    mouth: { kind: 'none' },
    offsetX: 0,
    offsetY: 0,
    tilt: 0,
    glow: 0.22,
  },
  processing: {
    left: { kind: 'dot', r: 3.8, ox: L, oy: EY },
    right: { kind: 'dot', r: 3.8, ox: R, oy: EY },
    mouth: { kind: 'none' },
    offsetX: 0,
    offsetY: 0,
    tilt: 0,
    glow: 0.32,
  },
}

export const MOOD_BASE_FACE: Record<NasouhMood, FaceExpression> = {
  curious: 'curious',
  calm: 'listening',
  focused: 'thinking',
  excited: 'happy',
  caring: 'caring',
}

/**
 * Soft Pastel Glassmorphism — organic squircle silhouettes.
 * Never perfect circles; slight asymmetry + mood stretch.
 */
export const SHELL_PATHS: Record<NasouhMood, string> = {
  curious:
    'M58 48C74 26 126 22 154 46C180 68 186 122 160 152C134 180 76 178 50 148C28 122 34 76 58 48Z',
  calm:
    'M48 56C72 30 134 26 166 54C192 78 190 132 158 158C128 182 70 176 46 144C28 120 28 86 48 56Z',
  focused:
    'M62 40C80 20 128 18 152 42C176 66 178 128 150 160C124 188 72 184 48 150C30 122 38 66 62 40Z',
  excited:
    'M56 42C78 20 134 18 160 46C184 70 182 130 152 160C124 186 68 180 46 146C28 118 32 70 56 42Z',
  caring:
    'M52 52C74 28 132 24 162 52C186 74 184 132 154 160C124 184 68 178 46 146C30 122 32 80 52 52Z',
}

export const SHELL_BREATH: Record<NasouhMood, string> = {
  curious:
    'M56 46C74 24 128 20 156 44C182 66 188 124 162 154C136 182 74 180 48 150C26 124 32 74 56 46Z',
  calm:
    'M46 54C72 28 136 24 168 52C194 76 192 134 160 160C130 184 68 178 44 146C26 122 26 84 46 54Z',
  focused:
    'M60 38C80 18 130 16 154 40C178 64 180 130 152 162C126 190 70 186 46 152C28 124 36 64 60 38Z',
  excited:
    'M54 40C78 18 136 16 162 44C186 68 184 132 154 162C126 188 66 182 44 148C26 120 30 68 54 40Z',
  caring:
    'M50 50C74 26 134 22 164 50C188 72 186 134 156 162C126 186 66 180 44 148C28 124 30 78 50 50Z',
}

/** Internal luminous color body — denser, sits inside frosted shell */
export const CORE_PATHS: Record<NasouhMood, string> = {
  curious:
    'M72 62C88 44 128 42 148 62C168 82 168 124 146 144C124 162 82 160 64 138C50 120 54 84 72 62Z',
  calm:
    'M64 68C86 48 136 46 158 70C176 90 172 128 148 146C124 162 78 158 60 136C48 120 48 90 64 68Z',
  focused:
    'M76 54C92 38 128 38 146 58C164 78 164 128 142 150C122 168 80 164 64 140C52 122 56 74 76 54Z',
  excited:
    'M70 56C90 38 134 38 154 62C172 82 168 130 144 150C122 168 76 162 58 138C46 120 50 78 70 56Z',
  caring:
    'M68 64C88 46 132 44 152 66C170 86 166 128 144 148C122 166 78 162 60 140C48 122 50 86 68 64Z',
}

export const CORE_BREATH: Record<NasouhMood, string> = {
  curious:
    'M70 60C88 42 130 40 150 60C170 80 170 126 148 146C126 164 80 162 62 140C48 122 52 82 70 60Z',
  calm:
    'M62 66C86 46 138 44 160 68C178 88 174 130 150 148C126 164 76 160 58 138C46 122 46 88 62 66Z',
  focused:
    'M74 52C92 36 130 36 148 56C166 76 166 130 144 152C124 170 78 166 62 142C50 124 54 72 74 52Z',
  excited:
    'M68 54C90 36 136 36 156 60C174 80 170 132 146 152C124 170 74 164 56 140C44 122 48 76 68 54Z',
  caring:
    'M66 62C88 44 134 42 154 64C172 84 168 130 146 150C124 168 76 164 58 142C46 124 48 84 66 62Z',
}

/** Secondary glass layer — offset behind / beside main body */
export const SECONDARY_PATHS: Record<NasouhMood, string> = {
  curious:
    'M108 58C128 44 158 54 166 78C174 102 160 128 136 136C112 144 90 128 88 104C86 82 92 70 108 58Z',
  calm:
    'M42 78C58 58 92 56 108 76C122 94 116 126 92 138C70 148 46 136 38 114C32 96 30 96 42 78Z',
  focused:
    'M118 48C138 36 164 50 168 76C172 102 154 130 128 138C106 144 88 126 90 100C92 78 100 58 118 48Z',
  excited:
    'M98 44C120 30 152 42 160 68C168 94 152 124 126 132C102 140 78 122 76 96C74 74 80 56 98 44Z',
  caring:
    'M44 72C60 52 96 50 114 72C128 90 122 124 96 136C74 146 48 134 40 112C34 94 32 90 44 72Z',
}

export interface EnergyPalette {
  cyan: string
  sky: string
  mid: string
  violet: string
  deep: string
  accent: string
  milk: string
  shadow: string
  faceField: string
  density: number
  coreX: number
  coreY: number
  secondaryX: number
  secondaryY: number
}

/** Soft Pastel Glass palettes per slide mood — same entity, tint shifts */
export const MOOD_ENERGY: Record<NasouhMood, EnergyPalette> = {
  // Slide 1 — Cyan → Periwinkle → Violet
  curious: {
    cyan: '#63D9F4',
    sky: '#71C8F6',
    mid: '#738DF4',
    violet: '#7655F6',
    deep: '#6338F1',
    accent: '#63D9F4',
    milk: 'rgba(247,250,255,0.62)',
    shadow: 'rgba(115,141,244,0.28)',
    faceField: '#7A8FF0',
    density: 0.88,
    coreX: -2,
    coreY: -1,
    secondaryX: 10,
    secondaryY: 6,
  },
  // Slide 2 — Periwinkle → Cyan + Lavender
  calm: {
    cyan: '#71C8F6',
    sky: '#63D9F4',
    mid: '#8A9CF5',
    violet: '#9B8AF8',
    deep: '#738DF4',
    accent: '#FF86B7',
    milk: 'rgba(247,250,255,0.58)',
    shadow: 'rgba(113,200,246,0.26)',
    faceField: '#7EB4F0',
    density: 0.84,
    coreX: -5,
    coreY: 1,
    secondaryX: -12,
    secondaryY: 4,
  },
  // Slide 3 — Mint/Cyan → Periwinkle + limited Violet
  focused: {
    cyan: '#63DA6A',
    sky: '#63D9F4',
    mid: '#738DF4',
    violet: '#7655F6',
    deep: '#5B6FE8',
    accent: '#8BEA70',
    milk: 'rgba(247,250,255,0.6)',
    shadow: 'rgba(99,217,244,0.24)',
    faceField: '#6E9AE8',
    density: 0.9,
    coreX: 2,
    coreY: -3,
    secondaryX: 12,
    secondaryY: -3,
  },
  // Slide 4 — Pink → Coral → Violet + light Cyan
  excited: {
    cyan: '#71C8F6',
    sky: '#FF86B7',
    mid: '#FF5D9E',
    violet: '#7655F6',
    deep: '#6338F1',
    accent: '#FF8978',
    milk: 'rgba(255,248,252,0.55)',
    shadow: 'rgba(255,93,158,0.22)',
    faceField: '#C07AE8',
    density: 0.9,
    coreX: 0,
    coreY: -4,
    secondaryX: 8,
    secondaryY: -8,
  },
  // Slide 5 — Cyan → Violet → Soft Pink
  caring: {
    cyan: '#63D9F4',
    sky: '#71C8F6',
    mid: '#8A7AF5',
    violet: '#7655F6',
    deep: '#6338F1',
    accent: '#FF86B7',
    milk: 'rgba(247,250,255,0.6)',
    shadow: 'rgba(118,85,246,0.24)',
    faceField: '#8B7AF0',
    density: 0.86,
    coreX: 3,
    coreY: 1,
    secondaryX: -10,
    secondaryY: 6,
  },
}

export type TimelineStep = { expression: FaceExpression; ms: number }

export const MOOD_TIMELINES: Record<NasouhMood, TimelineStep[]> = {
  curious: [
    { expression: 'neutral', ms: 400 },
    { expression: 'blinking', ms: 120 },
    { expression: 'curious', ms: 1400 },
    { expression: 'happy', ms: 700 },
    { expression: 'curious', ms: 0 },
  ],
  calm: [
    { expression: 'listening', ms: 900 },
    { expression: 'blinking', ms: 110 },
    { expression: 'listening', ms: 800 },
    { expression: 'caring', ms: 650 },
    { expression: 'listening', ms: 0 },
  ],
  focused: [
    { expression: 'concerned', ms: 500 },
    { expression: 'processing', ms: 900 },
    { expression: 'thinking', ms: 1200 },
    { expression: 'happy', ms: 700 },
    { expression: 'thinking', ms: 0 },
  ],
  excited: [
    { expression: 'happy', ms: 350 },
    { expression: 'laughing', ms: 700 },
    { expression: 'blinking', ms: 120 },
    { expression: 'happy', ms: 0 },
  ],
  caring: [
    { expression: 'neutral', ms: 350 },
    { expression: 'happy', ms: 500 },
    { expression: 'caring', ms: 1200 },
    { expression: 'blinking', ms: 180 },
    { expression: 'caring', ms: 0 },
  ],
}
