import type { SlideData } from '../types/onboarding'

export const slides: SlideData[] = [
  {
    id: 'feelings',
    titleKey: 'slides.feelings.title',
    descriptionKey: 'slides.feelings.description',
    mood: 'curious',
    floating: 'none',
    scene: 'feelings',
  },
  {
    id: 'hesitant',
    titleKey: 'slides.hesitant.title',
    descriptionKey: 'slides.hesitant.description',
    mood: 'calm',
    floating: 'none',
    scene: 'hesitant',
  },
  {
    id: 'containment',
    titleKey: 'slides.containment.title',
    descriptionKey: 'slides.containment.description',
    mood: 'caring',
    floating: 'none',
    scene: 'containment',
  },
  {
    id: 'similar',
    titleKey: 'slides.similar.title',
    descriptionKey: 'slides.similar.description',
    mood: 'curious',
    floating: 'none',
    scene: 'similar',
  },
  {
    id: 'listening',
    titleKey: 'slides.listening.title',
    descriptionKey: 'slides.listening.description',
    mood: 'calm',
    floating: 'none',
    scene: 'listening',
  },
  {
    id: 'anonymous',
    titleKey: 'slides.anonymous.title',
    descriptionKey: 'slides.anonymous.description',
    mood: 'focused',
    floating: 'none',
    scene: 'anonymous',
  },
  {
    id: 'rules',
    titleKey: 'slides.rules.title',
    descriptionKey: 'slides.rules.description',
    mood: 'caring',
    floating: 'none',
    scene: 'rules',
  },
  {
    id: 'finale',
    titleKey: 'slides.finale.title',
    descriptionKey: 'slides.finale.description',
    mood: 'caring',
    floating: 'finale',
    scene: 'finale',
  },
]

export const SLIDE_IDS = slides.map((s) => s.id)

export const MOTIF_BRIDGES: { from: string; to: string; motif: string }[] = [
  { from: 'feelings', to: 'hesitant', motif: 'mood-card' },
  { from: 'hesitant', to: 'containment', motif: 'text-field' },
  { from: 'containment', to: 'similar', motif: 'incoming-message' },
  { from: 'similar', to: 'listening', motif: 'connection-thread' },
  { from: 'listening', to: 'anonymous', motif: 'sound-wave' },
  { from: 'anonymous', to: 'rules', motif: 'anonymous-bubble' },
  { from: 'rules', to: 'finale', motif: 'community-icons' },
]
