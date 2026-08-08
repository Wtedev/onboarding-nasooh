import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import {
  SERVICE_TABS,
  type DestinationId,
  type ServiceTab,
} from '../../data/onboardingContent'
import { ProgressBars } from './ProgressBars'
import { PanoramaBackground } from './PanoramaBackground'
import { StageContainment } from './StageContainment'
import { StageSolidarity } from './StageSolidarity'
import { ServiceSlide } from './StageServices'
import { StageChoice } from './StageChoice'

interface OnboardingFlowProps {
  onComplete: (destination: DestinationId, choiceKey?: string) => void
  onSkip: () => void
}

/** containment → solidarity → 4 service slides → choice */
const STAGE_COUNT = 2 + SERVICE_TABS.length + 1
const CHOICE_INDEX = STAGE_COUNT - 1
const SWIPE_THRESHOLD = 56
/**
 * Same mirrored-chevron trick as the choice slide: pick one literal glyph and
 * let the browser's bidi mirroring flip it per `dir`, instead of branching on
 * `isRtl` (which would double-flip and point the wrong way).
 */
const BACK_CHEVRON = '‹'
const FORWARD_CHEVRON = '›'
const CAMERA_EASE = [0.65, 0, 0.22, 1] as const

function serviceTabAt(stage: number): ServiceTab | null {
  const i = stage - 2
  if (i < 0 || i >= SERVICE_TABS.length) return null
  return SERVICE_TABS[i]
}

