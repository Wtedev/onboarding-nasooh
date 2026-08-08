import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'

interface ListeningWavesProps {
  isActive: boolean
  reducedMotion?: boolean
  enterKey?: number
  morphToLines?: boolean
}

function wavePath(amp: number, freq: number, phase: number, y: number) {
  const pts: string[] = []
  for (let x = 0; x <= 320; x += 8) {
    const yy = y + Math.sin(x * freq + phase) * amp
    pts.push(`${x === 0 ? 'M' : 'L'}${x} ${yy}`)
  }
  return pts.join(' ')
}

export function ListeningWaves({
  isActive,
  reducedMotion: reducedProp,
  enterKey = 0,
  morphToLines = false,
}: ListeningWavesProps) {
  const prefersReduced = useReducedMotion()
  const reduced = reducedProp ?? prefersReduced ?? false
  const speakerRef = useRef<SVGPathElement>(null)
  const listenerRef = useRef<SVGPathElement>(null)

  useEffect(() => {
    if (!isActive) return
    if (reduced) {
      const sY = morphToLines ? 70 : 55
      const lY = morphToLines ? 95 : 100
      speakerRef.current?.setAttribute('d', wavePath(morphToLines ? 2 : 6, 0.045, 0, sY))
      listenerRef.current?.setAttribute('d', wavePath(morphToLines ? 1.5 : 3, 0.032, 0.8, lY))
      return
    }

    let raf = 0
    let phase = 0
    let last = performance.now()
    const t0 = performance.now()
    let stopped = false

    const tick = (now: number) => {
      if (stopped) return
      const dt = (now - last) / 1000
      last = now
      const elapsed = (now - t0) / 1000
      const calm = elapsed > 1.8 ? Math.min(1, (elapsed - 1.8) / 2.2) : 0
      phase += dt * (1.8 - calm * 0.8)

      const speakerAmp = morphToLines ? 2 : 18 - calm * 10
      const listenerAmp = morphToLines ? 1.5 : 7 - calm * 2
      const speakerY = morphToLines ? 70 : 55
      const listenerY = morphToLines ? 95 : 100

      speakerRef.current?.setAttribute(
        'd',
        wavePath(speakerAmp, 0.045, phase * 2.2, speakerY),
      )
      listenerRef.current?.setAttribute(
        'd',
        wavePath(listenerAmp, 0.032, phase * 1.1 + 0.8, listenerY),
      )
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      stopped = true
      cancelAnimationFrame(raf)
    }
  }, [isActive, enterKey, reduced, morphToLines])

  if (!isActive && !morphToLines) return null

  return (
    <div
      className="relative mx-auto flex h-full w-full max-w-[340px] items-center justify-center"
      aria-hidden
    >
      <svg viewBox="0 0 320 140" className="w-full overflow-visible">
        <defs>
          <linearGradient id="speakerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#63D9F4" />
            <stop offset="100%" stopColor="#7655F6" />
          </linearGradient>
          <linearGradient id="listenerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#F6B3DD" />
            <stop offset="100%" stopColor="#A98BFA" />
          </linearGradient>
        </defs>
        <path
          ref={speakerRef}
          fill="none"
          stroke="url(#speakerGrad)"
          strokeWidth={morphToLines ? 1.5 : 2.4}
          strokeLinecap="round"
          strokeOpacity={0.85}
        />
        <path
          ref={listenerRef}
          fill="none"
          stroke="url(#listenerGrad)"
          strokeWidth={morphToLines ? 1.5 : 2}
          strokeLinecap="round"
          strokeOpacity={0.7}
        />
      </svg>
    </div>
  )
}
