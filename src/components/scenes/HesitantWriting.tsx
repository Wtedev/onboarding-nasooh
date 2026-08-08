import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { Send } from 'lucide-react'
import type { Language } from '../../types/onboarding'
import { useTypingTimeline, type TypingStep } from '../../hooks/useTypingTimeline'

export type HesitantPhase = 'expand' | 'typing' | 'listening' | 'silence' | 'done'

interface HesitantWritingProps {
  isActive: boolean
  language: Language
  reducedMotion?: boolean
  enterKey?: number
  fromCardMorph?: boolean
  shrinkToPulse?: boolean
  onPhaseChange?: (phase: HesitantPhase) => void
  onSkip?: () => void
}

function buildSteps(a1: string, a2: string, a3: string, a4: string): TypingStep[] {
  return [
    { action: 'type', text: a1 },
    { action: 'pause', duration: 820 },
    { action: 'delete', count: a1.length },
    { action: 'pause', duration: 400 },
    { action: 'type', text: a2 },
    { action: 'pause', duration: 1000 },
    { action: 'delete', count: a2.length },
    { action: 'pause', duration: 360 },
    { action: 'type', text: a3 },
    { action: 'pause', duration: 700 },
    { action: 'delete', count: a3.length },
    { action: 'pause', duration: 320 },
    { action: 'type', text: a4 },
    { action: 'pause', duration: 880 },
    { action: 'delete', count: a4.length },
    { action: 'hold', duration: 380 },
  ]
}

