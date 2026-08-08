import type { FaceExpression, NasouhMood } from '../types/onboarding'
import { NasouhCharacter } from './NasouhCharacter'

const EXPRESSIONS: { expression: FaceExpression; mood: NasouhMood; label: string }[] = [
  { expression: 'neutral', mood: 'curious', label: 'neutral' },
  { expression: 'curious', mood: 'curious', label: 'curious' },
  { expression: 'listening', mood: 'calm', label: 'listening' },
  { expression: 'thinking', mood: 'focused', label: 'thinking' },
  { expression: 'happy', mood: 'excited', label: 'happy' },
  { expression: 'laughing', mood: 'excited', label: 'laughing' },
  { expression: 'caring', mood: 'caring', label: 'caring' },
  { expression: 'concerned', mood: 'focused', label: 'concerned' },
  { expression: 'processing', mood: 'focused', label: 'processing' },
  { expression: 'blinking', mood: 'curious', label: 'blinking' },
]

export function ContactSheet() {
  return (
    <div
      className="min-h-[100dvh] w-full overflow-x-hidden px-5 py-8 text-nasouh-ink"
      style={{
        background:
          'radial-gradient(ellipse at 50% 20%, rgba(111,140,244,0.08), transparent 45%), linear-gradient(180deg, #F3F6FE, #EDF3FD)',
      }}
    >
      <h1 className="mb-8 text-center text-lg font-medium tracking-tight">
        Nasouh — Contact Sheet
      </h1>
      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {EXPRESSIONS.map(({ expression, mood, label }) => (
          <div
            key={expression}
            className="flex flex-col items-center rounded-3xl px-3 pb-4 pt-3"
            style={{
              background: 'rgba(247,250,255,0.65)',
              boxShadow: '0 12px 32px -20px rgba(115,141,244,0.35)',
            }}
          >
            <NasouhCharacter
              mood={mood}
              isActive
              reducedMotion
              expressionOverride={expression}
              className="!h-[200px] !w-[200px] sm:!h-[220px] sm:!w-[220px]"
            />
            <span className="mt-1 text-[12px] font-medium tracking-wide text-nasouh-ink/55">
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
