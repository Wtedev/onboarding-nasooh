import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Mic, PhoneOff, Volume2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  ASSESSMENT_CARDS,
  COURSE_CARDS,
  type ServiceTab,
} from '../../data/onboardingContent'
import { useTypingTimeline, type TypingStep } from '../../hooks/useTypingTimeline'
import { SpecialistDoctorCard } from './SpecialistDoctorCard'
import doctorPhoto from '../../assets/sessions/dr-mohammed.png'
import nasouhOriginal from '../../assets/nasouh-moods/original.svg'

interface ServiceSlideProps {
  tab: ServiceTab
  isActive: boolean
  onContinue: () => void
  /** Last service slide uses the start-with-Nasouh CTA */
  isFinalService?: boolean
}

export function ServiceSlide({
  tab,
  isActive,
  onContinue,
  isFinalService = false,
}: ServiceSlideProps) {
  const { t } = useTranslation()
  if (!isActive) return null

  // Courses marquee is full-bleed; other tabs keep side padding
  const padded = tab !== 'courses'

  return (
    <div
      className={`relative flex h-full w-full flex-col ${padded ? 'px-5' : ''}`}
    >
      <div className="relative min-h-0 flex-1 overflow-hidden py-2">
        {tab === 'sessions' && <SessionsPanel />}
        {tab === 'assessment' && <AssessmentPanel />}
        {tab === 'courses' && <CoursesPanel active={isActive} />}
        {tab === 'companion' && <CompanionPanel active={isActive} />}
      </div>

      <div className={`shrink-0 pt-1 ${isFinalService ? 'pb-5' : 'pb-0'} ${padded ? '' : 'px-5'}`}>
        <button
          type="button"
          className="nasouh-cta mx-auto flex h-[52px] w-[62%] max-w-[225px] items-center justify-center rounded-full text-[15px] font-medium text-white"
          onClick={onContinue}
        >
          {isFinalService ? t('stages.services.cta') : t('stages.services.next')}
        </button>
      </div>
    </div>
  )
}

/** @deprecated Use ServiceSlide per tab */
export function StageServices(props: {
  isActive: boolean
  onContinue: () => void
  onInteract?: (interacting: boolean) => void
}) {
  return (
    <ServiceSlide
      tab="sessions"
      isActive={props.isActive}
      onContinue={props.onContinue}
    />
  )
}

function CallWaveform() {
  const peaks = [20, 28, 16, 32, 22, 30, 18, 26, 14, 32, 20, 24]
  const mids = [12, 16, 10, 18, 13, 16, 11, 14, 9, 20, 12, 14]
  const durations = [1.5, 1.9, 1.3, 2.1, 1.7, 1.4, 2.0, 1.6, 1.8, 1.2, 1.7, 1.5]
  const delays = [0.25, 0.9, 0.05, 0.6, 1.15, 0.35, 0.95, 0.15, 0.75, 0.45, 1.05, 0.55]

  return (
    <div className="flex h-11 items-end gap-[3px]" aria-hidden>
      {Array.from({ length: 12 }, (_, i) => (
        <motion.span
          key={i}
          className="w-[3px] rounded-full bg-[#8f83ff]"
          animate={{
            height: [5, peaks[i], mids[i], peaks[i] - 3, 5],
            opacity: [0.45, 0.95, 0.7, 0.9, 0.45],
          }}
          transition={{
            duration: durations[i],
            repeat: Infinity,
            repeatDelay: 0.35 + (i % 4) * 0.12,
            ease: 'easeInOut',
            delay: delays[i],
          }}
        />
      ))}
    </div>
  )
}

const GLASS_CARD = {
  background:
    'linear-gradient(145deg, rgba(255,255,255,0.82), rgba(237,243,253,0.55))',
  border: '1px solid rgba(255,255,255,0.5)',
  boxShadow: '0 10px 24px -14px rgba(143,131,255,0.3)',
} as const

/** Soft accelerating slide-up for app shells */
const softAccelEase = [0.55, 0.02, 0.88, 0.12] as const
/** Soft settle for content inside shells */
const softSettleEase = [0.22, 1, 0.36, 1] as const