export function HesitantWriting({
  isActive,
  language,
  reducedMotion: reducedProp,
  enterKey = 0,
  fromCardMorph = false,
  shrinkToPulse = false,
  onPhaseChange,
  onSkip,
}: HesitantWritingProps) {
  const { t } = useTranslation()
  const prefersReduced = useReducedMotion()
  const reduced = reducedProp ?? prefersReduced ?? false
  const isRtl = language === 'ar'

  const [fieldText, setFieldText] = useState('')
  const [phase, setPhase] = useState<HesitantPhase>('expand')
  const [showCaret, setShowCaret] = useState(true)
  const [caretOn, setCaretOn] = useState(true)
  const [expanded, setExpanded] = useState(reduced || !fromCardMorph)
  const [asPulse, setAsPulse] = useState(false)
  const timersRef = useRef<number[]>([])

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id))
    timersRef.current = []
  }, [])

  const a1 = t('hesitantDemo.attempt1')
  const a2 = t('hesitantDemo.attempt2')
  const a3 = t('hesitantDemo.attempt3')
  const a4 = t('hesitantDemo.attempt4')
  const steps = useMemo(() => buildSteps(a1, a2, a3, a4), [a1, a2, a3, a4])

  const setPhaseSafe = useCallback(
    (p: HesitantPhase) => {
      setPhase(p)
      onPhaseChange?.(p)
    },
    [onPhaseChange],
  )

  useEffect(() => {
    clearTimers()
    if (!isActive) {
      setExpanded(false)
      setFieldText('')
      setShowCaret(true)
      setAsPulse(false)
      setPhaseSafe('expand')
      return
    }
    if (reduced) {
      setExpanded(true)
      setFieldText('')
      setShowCaret(false)
      setPhaseSafe('done')
      return
    }
    setExpanded(false)
    setAsPulse(false)
    setShowCaret(true)
    setPhaseSafe('expand')
    const id = window.setTimeout(() => {
      setExpanded(true)
      setPhaseSafe('typing')
    }, fromCardMorph ? 380 : 220)
    timersRef.current.push(id)
    return () => clearTimers()
  }, [isActive, enterKey, reduced, fromCardMorph, setPhaseSafe, clearTimers])

  useEffect(() => {
    if (!isActive || !showCaret || phase === 'done' || phase === 'silence') return
    const id = window.setInterval(() => setCaretOn((v) => !v), 480)
    return () => window.clearInterval(id)
  }, [isActive, showCaret, phase])

  useEffect(() => {
    if (shrinkToPulse) {
      setAsPulse(true)
      setShowCaret(false)
    }
  }, [shrinkToPulse])

  const typingEnabled =
    isActive && expanded && !reduced && !asPulse && phase !== 'expand' && phase !== 'done' && phase !== 'silence'

  const handleTypingPhase = useCallback(
    (p: 'typing' | 'sent' | 'done') => {
      if (p === 'typing') setPhaseSafe('typing')
      if (p === 'sent') {
        setFieldText('')
        setShowCaret(true)
        setPhaseSafe('silence')
        timersRef.current.push(window.setTimeout(() => setShowCaret(false), 480))
        timersRef.current.push(
          window.setTimeout(() => {
            setAsPulse(true)
            setPhaseSafe('done')
          }, 900),
        )
      }
    },
    [setPhaseSafe],
  )

  useEffect(() => {
    if (!isActive || reduced) return
    if (fieldText.startsWith(a2.slice(0, 3))) setPhaseSafe('listening')
  }, [fieldText, a2, isActive, reduced, setPhaseSafe])

  const { cancel } = useTypingTimeline({
    steps,
    enabled: typingEnabled,
    reducedMotion: false,
    finalText: '',
    onText: setFieldText,
    onPhase: handleTypingPhase,
  })

  if (!isActive) return null

  return (
    <div className="relative mx-auto flex w-full max-w-[340px] flex-col items-center gap-2 px-1">
      <motion.div
        className="relative flex items-center gap-2 overflow-hidden px-4"
        style={{
          background:
            'linear-gradient(145deg, rgba(255,255,255,0.72), rgba(237,243,253,0.55))',
          boxShadow:
            '0 14px 32px -16px rgba(115,141,244,0.35), inset 0 1px 0 rgba(255,255,255,0.75)',
          border: '1px solid rgba(133,151,245,0.28)',
        }}
        initial={false}
        animate={
          asPulse
            ? {
                width: 28,
                height: 10,
                borderRadius: 999,
                opacity: 0.85,
                paddingLeft: 0,
                paddingRight: 0,
              }
            : {
                width: expanded ? '100%' : fromCardMorph ? 168 : 108,
                height: 62,
                borderRadius: expanded ? 999 : fromCardMorph ? 28 : 999,
                opacity: 1,
              }
        }
        transition={{ type: 'spring', stiffness: 260, damping: 24 }}
        onPointerDown={(e) => e.stopPropagation()}
      >
        {!asPulse && (
          <>
            <div
              className="flex min-w-0 flex-1 items-center overflow-hidden text-[14px]"
              dir={isRtl ? 'rtl' : 'ltr'}
            >
              <span className="truncate text-nasouh-ink/85">
                {fieldText || (
                  <span className="text-nasouh-ink/35">{t('hesitantDemo.placeholder')}</span>
                )}
              </span>
              {expanded && showCaret && (
                <span
                  className="ms-0.5 inline-block h-[16px] w-[1.5px] rounded-full bg-[#7655F6]"
                  style={{ opacity: caretOn ? 1 : 0 }}
                />
              )}
            </div>
            <button
              type="button"
              tabIndex={-1}
              aria-hidden
              disabled
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
              style={{
                background: 'linear-gradient(145deg, #71C8F6, #7655F6)',
                opacity: 0.3,
                pointerEvents: 'none',
              }}
            >
              <Send size={14} className="text-white" strokeWidth={2} />
            </button>
          </>
        )}
      </motion.div>

      {onSkip && isActive && !reduced && phase !== 'done' && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            cancel()
            clearTimers()
            setFieldText('')
            setShowCaret(false)
            setAsPulse(true)
            setPhaseSafe('done')
            onSkip()
          }}
          className="text-[10px] font-medium text-nasouh-ink/28 hover:text-nasouh-ink/45"
        >
          {t('skipDemo')}
        </button>
      )}
    </div>
  )
}
