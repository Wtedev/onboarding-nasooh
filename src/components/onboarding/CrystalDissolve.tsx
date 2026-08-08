import { useMemo, type CSSProperties } from 'react'
import { CARD_H, CARD_W } from './MoodFallingCard'

type Grain = {
  x: number
  y: number
  size: number
  driftX: number
  driftY: number
  delay: number
  tone: number
}

function mulberry(seed: number) {
  let s = (seed >>> 0) || 1
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0
    return s / 4294967296
  }
}

function seededGrains(seed: number, count: number): Grain[] {
  const rand = mulberry(seed * 7919 + 13)
  return Array.from({ length: count }, () => {
    // bias toward edges — like atomizing silhouette
    const edge = rand()
    let x: number
    let y: number
    if (edge < 0.55) {
      // perimeter
      const side = Math.floor(rand() * 4)
      if (side === 0) {
        x = rand() * CARD_W
        y = rand() * CARD_H * 0.22
      } else if (side === 1) {
        x = rand() * CARD_W
        y = CARD_H * (0.78 + rand() * 0.22)
      } else if (side === 2) {
        x = rand() * CARD_W * 0.22
        y = rand() * CARD_H
      } else {
        x = CARD_W * (0.78 + rand() * 0.22)
        y = rand() * CARD_H
      }
    } else {
      x = rand() * CARD_W
      y = rand() * CARD_H
    }
    const ang = rand() * Math.PI * 2
    const speed = 18 + rand() * 70
    return {
      x,
      y,
      size: 0.7 + rand() * 1.8,
      driftX: Math.cos(ang) * speed,
      driftY: Math.sin(ang) * speed + 12 + rand() * 36,
      delay: rand() * 0.28,
      tone: rand(),
    }
  })
}

/** Stippled spray of grains as the card atomizes. */
export function GrainDissolveOverlay({
  seed,
  strength,
}: {
  seed: number
  strength: number
}) {
  const grains = useMemo(() => seededGrains(seed, 78), [seed])
  if (strength <= 0.02) return null
  const t = Math.min(1, Math.max(0, strength))

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-visible"
      aria-hidden
      style={{ mixBlendMode: 'normal' }}
    >
      {grains.map((g, i) => {
        const local = Math.max(0, Math.min(1, (t - g.delay) / Math.max(0.01, 1 - g.delay)))
        if (local <= 0) return null
        // bloom then thin out (sparse mist)
        const life =
          local < 0.2
            ? local / 0.2
            : Math.max(0, 1 - (local - 0.2) / 0.8)
        const sparse = life * (1 - local * 0.55)
        const x = g.x + g.driftX * local
        const y = g.y + g.driftY * local
        const size = g.size * (1 + local * 0.35)
        const c =
          g.tone > 0.72
            ? 'rgba(255,255,255,0.95)'
            : g.tone > 0.4
              ? 'rgba(232,228,255,0.9)'
              : 'rgba(210,220,255,0.85)'

        return (
          <span
            key={i}
            className="absolute rounded-full"
            style={{
              left: x,
              top: y,
              width: size,
              height: size,
              marginLeft: -size / 2,
              marginTop: -size / 2,
              background: c,
              opacity: sparse,
              boxShadow:
                size > 1.6
                  ? `0 0 ${1.5 + local * 2}px rgba(255,255,255,0.55)`
                  : undefined,
            }}
          />
        )
      })}
    </div>
  )
}

/**
 * Grainy / stippled dissolve on the card body (noise threshold mask).
 * Matches a sand / spray-mist atomize — not a soft blur.
 */
export function GrainDissolveFilter({
  id,
  strength,
}: {
  id: string
  strength: number
}) {
  const d = Math.min(1, Math.max(0, strength))
  // Higher dissolve → lower threshold → more noise holes
  const intercept = 0.42 - d * 1.15
  const slope = 3.2 + d * 6

  return (
    <svg
      width={0}
      height={0}
      className="absolute"
      aria-hidden
      style={{ position: 'absolute', width: 0, height: 0 }}
    >
      <defs>
        <filter
          id={id}
          x="-35%"
          y="-35%"
          width="170%"
          height="170%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency={0.95 + d * 0.55}
            numOctaves="4"
            seed={Number.parseInt(id.replace(/\D/g, '').slice(-4) || '7', 10)}
            result="noise"
          />
          <feComponentTransfer in="noise" result="cut">
            <feFuncA type="linear" slope={slope} intercept={intercept} />
          </feComponentTransfer>
          <feComposite in="SourceGraphic" in2="cut" operator="in" />
        </filter>
      </defs>
    </svg>
  )
}

export function grainCardStyle(dissolve: number, filterId: string): CSSProperties {
  if (dissolve <= 0.01) return {}
  const d = Math.min(1, dissolve)
  return {
    filter: `url(#${filterId})`,
    opacity: Math.max(0, 1 - d * 0.88),
    transform: `scale(${1 - d * 0.04})`,
    // slight contrast punch so remaining grains read as stipple, not blur
    WebkitFilter: `url(#${filterId})`,
  }
}

/** @deprecated */
export const CrystalDissolveOverlay = GrainDissolveOverlay
