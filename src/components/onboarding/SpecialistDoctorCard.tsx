import { motion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import doctorPhoto from '../../assets/sessions/dr-mohammed.png'
import iconCalendar from '../../assets/sessions/icon-calendar.png'
import iconCurrency from '../../assets/sessions/icon-currency.png'
import iconPersons from '../../assets/sessions/icon-persons.png'
import iconQuality from '../../assets/sessions/icon-quality.png'
import iconStar from '../../assets/sessions/icon-star.png'

export interface SpecialistDoctorCardProps {
  name: string
  role: string
  rating: string
  price: string
  duration: string
  patientsLabel: string
  patientsValue: string
  experienceLabel: string
  experienceValue: string
  availabilityLabel: string
  availabilityValue: string
  /** Soft fade/scale for inner content after shell slides up */
  animateContent?: boolean
  contentDelay?: number
  reduced?: boolean
}

const softSettleEase = [0.22, 1, 0.36, 1] as const

/**
 * Specialist profile card — glass style matching the rest of onboarding UI.
 * Extra UI — does not replace the existing live-session card.
 */
export function SpecialistDoctorCard({
  name,
  role,
  rating,
  price,
  duration,
  patientsLabel,
  patientsValue,
  experienceLabel,
  experienceValue,
  availabilityLabel,
  availabilityValue,
  animateContent = false,
  contentDelay = 0,
  reduced = false,
}: SpecialistDoctorCardProps) {
  const { i18n } = useTranslation()
  const isRtl = i18n.language?.startsWith('ar') ?? true

  const fade = (extraDelay: number) =>
    animateContent && !reduced
      ? {
          initial: { opacity: 0, y: 8, scale: 0.96 },
          animate: { opacity: 1, y: 0, scale: 1 },
          transition: {
            duration: 0.4,
            ease: softSettleEase,
            delay: contentDelay + extraDelay,
          },
        }
      : {}

  return (
    <div
      className="w-full max-w-[340px] rounded-[24px] px-4 py-3.5"
      style={{
        background:
          'linear-gradient(145deg, rgba(255,255,255,0.96), rgba(237,243,253,0.92))',
        border: '1px solid rgba(255,255,255,0.7)',
        boxShadow: '0 10px 24px -14px rgba(143,131,255,0.3)',
      }}
    >
      <motion.div
        className="flex items-start gap-3"
        {...fade(0)}
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

        <div className="min-w-0 flex-1 text-start">
          <p className="truncate text-[15px] font-bold leading-tight text-[#8f83ff]">
            {name}
          </p>
          <p className="mt-0.5 text-[9px] leading-snug text-[#43368e]">
            {role}
          </p>
        </div>

        {/* Fixed LTR order so the star always sits on the left of the number,
            regardless of app language */}
        <div dir="ltr" className="flex shrink-0 items-center gap-1">
          <img
            src={iconStar}
            alt=""
            className="h-3 w-3 object-contain"
            draggable={false}
            aria-hidden
          />
          <span className="text-[12px] font-semibold text-[#43368e]">
            {rating}
          </span>
        </div>
      </motion.div>

      <motion.div
        className="mt-3 flex flex-row-reverse items-stretch gap-1 rounded-[16px] px-2 py-2.5"
        style={{ background: 'rgba(255,255,255,0.6)' }}
        {...fade(0.1)}
      >
        <div
          dir={isRtl ? 'rtl' : 'ltr'}
          className="flex min-w-0 flex-[1.7] items-center justify-center gap-0.5 whitespace-nowrap px-0.5"
        >
          {isRtl ? (
            <>
              <span className="text-[11px] font-bold leading-none text-[#8f83ff]">
                {price}
              </span>
              <img
                src={iconCurrency}
                alt=""
                className="h-[10px] w-[10px] shrink-0 object-contain"
                draggable={false}
                aria-hidden
              />
              <span className="text-[8px] leading-none text-[#43368e]">
                / {duration}
              </span>
            </>
          ) : (
            <>
              <img
                src={iconCurrency}
                alt=""
                className="h-[10px] w-[10px] shrink-0 object-contain"
                draggable={false}
                aria-hidden
              />
              <span className="text-[11px] font-bold leading-none text-[#8f83ff]">
                {price}
              </span>
              <span className="text-[8px] leading-none text-[#43368e]">
                / {duration}
              </span>
            </>
          )}
        </div>

        <Stat
          icon={iconPersons}
          label={patientsLabel}
          value={patientsValue}
          alignStart
        />
        <Stat
          icon={iconQuality}
          label={experienceLabel}
          value={experienceValue}
          alignStart
        />
        <Stat
          icon={iconCalendar}
          label={availabilityLabel}
          value={availabilityValue}
          alignStart
        />
      </motion.div>
    </div>
  )
}

function Stat({
  icon,
  label,
  value,
  alignStart = false,
}: {
  icon: string
  label: string
  value: string
  alignStart?: boolean
}) {
  return (
    <div
      className={`flex min-w-0 flex-1 flex-col justify-center gap-0.5 px-0.5 ${
        alignStart ? 'items-start text-start' : 'items-center text-center'
      }`}
    >
      <img
        src={icon}
        alt=""
        className="h-[11px] w-[11px] object-contain opacity-90"
        draggable={false}
        aria-hidden
      />
      <span className="text-[7px] font-bold leading-tight text-[#43368e]">{label}</span>
      <span className="text-[8px] font-normal leading-tight text-[#8f83ff]">
        {value}
      </span>
    </div>
  )
}
