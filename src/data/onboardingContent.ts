export type DestinationId =
  | 'companion'
  | 'calm'
  | 'assessment'
  | 'sessions'
  | 'home'

export type ServiceTab = 'sessions' | 'assessment' | 'courses' | 'companion'

export const SERVICE_TABS: ServiceTab[] = [
  'sessions',
  'assessment',
  'courses',
  'companion',
]

export const CHOICE_DESTINATIONS: Record<string, DestinationId> = {
  vent: 'companion',
  calm: 'calm',
  understand: 'assessment',
  specialist: 'sessions',
  explore: 'home',
}

export const ASSESSMENT_CARDS = [
  { id: 'anxiety', minutes: 3, questions: 7 },
  { id: 'mood', minutes: 4, questions: 9 },
  { id: 'attachment', minutes: 5, questions: 12 },
  { id: 'stress', minutes: 3, questions: 8 },
] as const

export const COURSE_CARDS = [
  { id: 'self', lessons: 8, minutes: 45 },
  { id: 'attachment', lessons: 6, minutes: 35 },
  { id: 'heavy', lessons: 5, minutes: 25 },
  { id: 'boundaries', lessons: 7, minutes: 40 },
  { id: 'sleep', lessons: 6, minutes: 30 },
  { id: 'calm', lessons: 5, minutes: 28 },
  { id: 'kindness', lessons: 7, minutes: 36 },
] as const

export type FallingFace = 'sad' | 'flat' | 'wavy' | 'soft' | 'tired'
export type FallingVariant = 'peach' | 'mint' | 'lilac' | 'sky' | 'rose' | 'cream'

/** 10 colloquial mood cards — soft pastel variants only (no dark ends). */
export const FALLING_CARDS = [
  { id: 'tooHeavy', face: 'tired', variant: 'peach' },
  { id: 'exploding', face: 'wavy', variant: 'rose' },
  { id: 'cantSay', face: 'flat', variant: 'lilac' },
  { id: 'drained', face: 'tired', variant: 'sky' },
  { id: 'wantPause', face: 'soft', variant: 'cream' },
  { id: 'tightChest', face: 'sad', variant: 'mint' },
  { id: 'innerHurt', face: 'sad', variant: 'peach' },
  { id: 'tooBig', face: 'flat', variant: 'lilac' },
  { id: 'needVent', face: 'soft', variant: 'rose' },
  { id: 'nothingMatters', face: 'wavy', variant: 'sky' },
] as const satisfies ReadonlyArray<{
  id: string
  face: FallingFace
  variant: FallingVariant
}>

export type FallingCardId = (typeof FALLING_CARDS)[number]['id']

export const FALLING_CARD_KEYS = FALLING_CARDS.map((c) => c.id)

export const SOLIDARITY_LABEL_KEYS = [
  'trying',
  'missing',
  'attachmentTired',
  'dontKnow',
  'needTalk',
  'returnSelf',
] as const

export const STORAGE_KEYS = {
  done: 'nasouh-onboarding-done',
  choice: 'nasouh-onboarding-choice',
  lang: 'nasouh-lang',
} as const
