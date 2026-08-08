import { useCallback, useEffect, useRef } from 'react'

export type TypingAction = 'type' | 'pause' | 'delete' | 'hold'

export interface TypingStep {
  action: TypingAction
  text?: string
  /** For delete: number of chars. For pause/hold: ms */
  count?: number
  duration?: number
  /** Base ms per character when typing (default ~42). Higher = slower. */
  baseDelay?: number
  /**
   * Optional end delay for paced typing.
   * - easeOut: starts near baseDelay, slows toward endDelay (fast → slow)
   * - easeIn: starts near endDelay feel inverted — use easeOut for deceleration
   * If omitted, constant baseDelay cadence.
   */
  endDelay?: number
  /** Delay curve when endDelay is set. Default easeOut (decelerate). */
  pace?: 'easeOut' | 'easeIn' | 'linear'
  /** Fired via onEmit when this step begins */
  emit?: string
}

function sleep(ms: number, signal: { cancelled: boolean }) {
  return new Promise<void>((resolve) => {
    if (signal.cancelled || ms <= 0) {
      resolve()
      return
    }
    const id = window.setTimeout(resolve, ms)
    const start = performance.now()
    const watch = () => {
      if (signal.cancelled) {
        window.clearTimeout(id)
        resolve()
        return
      }
      if (performance.now() - start < ms) {
        requestAnimationFrame(watch)
      }
    }
    requestAnimationFrame(watch)
  })
}

function easeProgress(t: number, pace: 'easeOut' | 'easeIn' | 'linear') {
  if (pace === 'linear') return t
  if (pace === 'easeIn') return t * t
  // easeOut — delay rises slowly then more near the end (extra linger on last chars)
  return t * t * t
}

function charDelay(
  ch: string,
  index: number,
  length: number,
  startBase: number,
  endBase: number | undefined,
  pace: 'easeOut' | 'easeIn' | 'linear',
) {
  let base = startBase
  if (endBase != null && length > 1) {
    const t = index / (length - 1)
    base = startBase + (endBase - startBase) * easeProgress(t, pace)
  }
  if (ch === '.' || ch === '…') return base + 70 + Math.random() * 28
  if (ch === ' ' || ch === '،') return base + 18 + Math.random() * 14
  return base + Math.random() * 16
}

interface Options {
  steps: TypingStep[]
  enabled: boolean
  reducedMotion: boolean
  finalText: string
  onText: (value: string) => void
  onPhase?: (phase: 'typing' | 'sent' | 'done') => void
  onComplete?: () => void
  onEmit?: (id: string) => void
}

/**
 * Cancelable typing / delete timeline. No setInterval for character emission.
 */
export function useTypingTimeline({
  steps,
  enabled,
  reducedMotion,
  finalText,
  onText,
  onPhase,
  onComplete,
  onEmit,
}: Options) {
  const signalRef = useRef({ cancelled: false })
  const runId = useRef(0)
  const onTextRef = useRef(onText)
  const onPhaseRef = useRef(onPhase)
  const onCompleteRef = useRef(onComplete)
  const onEmitRef = useRef(onEmit)
  onTextRef.current = onText
  onPhaseRef.current = onPhase
  onCompleteRef.current = onComplete
  onEmitRef.current = onEmit

  const cancel = useCallback(() => {
    signalRef.current.cancelled = true
  }, [])

  useEffect(() => {
    signalRef.current = { cancelled: false }
    const signal = signalRef.current
    const id = ++runId.current

    if (!enabled) return

    if (reducedMotion) {
      onTextRef.current(finalText)
      onPhaseRef.current?.('sent')
      onCompleteRef.current?.()
      return
    }

    let buffer = ''
    onTextRef.current('')
    onPhaseRef.current?.('typing')

    const run = async () => {
      for (const step of steps) {
        if (signal.cancelled || runId.current !== id) return

        if (step.emit) onEmitRef.current?.(step.emit)

        if (step.action === 'pause' || step.action === 'hold') {
          await sleep(step.duration ?? 400, signal)
          continue
        }

        if (step.action === 'type' && step.text) {
          const startBase = step.baseDelay ?? 42
          const chars = Array.from(step.text) // correct for Arabic grapheme clusters where possible
          for (let i = 0; i < chars.length; i++) {
            if (signal.cancelled || runId.current !== id) return
            const ch = chars[i]
            buffer += ch
            onTextRef.current(buffer)
            await sleep(
              charDelay(ch, i, chars.length, startBase, step.endDelay, step.pace ?? 'easeOut'),
              signal,
            )
          }
          continue
        }

        if (step.action === 'delete') {
          const n = step.count ?? buffer.length
          for (let i = 0; i < n; i++) {
            if (signal.cancelled || runId.current !== id) return
            buffer = buffer.slice(0, -1)
            onTextRef.current(buffer)
            await sleep(28 + Math.random() * 22, signal)
          }
        }
      }

      if (signal.cancelled || runId.current !== id) return
      onPhaseRef.current?.('sent')
      await sleep(120, signal)
      if (signal.cancelled || runId.current !== id) return
      onPhaseRef.current?.('done')
      onCompleteRef.current?.()
    }

    void run()

    return () => {
      signal.cancelled = true
    }
  }, [enabled, reducedMotion, steps, finalText])

  return { cancel }
}