export function OnboardingFlow({ onComplete, onSkip }: OnboardingFlowProps) {
  const { t, i18n } = useTranslation()
  const reduced = useReducedMotion() ?? false
  const isRtl = i18n.language?.startsWith('ar') ?? true
  const [stage, setStage] = useState(0)
  /** On slide 1, the skip link waits for the "Tour Nasouh" CTA to show up first */
  const [slide1CtaVisible, setSlide1CtaVisible] = useState(false)
  const hideFooter =
    stage === CHOICE_INDEX ||
    serviceTabAt(stage) === 'companion' ||
    (stage === 0 && !slide1CtaVisible)
  const [viewportW, setViewportW] = useState(0)
  const viewportRef = useRef<HTMLDivElement>(null)
  const touchStartX = useRef<number | null>(null)
  const onSlide1CtaVisible = useCallback(() => setSlide1CtaVisible(true), [])

  useEffect(() => {
    const el = viewportRef.current
    if (!el) return
    const measure = () => setViewportW(Math.round(el.clientWidth))
    measure()
    if (typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const goNext = useCallback(() => {
    setStage((s) => Math.min(STAGE_COUNT - 1, s + 1))
  }, [])

  const goBack = useCallback(() => {
    setStage((s) => Math.max(0, s - 1))
  }, [])

  const handleChoose = useCallback(
    (destination: DestinationId, choiceKey: string) => {
      onComplete(destination, choiceKey)
    },
    [onComplete],
  )

  const onPointerDown = (clientX: number, target: EventTarget | null) => {
    if (stage === CHOICE_INDEX) return
    if (target instanceof Element && target.closest('button,a,[role="tab"]')) return
    touchStartX.current = clientX
  }

  const onPointerUp = (clientX: number) => {
    if (touchStartX.current == null || stage === CHOICE_INDEX) {
      touchStartX.current = null
      return
    }
    const dx = clientX - touchStartX.current
    touchStartX.current = null
    // AR: swipe left → next. EN: swipe right → next (opposite pan).
    const forward = isRtl ? dx < -SWIPE_THRESHOLD : dx > SWIPE_THRESHOLD
    const backward = isRtl ? dx > SWIPE_THRESHOLD : dx < -SWIPE_THRESHOLD
    if (forward && stage < STAGE_COUNT - 1) goNext()
    else if (backward && stage > 0) goBack()
  }

  /**
   * AR: next pans R→L (slides to the left of 0).
   * EN: opposite — next pans L→R (slides to the right of 0).
   */
  const directionFactor = isRtl ? -1 : 1

  const contentX = useMemo(() => {
    if (!viewportW) return 0
    return -stage * viewportW * directionFactor
  }, [stage, viewportW, directionFactor])

  /** Absolute left of slide i — keeps stage 0 at origin */
  const slideLeft = (i: number) => i * viewportW * directionFactor

  const duration = reduced ? 0.28 : 0.85

  return (
    <div
      className="onboarding-viewport relative flex h-full w-full flex-col overflow-hidden"
      style={{
        paddingTop: 'max(0.5rem, env(safe-area-inset-top))',
        paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))',
      }}
    >
      {/* Shared panorama — right crop on slide 1, pans left each step */}
      <PanoramaBackground
        stage={stage}
        slidesCount={STAGE_COUNT}
        duration={duration}
      />

      {/* Fixed chrome — hidden on choice (logo lives in the stage) */}
      <header
        className={`relative z-20 flex items-center gap-2 bg-transparent px-4 pb-2 pt-1 ${
          stage === CHOICE_INDEX ? 'pointer-events-none invisible h-0 overflow-hidden p-0' : ''
        }`}
        aria-hidden={stage === CHOICE_INDEX}
      >
        {/* Back keeps its box on slide 1 so the progress bar never shifts */}
        <button
          type="button"
          dir={isRtl ? 'rtl' : 'ltr'}
          onClick={goBack}
          aria-label={t('backAria')}
          className={`shrink-0 whitespace-nowrap rounded-full px-2 py-1 text-[12px] font-medium text-[#43368e] ${
            stage > 0 ? '' : 'pointer-events-none invisible'
          }`}
          tabIndex={stage > 0 ? undefined : -1}
          aria-hidden={stage > 0 ? undefined : true}
        >
          {BACK_CHEVRON} {t('back')}
        </button>
        <div className="min-w-0 flex-1">
          {/* Choice slide hides this bar entirely, so it gets no slot of its own */}
          <ProgressBars
            total={CHOICE_INDEX}
            current={stage}
            blendWithAtmosphere={stage === 0}
          />
        </div>
        {/* A button, not a span: `button { font: inherit }` in index.css overrides
            the text utilities, so only an identical element mirrors the box */}
        <button
          type="button"
          dir={isRtl ? 'rtl' : 'ltr'}
          aria-hidden
          tabIndex={-1}
          disabled
          className="pointer-events-none invisible shrink-0 whitespace-nowrap rounded-full px-2 py-1 text-[12px] font-medium"
        >
          {BACK_CHEVRON} {t('back')}
        </button>
      </header>

      {/* Content track — original stage components, unchanged */}
      <div
        ref={viewportRef}
        className="relative z-10 min-h-0 flex-1 overflow-hidden touch-pan-y"
        onTouchStart={(e) =>
          onPointerDown(e.touches[0]?.clientX ?? 0, e.target)
        }
        onTouchEnd={(e) => onPointerUp(e.changedTouches[0]?.clientX ?? 0)}
        onPointerDown={(e) => {
          if (e.pointerType === 'touch') return
          onPointerDown(e.clientX, e.target)
        }}
        onPointerUp={(e) => {
          if (e.pointerType === 'touch') return
          onPointerUp(e.clientX)
        }}
      >
        <motion.div
          className="slides-content-track absolute inset-0 gap-0 will-change-transform"
          initial={false}
          animate={{ x: contentX }}
          transition={{ duration, ease: CAMERA_EASE }}
        >
          {Array.from({ length: STAGE_COUNT }, (_, i) => {
            const tab = serviceTabAt(i)
            const active = stage === i
            return (
              <div
                key={i}
                className={`onboarding-slide absolute inset-y-0 ${active ? '' : 'pointer-events-none'}`}
                style={{
                  left: viewportW ? slideLeft(i) : `${i * 100 * directionFactor}%`,
                  flex: '0 0 100%',
                  width: viewportW ? viewportW : '100%',
                  minWidth: viewportW ? viewportW : '100%',
                  height: '100%',
                  margin: 0,
                  position: 'absolute',
                  background: 'transparent',
                  overflow: 'hidden',
                }}
                aria-hidden={!active}
              >
                {i === 0 && (
                  <StageContainment
                    isActive={active}
                    onContinue={goNext}
                    onCtaVisible={onSlide1CtaVisible}
                  />
                )}
                {i === 1 && (
                  <StageSolidarity isActive={active} onContinue={goNext} />
                )}
                {tab && (
                  <ServiceSlide
                    tab={tab}
                    isActive={active}
                    onContinue={goNext}
                    isFinalService={tab === 'companion'}
                  />
                )}
                {i === CHOICE_INDEX && (
                  <StageChoice isActive={active} onChoose={handleChoose} />
                )}
              </div>
            )
          })}
        </motion.div>
      </div>

      {/* Skip — hidden on choice (explore link is the exit path there) and on the Nasouh AI page */}
      <footer
        className={`relative z-20 flex shrink-0 justify-center bg-transparent px-6 pb-0 pt-1.5 ${
          hideFooter ? 'pointer-events-none invisible h-0 overflow-hidden p-0' : ''
        }`}
        aria-hidden={hideFooter}
      >
        <button
          type="button"
          dir={isRtl ? 'rtl' : 'ltr'}
          onClick={onSkip}
          aria-label={t('skipAria')}
          className="flex items-center gap-1 rounded-full px-3 py-0.5 text-[10px] font-medium text-[#43368e]"
        >
          {t('skip')}
          <span aria-hidden className="text-[10px] leading-none">
            {FORWARD_CHEVRON}
          </span>
        </button>
      </footer>
    </div>
  )
}
