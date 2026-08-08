import { AnimatePresence, motion } from 'motion/react'
import type { FaceExpression } from '../../types/onboarding'
import { FACE_LAYOUTS, type EyeShape, type MouthShape } from './faceSystem'

interface NasouhFaceProps {
  expression: FaceExpression
  showSoundWaves?: boolean
  showProcessDots?: boolean
  showInsightMark?: boolean
  reducedMotion?: boolean
  glowFilterId: string
  facePlateColor: string
  faceFieldGradientId?: string
}

const FACE_SPRING = { type: 'spring' as const, stiffness: 380, damping: 28, mass: 0.7 }

export function NasouhFace({
  expression,
  showSoundWaves = false,
  showProcessDots = false,
  showInsightMark = false,
  reducedMotion = false,
  glowFilterId,
  facePlateColor,
  faceFieldGradientId,
}: NasouhFaceProps) {
  const layout = FACE_LAYOUTS[expression]
  const transition = reducedMotion ? { duration: 0.12 } : FACE_SPRING

  return (
    <motion.g
      animate={{
        x: layout.offsetX,
        y: layout.offsetY,
        rotate: layout.tilt,
      }}
      transition={transition}
      style={{ transformOrigin: '100px 98px' }}
    >
      {/* Soft luminous field — periwinkle mist, never a dark robot disk */}
      <motion.path
        d="M68 86C80 58 124 52 140 78C152 98 144 128 112 134C84 140 58 124 60 102C60 94 64 88 68 86Z"
        fill={faceFieldGradientId ? `url(#${faceFieldGradientId})` : facePlateColor}
        animate={{ opacity: 0.42 }}
        transition={transition}
        filter={`url(#${glowFilterId})`}
      />
      <motion.path
        d="M80 90C90 72 118 70 126 90C132 104 120 118 100 118C84 118 72 106 76 96C76 92 78 90 80 90Z"
        fill="#FFFFFF"
        animate={{ opacity: 0.18 + layout.glow * 0.1 }}
        transition={transition}
        filter={`url(#${glowFilterId})`}
      />

      <AnimatePresence mode="sync">
        <motion.g
          key={expression}
          initial={reducedMotion ? false : { opacity: 0.4 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.1 } }}
          transition={{ duration: 0.18 }}
        >
          <g transform="translate(100 96)">
            <Eye shape={layout.left} />
            <Eye shape={layout.right} />
            <Mouth shape={layout.mouth} />
            {expression === 'processing' && <StaticProcessBars />}
            {expression === 'thinking' && <ThinkDots />}
          </g>
        </motion.g>
      </AnimatePresence>

      {showSoundWaves && !reducedMotion && <SoundWaves />}
      {showProcessDots && !reducedMotion && expression !== 'processing' && <ProcessDots />}
      {showInsightMark && !reducedMotion && <InsightMark />}
    </motion.g>
  )
}

function Eye({ shape }: { shape: EyeShape }) {
  const stroke = '#FFFFFF'
  if (shape.kind === 'oval') {
    return (
      <ellipse
        cx={shape.ox ?? 0}
        cy={shape.oy ?? 0}
        rx={shape.rx}
        ry={shape.ry}
        fill={stroke}
        opacity={0.96}
      />
    )
  }
  if (shape.kind === 'dot') {
    return (
      <circle
        cx={shape.ox ?? 0}
        cy={shape.oy ?? 0}
        r={shape.r}
        fill={stroke}
        opacity={0.96}
      />
    )
  }
  if (shape.kind === 'line') {
    return (
      <line
        x1={shape.x1}
        y1={shape.y1}
        x2={shape.x2}
        y2={shape.y2}
        stroke={stroke}
        strokeWidth={shape.width ?? 6}
        strokeLinecap="round"
        opacity={0.96}
      />
    )
  }
  return (
    <path
      d={shape.d}
      fill="none"
      stroke={stroke}
      strokeWidth={shape.width ?? 6}
      strokeLinecap="round"
      opacity={0.96}
    />
  )
}

function Mouth({ shape }: { shape: MouthShape }) {
  const stroke = '#FFFFFF'
  if (shape.kind === 'none') return null
  if (shape.kind === 'dot') {
    return <circle cx={shape.cx} cy={shape.cy} r={shape.r} fill={stroke} opacity={0.95} />
  }
  if (shape.kind === 'line') {
    return (
      <line
        x1={shape.x1}
        y1={shape.y1}
        x2={shape.x2}
        y2={shape.y2}
        stroke={stroke}
        strokeWidth={shape.width ?? 5.5}
        strokeLinecap="round"
        opacity={0.95}
      />
    )
  }
  return (
    <path
      d={shape.d}
      fill="none"
      stroke={stroke}
      strokeWidth={shape.width ?? 5.5}
      strokeLinecap="round"
      opacity={0.95}
    />
  )
}

function StaticProcessBars() {
  return (
    <g transform="translate(0 18)">
      {[-10, 0, 10].map((x, i) => (
        <rect
          key={x}
          x={x - 2}
          y={-3}
          width={4}
          height={i === 1 ? 10 : 7}
          rx={2}
          fill="#FFFFFF"
          opacity={0.85}
        />
      ))}
    </g>
  )
}

function ThinkDots() {
  return (
    <g transform="translate(-6 16)">
      <circle cx="22" cy="6" r="2" fill="#FFFFFF" opacity={0.65} />
      <circle cx="28" cy="0" r="1.4" fill="#FFFFFF" opacity={0.45} />
      <circle cx="16" cy="2" r="1.2" fill="#FFFFFF" opacity={0.4} />
    </g>
  )
}

function SoundWaves() {
  return (
    <g transform="translate(68 96)" opacity={0.85}>
      {[0, 1, 2].map((i) => (
        <motion.path
          key={i}
          d={`M0 ${-6 - i * 3} Q${-7 - i * 4} 0 0 ${6 + i * 3}`}
          fill="none"
          stroke="#FFFFFF"
          strokeWidth={2}
          strokeLinecap="round"
          initial={{ opacity: 0, x: 4 }}
          animate={{ opacity: [0, 0.85, 0], x: [4, 0, -3] }}
          transition={{ duration: 1.4, delay: i * 0.15, repeat: Infinity, repeatDelay: 1.2 }}
        />
      ))}
    </g>
  )
}

function ProcessDots() {
  return (
    <g transform="translate(100 122)">
      {[-8, 0, 8].map((x, i) => (
        <motion.circle
          key={x}
          cx={x}
          cy={0}
          r={2.4}
          fill="#FFFFFF"
          animate={{ opacity: [0.25, 1, 0.25], y: [0, -3, 0] }}
          transition={{ duration: 0.9, delay: i * 0.14, repeat: Infinity }}
        />
      ))}
    </g>
  )
}

function InsightMark() {
  return (
    <motion.g
      transform="translate(132 74)"
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: [0, 0.95, 0], scale: [0.6, 1.05, 0.85], y: [4, 0, -6] }}
      transition={{ duration: 1.4, ease: 'easeOut' }}
    >
      <circle r="5" fill="none" stroke="#FFFFFF" strokeWidth="2" />
      <circle r="1.8" fill="#FFFFFF" />
    </motion.g>
  )
}
