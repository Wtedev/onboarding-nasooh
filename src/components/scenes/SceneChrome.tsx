import { motion, useReducedMotion } from 'motion/react'

interface SceneChromeProps {
  title: string
  titleFinal?: string
  description?: string
  support?: string
  showFinal?: boolean
  enterKey?: number
  dragFade?: number
  reducedMotion?: boolean
  isActive?: boolean
}

export function SceneChrome({
  title,
  titleFinal,
  description,
  support,
  showFinal = false,
  enterKey = 0,
  dragFade = 1,
  reducedMotion: reducedProp,
  isActive = true,
}: SceneChromeProps) {
  const prefersReduced = useReducedMotion()
  const reduced = reducedProp ?? prefersReduced ?? false
  const showFull = isActive

  const textTransition = reduced
    ? { duration: 0.15 }
    : { type: 'spring' as const, stiffness: 340, damping: 30, mass: 0.75 }

  const displayTitle = showFinal && titleFinal ? titleFinal : title

  return (
    <div
      className="relative z-20 w-full shrink-0 px-1 pb-3 pt-2 text-center"
      style={{ opacity: dragFade }}
    >
      <motion.h2
        key={`title-${enterKey}-${displayTitle}`}
        className="mx-auto max-w-[340px] text-[32px] font-bold leading-[1.2] tracking-tight short:text-[28px]"
        style={{
          color: '#1f2125',
          fontFamily: "'Lama Sans', sans-serif",
        }}
        initial={reduced || !showFull ? false : { opacity: 0, y: 10 }}
        animate={showFull ? { opacity: 1, y: 0 } : { opacity: dragFade }}
        transition={{ ...textTransition, delay: reduced ? 0 : 0.1 }}
      >
        {displayTitle}
      </motion.h2>
      {description && (
        <motion.p
          key={`desc-${enterKey}`}
          className="mx-auto mt-1.5 max-w-[320px] text-[16px] font-medium leading-[1.4] short:text-[15px]"
          style={{
            color: '#8f83ff',
            fontFamily: "'Lama Sans', sans-serif",
          }}
          initial={reduced || !showFull ? false : { opacity: 0, y: 8 }}
          animate={showFull ? { opacity: 1, y: 0 } : { opacity: dragFade * 0.85 }}
          transition={{ ...textTransition, delay: reduced ? 0 : 0.16 }}
        >
          {description}
        </motion.p>
      )}
      {support && (
        <motion.p
          className="mx-auto mt-2 max-w-[300px] text-[14px] font-normal leading-relaxed short:text-[12px]"
          style={{
            color: 'rgba(31,33,37,0.45)',
            fontFamily: "'Lama Sans', sans-serif",
          }}
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: showFull ? 1 : 0 }}
          transition={{ delay: reduced ? 0 : 0.4, duration: 0.3 }}
        >
          {support}
        </motion.p>
      )}
    </div>
  )
}
