import { motion } from 'motion/react'
import { useTranslation } from 'react-i18next'

interface ProgressIndicatorProps {
  total: number
  current: number
  onSelect?: (index: number) => void
}

export function ProgressIndicator({
  total,
  current,
  onSelect,
}: ProgressIndicatorProps) {
  const { t } = useTranslation()

  return (
    <div
      className="flex items-center justify-center gap-1.5"
      role="tablist"
      aria-label={t('progressAria', { current: current + 1, total })}
    >
      {Array.from({ length: total }, (_, index) => {
        const active = index === current
        return (
          <button
            key={index}
            type="button"
            role="tab"
            aria-selected={active}
            aria-label={t('progressAria', { current: index + 1, total })}
            onClick={() => onSelect?.(index)}
            className="flex h-6 items-center justify-center rounded-full px-0.5 focus-visible:outline-offset-2"
          >
            <motion.span
              className="relative block h-1.5 overflow-hidden rounded-full"
              style={
                active
                  ? {
                      background: 'linear-gradient(90deg, #8f83ff 0%, #8f83ff 100%)',
                    }
                  : {
                      background: 'rgba(143,131,255,0.18)',
                    }
              }
              animate={{ width: active ? 22 : 7 }}
              transition={{ type: 'spring', stiffness: 360, damping: 28 }}
            />
          </button>
        )
      })}
    </div>
  )
}
