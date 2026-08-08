import { motion } from 'motion/react'
import { useTranslation } from 'react-i18next'

interface ProgressBarsProps {
  total: number
  current: number
  /** First slide: inactive tracks tint into the atmosphere instead of solid white */
  blendWithAtmosphere?: boolean
}

export function ProgressBars({
  total,
  current,
  blendWithAtmosphere = false,
}: ProgressBarsProps) {
  const { t, i18n } = useTranslation()
  const isRtl = i18n.language?.startsWith('ar') ?? true
  // Physical LTR row + reversed indices → stage 0 on the right, advances left (AR only)
  const indices = Array.from({ length: total }, (_, i) => i)
  if (isRtl) indices.reverse()

  return (
    <div
      dir="ltr"
      className="flex w-full items-center justify-center gap-1.5 px-8"
      role="progressbar"
      aria-valuenow={current + 1}
      aria-valuemin={1}
      aria-valuemax={total}
      aria-label={t('progressAria', { current: current + 1, total })}
    >
      {indices.map((i) => {
        const active = i === current
        return (
          <motion.span
            key={i}
            className="h-1 flex-1 max-w-[48px] rounded-full"
            style={{
              background: active
                ? '#9167ff'
                : blendWithAtmosphere
                  ? 'rgba(145,103,255,0.22)'
                  : 'rgba(255,255,255,0.55)',
              boxShadow: active
                ? '0 0 0 1px rgba(145,103,255,0.35)'
                : 'none',
            }}
            animate={{ opacity: active ? 1 : 0.85 }}
            transition={{ duration: 0.25 }}
          />
        )
      })}
    </div>
  )
}
