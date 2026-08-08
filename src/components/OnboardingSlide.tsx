import { useCallback, useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import type { Language, SlideData, TransitionDirection } from '../types/onboarding'
import { SLIDE_IDS } from '../data/slides'
import { SceneChrome } from './scenes/SceneChrome'
import { FeelingStream } from './scenes/FeelingStream'
import { HesitantWriting, type HesitantPhase } from './scenes/HesitantWriting'
import { ContainmentMessage } from './scenes/ContainmentMessage'
import { SimilarField } from './scenes/SimilarField'
import { ListeningWaves } from './scenes/ListeningWaves'
import { AnonymousCard } from './scenes/AnonymousCard'
import { RulesArc } from './scenes/RulesArc'
import { FinaleGather } from './scenes/FinaleGather'

interface OnboardingSlideProps {
  slide: SlideData
  isActive: boolean
  transitionProgress?: number
  activeIndex?: number
  isDragging?: boolean
  reducedMotion?: boolean
  direction?: TransitionDirection
  previousIndex?: number
  onScenePhase?: (phase: string) => void
  onPrimary?: () => void
  onSecondary?: () => void
}

function SlideShell({
  visual,
  chrome,
}: {
  visual: React.ReactNode
  chrome: React.ReactNode
}) {
  return (
    <div className="relative flex h-full w-full flex-col px-5 pt-1">
      <div className="relative min-h-0 flex-1">{visual}</div>
      {chrome}
    </div>
  )
}

export function OnboardingSlide({
  slide,
  isActive,
  transitionProgress = 0,
  activeIndex = 0,
  isDragging = false,
  reducedMotion: reducedProp,
  direction = 'idle',
  previousIndex = 0,
  onScenePhase,
  onPrimary,
  onSecondary,
}: OnboardingSlideProps) {
  const { t, i18n } = useTranslation()
  const prefersReduced = useReducedMotion()
  const reduced = reducedProp ?? prefersReduced ?? false
  const language = (i18n.language?.startsWith('ar') ? 'ar' : 'en') as Language

  const [enterKey, setEnterKey] = useState(0)
  const [titleFinal, setTitleFinal] = useState(false)
  const wasActive = useRef(isActive)

  useEffect(() => {
    if (isActive && !wasActive.current) {
      setEnterKey((k) => k + 1)
      setTitleFinal(false)
    }
    wasActive.current = isActive
  }, [isActive])

  const slideIndex = SLIDE_IDS.indexOf(slide.id)
  const dist = Math.abs(transitionProgress - slideIndex)
  const dragFade =
    isDragging && !reduced ? Math.max(0, 1 - dist * 1.2) : isActive ? 1 : 0.5

  const leavingForward =
    (!isActive && direction === 'forward' && previousIndex === slideIndex) ||
    (isDragging &&
      transitionProgress > slideIndex + 0.28 &&
      transitionProgress < slideIndex + 1.2)

  const fromPrev =
    isActive && previousIndex === slideIndex - 1 && direction !== 'backward'

  useEffect(() => {
    if (!isActive || reduced) {
      if (isActive && reduced) setTitleFinal(true)
      return
    }
    if (
      slide.scene === 'similar' ||
      slide.scene === 'listening' ||
      slide.scene === 'anonymous'
    ) {
      setTitleFinal(false)
      const id = window.setTimeout(() => setTitleFinal(true), 1400)
      return () => window.clearTimeout(id)
    }
  }, [isActive, enterKey, reduced, slide.scene])

  const handleHesitant = useCallback(
    (p: HesitantPhase) => onScenePhase?.(p),
    [onScenePhase],
  )

  const chrome = (
    title?: string,
    desc?: string,
    opts?: { titleFinal?: string; support?: string; showFinal?: boolean },
  ) => (
    <SceneChrome
      title={title ?? t(slide.titleKey)}
      titleFinal={opts?.titleFinal}
      description={desc ?? (slide.descriptionKey ? t(slide.descriptionKey) : undefined)}
      support={opts?.support}
      showFinal={opts?.showFinal}
      enterKey={enterKey}
      dragFade={dragFade}
      reducedMotion={reduced}
      isActive={isActive && !isDragging}
    />
  )

  if (slide.scene === 'feelings') {
    return (
      <SlideShell
        chrome={chrome(t('slides.feelings.title'), t('slides.feelings.titleLine2'))}
        visual={
          <div
            className="relative h-full overflow-hidden"
            style={{
              maskImage:
                'linear-gradient(to bottom, transparent 0%, black 8%, black 88%, transparent 100%)',
              WebkitMaskImage:
                'linear-gradient(to bottom, transparent 0%, black 8%, black 88%, transparent 100%)',
            }}
          >
            <FeelingStream
              isActive={isActive}
              reducedMotion={reduced}
              enterKey={enterKey}
              morphToField={leavingForward}
            />
          </div>
        }
      />
    )
  }

  if (slide.scene === 'hesitant') {
    return (
      <SlideShell
        chrome={chrome()}
        visual={
          <div className="flex h-full flex-col items-center justify-center">
            <HesitantWriting
              isActive={isActive}
              language={language}
              reducedMotion={reduced}
              enterKey={enterKey}
              fromCardMorph={fromPrev || previousIndex === SLIDE_IDS.indexOf('feelings')}
              shrinkToPulse={leavingForward}
              onPhaseChange={handleHesitant}
              onSkip={() => onScenePhase?.('done')}
            />
          </div>
        }
      />
    )
  }

  if (slide.scene === 'containment') {
    return (
      <SlideShell
        chrome={chrome(undefined, undefined, {
          support: isActive ? t('slides.containment.support') : undefined,
        })}
        visual={
          <div className="flex h-full flex-col items-center justify-center">
            <ContainmentMessage
              isActive={isActive}
              language={language}
              reducedMotion={reduced}
              enterKey={enterKey}
              morphToPoint={leavingForward}
              onPhaseChange={(p) => onScenePhase?.(p)}
            />
          </div>
        }
      />
    )
  }

  if (slide.scene === 'similar') {
    return (
      <SlideShell
        chrome={chrome(undefined, undefined, {
          titleFinal: t('slides.similar.titleFinal'),
          showFinal: titleFinal,
        })}
        visual={
          <SimilarField
            isActive={isActive}
            reducedMotion={reduced}
            enterKey={enterKey}
            transitionProgress={transitionProgress}
            activeIndex={activeIndex}
            isDragging={isDragging}
            morphToWave={leavingForward}
          />
        }
      />
    )
  }

  if (slide.scene === 'listening') {
    return (
      <SlideShell
        chrome={chrome(undefined, undefined, {
          titleFinal: t('slides.listening.titleFinal'),
          showFinal: titleFinal,
        })}
        visual={
          <ListeningWaves
            isActive={isActive}
            reducedMotion={reduced}
            enterKey={enterKey}
            morphToLines={leavingForward}
          />
        }
      />
    )
  }

  if (slide.scene === 'anonymous') {
    return (
      <SlideShell
        chrome={chrome(undefined, undefined, {
          titleFinal: t('slides.anonymous.titleFinal'),
          showFinal: titleFinal,
        })}
        visual={
          <AnonymousCard
            isActive={isActive}
            reducedMotion={reduced}
            enterKey={enterKey}
            morphToIcons={leavingForward}
            onPhaseChange={(p) => onScenePhase?.(p)}
          />
        }
      />
    )
  }

  if (slide.scene === 'rules') {
    return (
      <SlideShell
        chrome={chrome()}
        visual={
          <RulesArc
            isActive={isActive}
            reducedMotion={reduced}
            enterKey={enterKey}
            scatter={leavingForward}
            onRuleFocus={(i) => onScenePhase?.(`rule-${i}`)}
          />
        }
      />
    )
  }

  return (
    <SlideShell
      chrome={chrome()}
      visual={
        <FinaleGather
          isActive={isActive}
          reducedMotion={reduced}
          enterKey={enterKey}
          onPrimary={onPrimary}
          onSecondary={onSecondary}
        />
      }
    />
  )
}
