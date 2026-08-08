import { useEffect, useRef, useState } from 'react'
import type { FaceExpression, NasouhMood } from '../../types/onboarding'
import { MOOD_BASE_FACE, MOOD_TIMELINES } from './faceSystem'

interface Options {
  mood: NasouhMood
  enabled: boolean
  reducedMotion: boolean
  override?: FaceExpression
}

/**
 * Central expression timeline per mood. Cleans up all timers on change/unmount.
 */
export function useExpressionTimeline({
  mood,
  enabled,
  reducedMotion,
  override,
}: Options) {
  const [expression, setExpression] = useState<FaceExpression>(
    override ?? MOOD_BASE_FACE[mood],
  )
  const timersRef = useRef<number[]>([])

  const clearTimers = () => {
    timersRef.current.forEach((id) => window.clearTimeout(id))
    timersRef.current = []
  }

  useEffect(() => {
    if (override) {
      clearTimers()
      setExpression(override)
      return
    }

    clearTimers()
    const base = MOOD_BASE_FACE[mood]
    setExpression(base)

    if (!enabled || reducedMotion) return

    const steps = MOOD_TIMELINES[mood]
    let elapsed = 0

    steps.forEach((step, index) => {
      const id = window.setTimeout(() => {
        setExpression(step.expression)
      }, elapsed)
      timersRef.current.push(id)
      elapsed += step.ms
      // Last step with ms:0 stays as resting expression
      if (index === steps.length - 1 && step.ms === 0) {
        // schedule occasional blinks after timeline settles
        const scheduleBlink = () => {
          const wait = 3200 + Math.random() * 2800
          const blinkId = window.setTimeout(() => {
            setExpression('blinking')
            const backId = window.setTimeout(() => {
              setExpression(step.expression)
              scheduleBlink()
            }, 110)
            timersRef.current.push(backId)
          }, wait)
          timersRef.current.push(blinkId)
        }
        const settleId = window.setTimeout(scheduleBlink, 400)
        timersRef.current.push(settleId)
      }
    })

    return clearTimers
  }, [mood, enabled, reducedMotion, override])

  return expression
}