function shellSlideUp(reduced: boolean, delay: number) {
  return {
    initial: (reduced ? false : { opacity: 0, y: 52 }) as
      | false
      | { opacity: number; y: number },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: reduced ? 0 : 0.58,
      ease: softAccelEase,
      delay: reduced ? 0 : delay,
    },
  }
}

function contentFadeIn(reduced: boolean, delay: number) {
  return {
    initial: (reduced ? false : { opacity: 0, y: 8, scale: 0.96 }) as
      | false
      | { opacity: number; y: number; scale: number },
    animate: { opacity: 1, y: 0, scale: 1 },
    transition: {
      duration: reduced ? 0 : 0.4,
      ease: softSettleEase,
      delay: reduced ? 0 : delay,
    },
  }
}

function SessionsPanel() {
  const { t, i18n } = useTranslation()
  const isRtl = i18n.language?.startsWith('ar') ?? true
  const reduced = useReducedMotion() ?? false
  const [secs, setSecs] = useState(9 * 3600 + 24 * 60)
  useEffect(() => {
    const id = window.setInterval(() => setSecs((s) => s + 1), 1000)
    return () => clearInterval(id)
  }, [])
  const hh = String(Math.floor(secs / 3600)).padStart(2, '0')
  const mm = String(Math.floor((secs % 3600) / 60)).padStart(2, '0')
  const ss = String(secs % 60).padStart(2, '0')

  const floatY = (delay: number, amount = 7) =>
    reduced
      ? {}
      : {
          animate: { y: [0, -amount, 0] },
          transition: {
            duration: 4.4,
            repeat: Infinity,
            ease: 'easeInOut' as const,
            delay,
          },
        }

  return (
    <div className="flex h-full flex-col items-center justify-center gap-1.5 overflow-y-auto text-center">
      <motion.h2
        className="text-[22px] font-bold text-[#8f83ff]"
        {...contentFadeIn(reduced, 0.04)}
      >
        {t('stages.services.sessions.title')}
      </motion.h2>
      <motion.p
        className="max-w-[300px] text-[12px] leading-snug text-[#43368e]"
        {...contentFadeIn(reduced, 0.1)}
      >
        {t('stages.services.sessions.description')}
      </motion.p>

      {/* Call 9:16 (right) · specialist (left) · partial overlap — float as one block */}
      <motion.div
        className="relative mx-auto w-full max-w-[320px] translate-y-5 will-change-transform"
        {...floatY(0.9, 4)}
      >
        <div className="relative z-0 ml-auto mr-[-12px] mt-4">
          <motion.div
            className="flex aspect-[9/16] w-[200px] flex-col justify-between overflow-hidden rounded-[24px] px-3.5 py-3"
            style={GLASS_CARD}
            {...shellSlideUp(reduced, 0.16)}
          >
            <motion.div
              className="relative flex flex-col items-center gap-1.5 pt-1"
              {...contentFadeIn(reduced, 0.42)}
            >
              <motion.div
                className="relative h-[52px] w-[52px] shrink-0 overflow-hidden rounded-full"
                style={{
                  background: 'linear-gradient(145deg,#71C8F6,#8f83ff)',
                  boxShadow: 'inset 0 0 0 2px rgba(255,255,255,0.65)',
                }}
                animate={
                  reduced
                    ? undefined
                    : {
                        scale: [1, 1.08, 1],
                        boxShadow: [
                          'inset 0 0 0 2px rgba(255,255,255,0.65), 0 0 0 0 rgba(143,131,255,0.35)',
                          'inset 0 0 0 2px rgba(255,255,255,0.65), 0 0 0 10px rgba(143,131,255,0)',
                          'inset 0 0 0 2px rgba(255,255,255,0.65), 0 0 0 0 rgba(143,131,255,0.35)',
                        ],
                      }
                }
                transition={
                  reduced
                    ? undefined
                    : { duration: 1.6, repeat: Infinity, ease: 'easeInOut' }
                }
              >
                <img
                  src={doctorPhoto}
                  alt=""
                  className="h-full w-full object-cover object-top"
                  draggable={false}
                />
              </motion.div>
              <div className="text-center">
                <p className="text-[14px] font-bold leading-tight text-[#8f83ff]">
                  {t('stages.services.sessions.name')}
                </p>
                <p className="mt-0.5 text-[10px] leading-tight text-[#43368e]">
                  {t('stages.services.sessions.role')}
                </p>
              </div>
            </motion.div>

            <motion.p
              className="text-center font-mono text-[22px] font-semibold tracking-wide text-[#8f83ff]"
              {...contentFadeIn(reduced, 0.5)}
              animate={
                reduced
                  ? { opacity: 1, y: 0, scale: 1 }
                  : { opacity: 1, y: 0, scale: [1, 1.04, 1] }
              }
              transition={
                reduced
                  ? { duration: 0.4, ease: softSettleEase, delay: 0.5 }
                  : {
                      opacity: { duration: 0.4, delay: 0.5 },
                      scale: { duration: 1.2, repeat: Infinity, ease: 'easeInOut', delay: 0.8 },
                    }
              }
            >
              {hh}:{mm}:{ss}
            </motion.p>

            <motion.div
              className="flex w-full flex-col gap-2.5"
              {...contentFadeIn(reduced, 0.58)}
            >
              <div className="flex w-full items-center justify-between gap-2">
                {!isRtl && <CallWaveform />}
                <motion.p
                  className="translate-y-1.5 text-[11px] font-medium text-[#43368e]"
                  animate={reduced ? undefined : { opacity: [0.55, 1, 0.55] }}
                  transition={
                    reduced
                      ? undefined
                      : { duration: 1.4, repeat: Infinity, ease: 'easeInOut' }
                  }
                >
                  {t('stages.services.sessions.speakingNow')}
                </motion.p>
                {isRtl && <CallWaveform />}
              </div>

              <div
                className="flex w-full items-center justify-around rounded-full px-2 py-1.5"
                style={{ background: 'rgba(255,255,255,0.6)' }}
              >
                {(
                  [
                    { Icon: Mic, label: t('stages.services.sessions.actions.mute') },
                    {
                      Icon: Volume2,
                      label: t('stages.services.sessions.actions.speaker'),
                    },
                    {
                      Icon: PhoneOff,
                      label: t('stages.services.sessions.actions.end'),
                    },
                  ] as const
                ).map(({ Icon, label }) => (
                  <div
                    key={label}
                    className="flex min-w-[52px] flex-col items-center gap-0.5 text-center"
                  >
                    <Icon
                      size={14}
                      color="#43368e"
                      strokeWidth={1.75}
                      aria-hidden
                    />
                    <span className="text-[9px] font-medium text-[#43368e]">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>

        <div className="absolute bottom-[100px] left-[-8px] z-10 w-[270px]">
          <motion.div {...shellSlideUp(reduced, 0.28)}>
            <SpecialistDoctorCard
              name={t('stages.services.sessions.doctor.name')}
              role={t('stages.services.sessions.doctor.role')}
              rating={t('stages.services.sessions.doctor.rating')}
              price={t('stages.services.sessions.doctor.price')}
              duration={t('stages.services.sessions.doctor.duration')}
              patientsLabel={t('stages.services.sessions.doctor.patients')}
              patientsValue={t('stages.services.sessions.doctor.patientsValue')}
              experienceLabel={t('stages.services.sessions.doctor.experience')}
              experienceValue={t('stages.services.sessions.doctor.experienceValue')}
              availabilityLabel={t('stages.services.sessions.doctor.availability')}
              availabilityValue={t(
                'stages.services.sessions.doctor.availabilityValue',
              )}
              animateContent
              contentDelay={0.48}
              reduced={reduced}
            />
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}

function AssessmentPanel() {
  const { t } = useTranslation()
  const reduced = useReducedMotion() ?? false
  const [front, setFront] = useState(0)
  const [phase, setPhase] = useState<'idle' | 'exit' | 'settle'>('idle')
  const count = ASSESSMENT_CARDS.length
  const busy = useRef(false)
  const timers = useRef<number[]>([])

  const clearTimers = () => {
    timers.current.forEach((id) => window.clearTimeout(id))
    timers.current = []
  }

  const advance = () => {
    if (busy.current || reduced) {
      if (reduced) setFront((f) => (f + 1) % count)
      return
    }
    busy.current = true
    setPhase('exit')
    // Front card exits with all its text, then stack settles with next card on top
    const t1 = window.setTimeout(() => {
      setFront((f) => (f + 1) % count)
      setPhase('settle')
      const t2 = window.setTimeout(() => {
        setPhase('idle')
        busy.current = false
      }, 320)
      timers.current.push(t2)
    }, 340)
    timers.current.push(t1)
  }

  useEffect(() => {
    if (reduced) {
      const id = window.setInterval(() => setFront((f) => (f + 1) % count), 2200)
      return () => clearInterval(id)
    }
    const id = window.setInterval(() => {
      if (!busy.current) advance()
    }, 2600)
    return () => {
      clearInterval(id)
      clearTimers()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count, reduced])

  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
      <motion.h2
        className="text-[24px] font-bold text-[#8f83ff]"
        initial={reduced ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.58, ease: softAccelEase }}
      >
        {t('stages.services.assessment.title')}
      </motion.h2>
      <motion.p
        className="max-w-[300px] text-[13px] leading-relaxed text-[#43368e]"
        initial={reduced ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.58,
          ease: softAccelEase,
          delay: reduced ? 0 : 0.06,
        }}
      >
        {t('stages.services.assessment.description')}
      </motion.p>

      {/* Stacked deck — whole card (title + desc + meta) moves as one unit */}
      <div className="relative mt-4 w-full max-w-[280px]">
        <div className="relative mx-auto min-h-[190px] w-full">
          {ASSESSMENT_CARDS.map((card, i) => {
            const depth = (i - front + count) % count
            const isFront = depth === 0
            const exiting = phase === 'exit' && isFront
            // While front exits, cards behind step forward by one depth
            const stackDepth =
              phase === 'exit' && !isFront ? Math.max(0, depth - 1) : depth
            // Exiting card leaves the stack; after front advances it becomes last
            const visibleDepth = exiting ? -1 : stackDepth
            const behind = visibleDepth >= 0 ? Math.min(visibleDepth, count - 1) : 0

            return (
              <motion.div
                key={card.id}
                className="absolute inset-x-0 top-0 cursor-pointer overflow-hidden rounded-[22px] px-4 py-4 text-start"
                style={{
                  background: '#FFFFFF',
                  border: '1px solid rgba(143,131,255,0.14)',
                  boxShadow:
                    isFront && phase === 'idle'
                      ? '0 12px 28px -16px rgba(67,54,142,0.28)'
                      : '0 8px 18px -14px rgba(67,54,142,0.18)',
                  transformOrigin: '50% 100%',
                  pointerEvents: isFront && phase === 'idle' ? 'auto' : 'none',
                }}
                initial={false}
                animate={
                  exiting
                    ? {
                        y: -56,
                        scale: 0.94,
                        opacity: 0,
                        zIndex: 40,
                      }
                    : {
                        y: behind * 11,
                        scale: 1 - behind * 0.045,
                        opacity: behind > 2 ? 0 : 1,
                        zIndex: 20 - behind,
                      }
                }
                transition={
                  reduced
                    ? { duration: 0 }
                    : exiting
                      ? { duration: 0.34, ease: softAccelEase }
                      : {
                          duration: phase === 'settle' ? 0.32 : 0.28,
                          ease: softSettleEase,
                          delay:
                            phase === 'exit' && !isFront
                              ? Math.min(depth, 3) * 0.03
                              : 0,
                        }
                }
                onClick={() => {
                  if (isFront && phase === 'idle') advance()
                }}
              >
                <p className="text-[15px] font-bold leading-snug text-[#8f83ff]">
                  {t(`stages.services.assessment.cards.${card.id}.title`)}
                </p>
                <p className="mt-2 text-[12px] leading-relaxed text-[#43368e]">
                  {t(`stages.services.assessment.cards.${card.id}.desc`)}
                </p>
                <p className="mt-3 text-[11px] font-medium text-[#8f83ff]">
                  {t('stages.services.assessment.minutes', {
                    count: card.minutes,
                  })}{' '}
                  ·{' '}
                  {t('stages.services.assessment.questions', {
                    count: card.questions,
                  })}
                </p>
              </motion.div>
            )
          })}
        </div>

        <div className="mt-5 flex items-center justify-center gap-1.5">
          {ASSESSMENT_CARDS.map((c, i) => (
            <span
              key={c.id}
              className="h-1.5 rounded-full"
              style={{
                width: i === front ? 18 : 6,
                background:
                  i === front ? '#8f83ff' : 'rgba(143,131,255,0.28)',
                transition: 'width 0.3s ease, background 0.3s ease',
              }}
              aria-hidden
            />
          ))}
        </div>
      </div>

      <p className="mt-2 text-[11px] text-[#43368e]">
        {t('stages.services.assessment.footnote')}
      </p>
    </div>
  )
}

function CourseTopicCard({
  card,
  progress,
}: {
  card: (typeof COURSE_CARDS)[number]
  progress: number
}) {
  const { t } = useTranslation()
  return (
    <div
      className="w-[250px] shrink-0 rounded-[22px] px-3.5 py-3.5 text-start"
      style={{
        background: '#FFFFFF',
        border: '1px solid rgba(143,131,255,0.14)',
        boxShadow: '0 10px 24px -14px rgba(67,54,142,0.24)',
      }}
    >
      <p className="text-[13px] font-bold text-[#8f83ff]">
        {t(`stages.services.courses.cards.${card.id}.title`)}
      </p>
      <p className="mt-1.5 text-[11px] leading-snug text-[#43368e]">
        {t(`stages.services.courses.cards.${card.id}.desc`)}
      </p>
      <div className="mt-3 h-1 overflow-hidden rounded-full bg-[#8f83ff]/15">
        <div
          className="h-full rounded-full bg-[#8f83ff]"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="mt-2 text-[10px] font-medium text-[#8f83ff]">
        {t('stages.services.courses.lessons', { count: card.lessons })} ·{' '}
        {t('stages.services.courses.minutes', { count: card.minutes })}
      </p>
    </div>
  )
}

function CoursesPanel({ active = true }: { active?: boolean }) {
  const { t, i18n } = useTranslation()
  const reduced = useReducedMotion() ?? false
  const isRtl = i18n.language?.startsWith('ar') ?? true
  const [settled, setSettled] = useState(false)
  const [running, setRunning] = useState(false)
  // Two identical strips — seamless loop, same 12px gap throughout
  const loop = [...COURSE_CARDS, ...COURSE_CARDS]

  // Wait for the slide camera transition (~0.85s) to finish before revealing
  useEffect(() => {
    if (!active) {
      setSettled(false)
      setRunning(false)
      return
    }
    const settleMs = reduced ? 280 : 850
    const id = window.setTimeout(() => setSettled(true), settleMs)
    return () => {
      window.clearTimeout(id)
      setSettled(false)
      setRunning(false)
    }
  }, [active, reduced])

  useEffect(() => {
    if (!settled || reduced) {
      setRunning(false)
      return
    }
    setRunning(true)
    return () => setRunning(false)
  }, [settled, reduced])

  const enter = (y: number, delay: number) =>
    reduced
      ? {
          initial: false as const,
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0 },
        }
      : {
          initial: { opacity: 0, y },
          animate: settled ? { opacity: 1, y: 0 } : { opacity: 0, y },
          transition: {
            duration: 0.62,
            ease: softSettleEase,
            delay: settled ? delay : 0,
          },
        }

  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
      <motion.h2
        className="shrink-0 px-5 text-[24px] font-bold text-[#8f83ff]"
        {...enter(14, 0)}
      >
        {t('stages.services.courses.title')}
      </motion.h2>
      <motion.p
        className="max-w-[300px] shrink-0 px-5 text-[13px] leading-relaxed text-[#43368e]"
        {...enter(12, 0.08)}
      >
        {t('stages.services.courses.description')}
      </motion.p>

      {/*
        Full-bleed strip. Soft transparent edge fade via mask.
        padding-inline-start keeps the first card inset like رجوع.
      */}
      <motion.div
        className="relative mt-3 w-full min-h-[140px] shrink-0 overflow-hidden"
        style={{
          direction: isRtl ? 'rtl' : 'ltr',
          paddingInlineStart: '1rem',
          WebkitMaskImage:
            'linear-gradient(to right, transparent 0%, black 14%, black 86%, transparent 100%)',
          maskImage:
            'linear-gradient(to right, transparent 0%, black 14%, black 86%, transparent 100%)',
        }}
        {...(reduced
          ? enter(0, 0)
          : {
              initial: { opacity: 0, y: 22 },
              animate: settled ? { opacity: 1, y: 0 } : { opacity: 0, y: 22 },
              transition: {
                duration: 0.72,
                ease: softSettleEase,
                delay: settled ? 0.16 : 0,
              },
            })}
      >
        {reduced ? (
          <div
            className="flex gap-3 overflow-x-auto pb-1"
            style={{ scrollSnapType: 'x mandatory' }}
          >
            {COURSE_CARDS.map((card, i) => (
              <div key={card.id} style={{ scrollSnapAlign: 'start' }}>
                <CourseTopicCard
                  card={card}
                  progress={28 + (i % 4) * 18}
                />
              </div>
            ))}
          </div>
        ) : (
          <div
            className={[
              'nasouh-courses-marquee',
              isRtl ? 'nasouh-courses-marquee-rtl' : '',
              running ? 'is-running' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            dir={isRtl ? 'rtl' : 'ltr'}
          >
            {loop.map((card, i) => (
              <CourseTopicCard
                key={`${card.id}-${i}`}
                card={card}
                progress={28 + (i % 4) * 18}
              />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}

function CompanionPanel({ active }: { active: boolean }) {
  const { t } = useTranslation()
  const reduced = useReducedMotion() ?? false
  const [text, setText] = useState('')
  const [contentBob, setContentBob] = useState(false)
  const [nasouhTyping, setNasouhTyping] = useState(false)
  const [reply, setReply] = useState(false)
  const [readyForReply, setReadyForReply] = useState(false)

  const draft1 = t('stages.services.companion.draft1')
  const draft2 = t('stages.services.companion.draft2')
  const draft3 = t('stages.services.companion.draft3')

  const steps: TypingStep[] = useMemo(
    () => [
      { action: 'type', text: draft1, baseDelay: 52 },
      { action: 'pause', duration: 520 },
      { action: 'delete', count: Array.from(draft1).length },
      { action: 'pause', duration: 280 },
      { action: 'type', text: draft2, baseDelay: 48 },
      // After "ما أعرف كيف أشرح" finishes: open slot, then show typing dots
      { action: 'pause', duration: 480 },
      { action: 'pause', duration: 80, emit: 'make-room' },
      { action: 'pause', duration: 420, emit: 'nasouh-typing' },
      { action: 'pause', duration: 900 },
      { action: 'delete', count: Array.from(draft2).length },
      { action: 'pause', duration: 280 },
      {
        action: 'type',
        text: draft3,
        baseDelay: 48,
        emit: 'nasouh-reply',
      },
      { action: 'pause', duration: 560 },
      { action: 'delete', count: Array.from(draft3).length },
      { action: 'hold', duration: 700 },
    ],
    [draft1, draft2, draft3],
  )

  useEffect(() => {
    if (!active) {
      setText('')
      setContentBob(false)
      setNasouhTyping(false)
      setReply(false)
      setReadyForReply(false)
    }
  }, [active])

  useTypingTimeline({
    steps,
    enabled: active && !reduced,
    reducedMotion: false,
    finalText: '',
    onText: setText,
    onEmit: (id) => {
      if (id === 'make-room') setContentBob(true)
      if (id === 'nasouh-typing') setNasouhTyping(true)
      if (id === 'nasouh-reply') {
        setNasouhTyping(false)
        setContentBob(false)
        setReply(true)
      }
    },
    onPhase: (p) => {
      if (p === 'sent') setReadyForReply(true)
    },
  })

  useEffect(() => {
    if (!readyForReply || reduced || reply) return
    const id = window.setTimeout(() => {
      setNasouhTyping(false)
      setContentBob(false)
      setReply(true)
    }, 550)
    return () => window.clearTimeout(id)
  }, [readyForReply, reduced, reply])

  useEffect(() => {
    if (active && reduced) {
      setText('')
      setContentBob(false)
      setNasouhTyping(false)
      setReply(true)
    }
  }, [active, reduced])

  // Open a reserved slot first, then fade typing in — avoids overlapping the description
  const slotOpen = !reduced && contentBob && !reply
  const glideEase = [0.4, 0.0, 0.2, 1] as const

  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
      <motion.img
        src={nasouhOriginal}
        alt={t('brand')}
        className="h-[88px] w-auto select-none object-contain will-change-transform"
        draggable={false}
        animate={
          reduced
            ? undefined
            : {
                // breathe (softer)
                scale: [1, 1.04, 1.015, 1.045, 1],
                // float
                y: [0, -10, -4, -12, 0],
              }
        }
        transition={
          reduced
            ? undefined
            : {
                duration: 5.2,
                repeat: Infinity,
                ease: 'easeInOut',
              }
        }
      />
      <span className="rounded-full bg-[#8f83ff]/12 px-2.5 py-1 text-[10px] font-medium text-[#8f83ff]">
        {t('stages.services.companion.badge')}
      </span>
      <h2 className="text-[24px] font-bold text-[#8f83ff]">
        {t('stages.services.companion.title')}
      </h2>
      <p className="max-w-[300px] text-[13px] leading-relaxed text-[#43368e]">
        {t('stages.services.companion.description')}
      </p>

      {/* Same width/alignment column as the input so avatar shares its left edge */}
      <div className="mt-1 flex w-full max-w-[280px] flex-col">
        <motion.div
          className="overflow-hidden"
          initial={false}
          animate={{
            height: reply ? 'auto' : slotOpen ? 40 : 0,
            marginBottom: reply || slotOpen ? 8 : 0,
          }}
          transition={{ duration: 0.55, ease: glideEase }}
        >
          <AnimatePresence mode="wait" initial={false}>
            {nasouhTyping && !reply && (
              <motion.div
                key="typing"
                dir="ltr"
                className="flex h-10 items-center justify-start"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 2 }}
                transition={{ duration: 0.4, ease: glideEase }}
                aria-hidden
              >
                <div
                  className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5"
                  style={GLASS_CARD}
                >
                  <img
                    src={nasouhOriginal}
                    alt=""
                    className="h-6 w-6 shrink-0 object-contain"
                    draggable={false}
                  />
                  <div className="flex items-center gap-1 px-0.5">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="h-1 w-1 rounded-full bg-[#8f83ff]"
                        animate={
                          reduced
                            ? { opacity: 0.7 }
                            : { opacity: [0.25, 1, 0.25], y: [0, -2, 0] }
                        }
                        transition={{
                          duration: 0.9,
                          repeat: Infinity,
                          ease: 'easeInOut',
                          delay: i * 0.16,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {reply && (
              <motion.div
                key="reply"
                dir="ltr"
                className="flex items-end gap-2"
                initial={reduced ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: glideEase }}
              >
                <img
                  src={nasouhOriginal}
                  alt=""
                  className="h-10 w-10 shrink-0 object-contain"
                  draggable={false}
                  aria-hidden
                />
                <p
                  dir="rtl"
                  className="max-w-[200px] rounded-2xl rounded-bl-md px-3.5 py-2.5 text-start text-[12px] leading-relaxed text-white"
                  style={{ background: '#8f83ff' }}
                >
                  {t('stages.services.companion.reply')}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <div
          className="flex h-11 w-full items-center gap-2 rounded-full px-4 text-[12px] text-[#43368e]"
          style={GLASS_CARD}
          aria-hidden
        >
          <span className="min-w-0 flex-1 truncate text-start">
            {text || (reduced ? '' : '…')}
          </span>
          <Mic
            size={16}
            color="#8f83ff"
            strokeWidth={1.75}
            className="shrink-0"
            aria-hidden
          />
        </div>
      </div>
    </div>
  )
}
