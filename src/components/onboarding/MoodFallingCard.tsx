import type {
  FallingCardId,
  FallingFace,
  FallingVariant,
} from '../../data/onboardingContent'
import { FALLING_CARDS } from '../../data/onboardingContent'

/** Landscape 4:3 card size (css px). */
export const CARD_W = 148
export const CARD_H = 111

const SHELL: Record<FallingVariant, string> = {
  peach: '#FFF8F6',
  mint: '#F7FCF3',
  lilac: '#F7F4FF',
  sky: '#F3F8FF',
  rose: '#FFF5FA',
  cream: '#FFFBF2',
}

const GLOW: Record<FallingVariant, [string, string]> = {
  peach: ['#FFC4B4', '#FFDCD2'],
  mint: ['#E4F0A8', '#D4E99A'],
  lilac: ['#D4C4FF', '#E6DCFF'],
  sky: ['#B8D8FF', '#D2E8FF'],
  rose: ['#FFC4E0', '#FFE0F0'],
  cream: ['#FFE9B0', '#FFF2CC'],
}

function Face({ kind, cx, cy }: { kind: FallingFace; cx: number; cy: number }) {
  const s = 0.78
  if (kind === 'sad') {
    return (
      <g transform={`translate(${cx - 24},${cy - 24}) scale(${s})`}>
        <rect x="10" y="8" width="6" height="16" rx="3" fill="#fff" />
        <rect x="32" y="8" width="6" height="16" rx="3" fill="#fff" />
        <path
          d="M14 40c5-8 15-8 20 0"
          fill="none"
          stroke="#fff"
          strokeWidth="4.5"
          strokeLinecap="round"
        />
      </g>
    )
  }
  if (kind === 'wavy') {
    return (
      <g transform={`translate(${cx - 24},${cy - 24}) scale(${s})`}>
        <rect x="10" y="6" width="6" height="18" rx="3" fill="#fff" />
        <rect x="32" y="6" width="6" height="18" rx="3" fill="#fff" />
        <path
          d="M8 38c4 7 8-7 12 0s8-7 12 0 8-7 12 0"
          fill="none"
          stroke="#fff"
          strokeWidth="4.5"
          strokeLinecap="round"
        />
      </g>
    )
  }
  if (kind === 'tired') {
    return (
      <g transform={`translate(${cx - 24},${cy - 24}) scale(${s})`}>
        <path d="M10 16h10" stroke="#fff" strokeWidth="4.5" strokeLinecap="round" />
        <path d="M28 16h10" stroke="#fff" strokeWidth="4.5" strokeLinecap="round" />
        <path
          d="M14 38c5-6 15-6 20 0"
          fill="none"
          stroke="#fff"
          strokeWidth="4.5"
          strokeLinecap="round"
        />
      </g>
    )
  }
  if (kind === 'soft') {
    return (
      <g transform={`translate(${cx - 24},${cy - 24}) scale(${s})`}>
        <circle cx="15" cy="16" r="4" fill="#fff" />
        <circle cx="33" cy="16" r="4" fill="#fff" />
        <path
          d="M14 34c5 8 15 8 20 0"
          fill="none"
          stroke="#fff"
          strokeWidth="4.5"
          strokeLinecap="round"
        />
      </g>
    )
  }
  return (
    <g transform={`translate(${cx - 24},${cy - 24}) scale(${s})`}>
      <rect x="10" y="8" width="6" height="16" rx="3" fill="#fff" />
      <rect x="32" y="8" width="6" height="16" rx="3" fill="#fff" />
      <rect x="14" y="36" width="20" height="5" rx="2.5" fill="#fff" />
    </g>
  )
}

export function MoodCardVisual({
  cardId,
  support,
  feeling,
  mirrored = false,
}: {
  cardId: FallingCardId
  support: string
  feeling: string
  /** Arabic: glow + face on the left, text on the right. */
  mirrored?: boolean
}) {
  const meta = FALLING_CARDS.find((c) => c.id === cardId) ?? FALLING_CARDS[0]
  const [g0, g1] = GLOW[meta.variant]
  const gid = `g-${cardId}-${mirrored ? 'rtl' : 'ltr'}`
  const textW = CARD_W * 0.58
  const textX = mirrored ? CARD_W - textW - 12 : 12
  const faceX = mirrored ? CARD_W * 0.2 : CARD_W * 0.8
  const glowCx = mirrored ? '22%' : '78%'

  return (
    <svg
      viewBox={`0 0 ${CARD_W} ${CARD_H}`}
      width={CARD_W}
      height={CARD_H}
      className="pointer-events-none block select-none"
      role="img"
      aria-label={feeling}
      style={{ filter: 'drop-shadow(0 14px 22px rgba(145,103,255,0.16))' }}
    >
      <defs>
        <radialGradient id={gid} cx={glowCx} cy="42%" r="55%">
          <stop offset="0%" stopColor={g0} stopOpacity="0.95" />
          <stop offset="55%" stopColor={g1} stopOpacity="0.45" />
          <stop offset="100%" stopColor={SHELL[meta.variant]} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect
        width={CARD_W}
        height={CARD_H}
        rx="22"
        fill={SHELL[meta.variant]}
      />
      <rect width={CARD_W} height={CARD_H} rx="22" fill={`url(#${gid})`} />

      <foreignObject x={textX} y="12" width={textW} height={CARD_H - 24}>
        <div
          // @ts-expect-error xmlns is valid for foreignObject HTML hosts
          xmlns="http://www.w3.org/1999/xhtml"
          style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: 5,
            textAlign: mirrored ? 'right' : 'left',
            direction: mirrored ? 'rtl' : 'ltr',
            fontFamily: 'Lama Sans, LamaSans, sans-serif',
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: 12,
              fontWeight: 700,
              lineHeight: 1.3,
              color: '#43368e',
            }}
          >
            {feeling}
          </p>
          <p
            style={{
              margin: 0,
              fontSize: 9.5,
              fontWeight: 500,
              lineHeight: 1.3,
              color: 'rgba(67, 54, 142, 0.55)',
            }}
          >
            {support}
          </p>
        </div>
      </foreignObject>

      <Face kind={meta.face} cx={faceX} cy={CARD_H * 0.55} />
    </svg>
  )
}
