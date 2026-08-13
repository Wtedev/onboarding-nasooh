import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
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
import nasouhExcited from '../../assets/nasouh-moods/excited.svg'
import nasouhOriginal from '../../assets/nasouh-moods/original.svg'

interface ServiceSlideProps {
  tab: ServiceTab
  isActive: boolean
  onContinue: () => void
  /** Last service slide uses the “choose your start” CTA */
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
  return (
    <div className="flex h-7 items-end gap-[2.5px]" aria-hidden>
      {Array.from({ length: 10 }, (_, i) => (
        <motion.span
          key={i}
          className="w-[2.5px] rounded-full bg-[#8f83ff]"
          animate={{ height: [5, 10 + (i % 3) * 2, 5] }}
          transition={{
            duration: 1.5 + (i % 4) * 0.15,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.05,
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

      {/* Call 9:16 (right) · specialist (left) · partial overlap */}
      <div className="relative mx-auto w-full max-w-[320px] translate-y-5">
        {/* Shell: slide up */}
        <motion.div
          className="relative z-0 ml-auto mr-[-12px] mt-4 flex aspect-[9/16] w-[200px] flex-col justify-between overflow-hidden rounded-[24px] px-3.5 py-3"
          style={GLASS_CARD}
          {...shellSlideUp(reduced, 0.16)}
        >
          {/* Inner: soft fade / scale */}
          <motion.div
            className="relative flex flex-col items-center gap-1.5 pt-1"
            {...contentFadeIn(reduced, 0.42)}
          >
            <div
              className="relative h-[52px] w-[52px] shrink-0 overflow-hidden rounded-full"
              style={{
                background: 'linear-gradient(145deg,#71C8F6,#8f83ff)',
                boxShadow: 'inset 0 0 0 2px rgba(255,255,255,0.65)',
              }}
            >
              <img
                src={doctorPhoto}
                alt=""
                className="h-full w-full object-cover object-top"
                draggable={false}
              />
            </div>
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
          >
            {hh}:{mm}:{ss}
          </motion.p>

          <motion.div
            className="flex w-full flex-col gap-2.5"
            {...contentFadeIn(reduced, 0.58)}
          >
            <div className="flex w-full items-center justify-between gap-2">
              {!isRtl && <CallWaveform />}
              <p className="text-[11px] font-medium text-[#43368e]">
                {t('stages.services.sessions.speakingNow')}
              </p>
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

        {/* Specialist shell: slide up · content fades inside */}
        <motion.div
          className="absolute bottom-[100px] left-[-8px] z-10 w-[270px]"
          {...shellSlideUp(reduced, 0.28)}
        >
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
    </div>
  )
}

function AssessmentPanel() {
  const { t } = useTranslation()
  const reduced = useReducedMotion() ?? false
  const [front, setFront] = useState(0)
  const [sending, setSending] = useState(false)
  const count = ASSESSMENT_CARDS.length
  const busy = useRef(false)

  const advance = () => {
    if (busy.current) return
    if (reduced) {
      setFront((f) => (f + 1) % count)
      return
    }
    busy.current = true
    setSending(true)
    window.setTimeout(() => {
      setFront((f) => (f + 1) % count)
      setSending(false)
      busy.current = false
    }, 280)
  }

  useEffect(() => {
    const id = window.setInterval(advance, 2200)
    return () => clearInterval(id)
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

      {/* Stacked deck — front rises gently, settles behind */}
      <div className="relative mt-4 w-full max-w-[280px]">
        <div className="relative mx-auto h-[168px] w-full">
          {ASSESSMENT_CARDS.map((card, i) => {
            const depth = (i - front + count) % count
            const isFront = depth === 0
            const isFlying = sending && isFront
            const visualDepth =
              sending && depth > 0 ? depth - 1 : sending && isFront ? count : depth
            const show = visualDepth < count
            const stepDelay =
              sending && depth > 0 ? Math.min(depth, 3) * 0.02 : 0

            return (
              <motion.div
                key={card.id}
                className="absolute inset-x-0 top-0 cursor-pointer rounded-[22px] px-4 py-4 text-start"
                style={{
                  background: '#FFFFFF',
                  border: '1px solid rgba(143,131,255,0.14)',
                  boxShadow:
                    isFront && !sending
                      ? '0 12px 28px -16px rgba(67,54,142,0.28)'
                      : '0 8px 18px -14px rgba(67,54,142,0.18)',
                  transformOrigin: '50% 80%',
                  pointerEvents: isFront && !sending ? 'auto' : 'none',
                }}
                initial={false}
                animate={
                  isFlying
                    ? {
                        x: 0,
                        y: -38,
                        rotate: 0,
                        scale: 0.97,
                        opacity: 0.78,
                        zIndex: 30,
                      }
                    : {
                        x: 0,
                        y: Math.min(visualDepth, 3) * 10,
                        rotate: 0,
                        scale: 1 - Math.min(visualDepth, 3) * 0.04,
                        opacity: show ? 1 : 0,
                        zIndex: 20 - visualDepth,
                      }
                }
                transition={
                  reduced
                    ? { duration: 0 }
                    : isFlying
                      ? {
                          duration: 0.28,
                          ease: softAccelEase,
                        }
                      : {
                          duration: 0.24,
                          ease: [0.22, 1, 0.36, 1],
                          delay: stepDelay,
                        }
                }
                onClick={() => {
                  if (isFront && !sending) advance()
                }}
              >
                <p className="text-[15px] font-bold text-[#8f83ff]">
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

        <div className="mt-4 flex items-center justify-center gap-1.5">
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
      { action: 'pause', duration: 380 },
      { action: 'type', text: draft2, baseDelay: 48, emit: 'nasouh-typing' },
      { action: 'pause', duration: 560 },
      { action: 'delete', count: Array.from(draft2).length },
      { action: 'pause', duration: 320 },
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
      if (id === 'nasouh-typing') setNasouhTyping(true)
      if (id === 'nasouh-reply') {
        setNasouhTyping(false)
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
      setReply(true)
    }, 550)
    return () => window.clearTimeout(id)
  }, [readyForReply, reduced, reply])

  useEffect(() => {
    if (active && reduced) {
      setText('')
      setNasouhTyping(false)
      setReply(true)
    }
  }, [active, reduced])

  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
      <img
        src={nasouhExcited}
        alt={t('brand')}
        className="h-[88px] w-auto select-none object-contain"
        draggable={false}
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

      <div className="mt-1 flex min-h-[44px] w-full max-w-[280px] flex-col items-start gap-2">
        {nasouhTyping && !reply && (
          <motion.div
            className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5"
            style={GLASS_CARD}
            initial={reduced ? false : { opacity: 0, scale: 0.9 }}
            animate={
              reduced
                ? { opacity: 1 }
                : { opacity: [0.4, 1, 0.4], scale: 1 }
            }
            transition={
              reduced
                ? { duration: 0 }
                : { opacity: { duration: 1.35, repeat: Infinity, ease: 'easeInOut' } }
            }
            aria-hidden
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
          </motion.div>
        )}

        {reply && (
          <div className="flex w-full items-end gap-2">
            <motion.img
              src={nasouhOriginal}
              alt=""
              className="h-10 w-10 shrink-0 object-contain"
              draggable={false}
              initial={reduced ? false : { opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35, ease: softSettleEase }}
              aria-hidden
            />
            <motion.p
              className="max-w-[68%] rounded-2xl rounded-br-md px-3.5 py-2.5 text-start text-[12px] leading-relaxed text-white"
              style={{ background: '#8f83ff' }}
              initial={reduced ? false : { opacity: 0, scale: 0.94, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.45, ease: softSettleEase }}
            >
              {t('stages.services.companion.reply')}
            </motion.p>
          </div>
        )}
      </div>

      <div
        className="mt-1 flex h-11 w-full max-w-[280px] items-center gap-2 rounded-full px-4 text-[12px] text-[#43368e]"
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
  )
}
