export type Language = 'ar' | 'en'

export type NasouhMood = 'curious' | 'calm' | 'focused' | 'excited' | 'caring'

export type TransitionDirection = 'forward' | 'backward' | 'idle'

export type FaceExpression =
  | 'neutral'
  | 'curious'
  | 'listening'
  | 'thinking'
  | 'happy'
  | 'laughing'
  | 'caring'
  | 'concerned'
  | 'blinking'
  | 'processing'

export type FloatingVariant = 'none' | 'finale'

export type SlideScene =
  | 'feelings'
  | 'hesitant'
  | 'containment'
  | 'similar'
  | 'listening'
  | 'anonymous'
  | 'rules'
  | 'finale'

export type SharedMotif =
  | 'mood-card'
  | 'text-field'
  | 'incoming-message'
  | 'light-point'
  | 'connection-thread'
  | 'sound-wave'
  | 'identity-lines'
  | 'anonymous-bubble'
  | 'community-icons'

export interface SlideData {
  id: string
  titleKey: string
  descriptionKey: string
  mood: NasouhMood
  floating: FloatingVariant
  scene: SlideScene
}

export type ScenePhase =
  | 'idle'
  | 'typing'
  | 'listening'
  | 'silence'
  | 'reply'
  | 'done'
  | 'reveal'

export interface NasouhCharacterProps {
  mood: NasouhMood
  direction?: TransitionDirection
  isActive?: boolean
  reducedMotion?: boolean
  visualSign?: number
  glowPulse?: number
  expressionOverride?: FaceExpression
  className?: string
  shellScaleX?: number | { get(): number }
  shellScaleY?: number | { get(): number }
  layerOffsetX?: number | { get(): number }
  layerOffsetY?: number | { get(): number }
  glowScale?: number | { get(): number }
  shadowScale?: number | { get(): number }
  shadowOpacity?: number | { get(): number }
  faceScale?: number | { get(): number }
  idlePaused?: boolean
  onTap?: () => void
}
