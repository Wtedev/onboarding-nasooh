import { useCallback, useEffect, useState } from 'react'
import { STORAGE_KEYS, type DestinationId } from '../data/onboardingContent'

export function readOnboardingDone(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEYS.done) === '1'
  } catch {
    return false
  }
}

export function readLastChoice(): DestinationId | null {
  try {
    const v = localStorage.getItem(STORAGE_KEYS.choice)
    return (v as DestinationId) || null
  } catch {
    return null
  }
}

export function useOnboardingPersist() {
  const [done, setDone] = useState(false)

  useEffect(() => {
    setDone(readOnboardingDone())
  }, [])

  const complete = useCallback((choice?: DestinationId) => {
    try {
      localStorage.setItem(STORAGE_KEYS.done, '1')
      if (choice) {
        localStorage.setItem(STORAGE_KEYS.choice, choice)
      }
    } catch {
      /* ignore */
    }
    setDone(true)
  }, [])

  const reset = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEYS.done)
      localStorage.removeItem(STORAGE_KEYS.choice)
    } catch {
      /* ignore */
    }
    setDone(false)
  }, [])

  return { done, complete, reset }
}
