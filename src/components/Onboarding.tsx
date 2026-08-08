import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { Swiper, SwiperSlide } from 'swiper/react'
import type { Swiper as SwiperInstance } from 'swiper'
import 'swiper/css'
import { slides } from '../data/slides'
import type { TransitionDirection } from '../types/onboarding'
import { NavigationControls } from './NavigationControls'
import { OnboardingSlide } from './OnboardingSlide'
import { ProgressIndicator } from './ProgressIndicator'
import { SlideAtmosphere } from './SlideAtmosphere'

export function Onboarding() {
  const { t, i18n } = useTranslation()
  const reduceMotion = useReducedMotion() ?? false
  const swiperRef = useRef<SwiperInstance | null>(null)
  const prevIndexRef = useRef(0)
  const lastVisualSignRef = useRef(0)

  const [activeIndex, setActiveIndex] = useState(0)
  const [previousIndex, setPreviousIndex] = useState(0)
  const [direction, setDirection] = useState<TransitionDirection>('idle')
  const [controlsKey, setControlsKey] = useState(0)
  const [completed, setCompleted] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [transitionProgress, setTransitionProgress] = useState(0)
  const [, setScenePhase] = useState('idle')

  const isRtl = i18n.language?.startsWith('ar') ?? true
  const isLast = activeIndex === slides.length - 1

  const goTo = useCallback((index: number) => {
    const clamped = Math.max(0, Math.min(slides.length - 1, index))
    swiperRef.current?.slideTo(clamped)
  }, [])

  const complete = useCallback(() => {
    window.setTimeout(() => setCompleted(true), reduceMotion ? 80 : 180)
  }, [reduceMotion])

  const goNext = useCallback(() => {
    const physical = isRtl ? 1 : -1
    lastVisualSignRef.current = physical
    if (isLast) {
      complete()
      return
    }
    window.setTimeout(() => {
      swiperRef.current?.slideNext()
    }, reduceMotion ? 40 : 90)
  }, [isLast, reduceMotion, isRtl, complete])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (completed) return
      if (event.key === 'ArrowRight') {
        event.preventDefault()
        goTo(isRtl ? activeIndex - 1 : activeIndex + 1)
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault()
        goTo(isRtl ? activeIndex + 1 : activeIndex - 1)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [activeIndex, completed, goTo, isRtl])

  useEffect(() => {
    const swiper = swiperRef.current
    if (!swiper) return
    swiper.changeLanguageDirection(isRtl ? 'rtl' : 'ltr')
    swiper.update()
  }, [isRtl])

  const updateFractionalFromSwiper = (swiper: SwiperInstance) => {
    const max = slides.length - 1
    setTransitionProgress(swiper.progress * max)
  }

  const handleSlideChange = (swiper: SwiperInstance) => {
    const next = swiper.activeIndex
    const prev = prevIndexRef.current
    let nextDirection: TransitionDirection = 'idle'
    if (next > prev) nextDirection = 'forward'
    else if (next < prev) nextDirection = 'backward'

    setDirection(nextDirection)
    setPreviousIndex(prev)
    setActiveIndex(next)
    setScenePhase('idle')
    setControlsKey((k) => k + 1)
    prevIndexRef.current = next

    window.setTimeout(() => {
      setDirection('idle')
      lastVisualSignRef.current = 0
    }, 700)
  }

  return (
    <div
      className="nasouh-stage relative mx-auto h-full w-full max-w-[430px] overflow-hidden"
      style={{
        height: '100%',
        minHeight: '100%',
        paddingTop: 'max(0.35rem, env(safe-area-inset-top))',
        paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom))',
      }}
    >
      <AnimatePresence mode="wait">
        {completed ? (
          <motion.div
            key="success"
            className="flex h-full flex-col items-center justify-center px-8 text-center"
            initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="mb-6 h-14 w-14 rounded-full"
              style={{
                background: 'linear-gradient(145deg, #a884ff, #9167ff)',
              }}
              aria-hidden="true"
            />
            <h1 className="text-[24px] font-medium text-nasouh-ink">{t('success')}</h1>
            <p className="mt-3 text-[15px] text-nasouh-ink/60">{t('successHint')}</p>
          </motion.div>
        ) : (
          <motion.div
            key="onboarding"
            className="relative h-full w-full"
            initial={false}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
          >
            <SlideAtmosphere
              activeIndex={activeIndex}
              transitionProgress={transitionProgress}
              isDragging={isDragging}
            />

            {/* Progress at top */}
            <div className="absolute inset-x-0 top-0 z-20 flex h-11 items-center justify-center px-5 pt-1">
              <ProgressIndicator
                total={slides.length}
                current={activeIndex}
                onSelect={goTo}
              />
            </div>

            <div
              className={`absolute inset-x-0 top-11 z-[1] ${
                isLast
                  ? 'bottom-[1rem] short:bottom-2'
                  : 'bottom-[5.5rem] short:bottom-[4.75rem]'
              }`}
            >
              <Swiper
                className="nasouh-swiper relative z-[1] h-full"
                dir={isRtl ? 'rtl' : 'ltr'}
                speed={reduceMotion ? 0 : 680}
                resistanceRatio={0.65}
                spaceBetween={0}
                onSwiper={(swiper) => {
                  swiperRef.current = swiper
                }}
                onSlideChange={handleSlideChange}
                onTouchStart={(swiper) => {
                  setIsDragging(true)
                  setPreviousIndex(swiper.activeIndex)
                }}
                onSliderMove={(swiper) => {
                  const diff = swiper.touches?.diff ?? 0
                  if (diff !== 0) lastVisualSignRef.current = Math.sign(diff)
                  updateFractionalFromSwiper(swiper)
                }}
                onSetTranslate={(swiper) => {
                  if (isDragging || swiper.animating) updateFractionalFromSwiper(swiper)
                }}
                onTouchEnd={() => {
                  setIsDragging(false)
                }}
                onTransitionStart={() => {
                  const s = swiperRef.current
                  if (s) updateFractionalFromSwiper(s)
                }}
                onTransitionEnd={(swiper) => {
                  setIsDragging(false)
                  setTransitionProgress(swiper.activeIndex)
                }}
              >
                {slides.map((slide, index) => (
                  <SwiperSlide key={slide.id} className="!h-full">
                    <OnboardingSlide
                      slide={slide}
                      isActive={index === activeIndex}
                      transitionProgress={transitionProgress}
                      activeIndex={activeIndex}
                      previousIndex={previousIndex}
                      isDragging={isDragging}
                      reducedMotion={reduceMotion}
                      direction={direction}
                      onScenePhase={setScenePhase}
                      onPrimary={complete}
                      onSecondary={complete}
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>

            {!isLast && (
              <motion.footer
                key={controlsKey}
                className="absolute inset-x-0 bottom-0 z-20 flex flex-col px-5 pb-1 pt-2"
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={
                  reduceMotion
                    ? { duration: 0.12 }
                    : { type: 'spring', stiffness: 320, damping: 30, delay: 0.12 }
                }
              >
                <NavigationControls
                  isLast={false}
                  onNext={goNext}
                  isRtl={isRtl}
                />
              </motion.footer>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
