import { useEffect, useState } from 'react'
import { ContactSheet } from './components/ContactSheet'
import { SoloCharacter } from './components/SoloCharacter'
import { GlassIconsSheet } from './components/GlassIconsSheet'
import { LanguageToggle } from './components/LanguageToggle'
import { OnboardingFlow } from './components/onboarding/OnboardingFlow'
import { PlaceholderScreen } from './screens/PlaceholderScreen'
import {
  readOnboardingDone,
  useOnboardingPersist,
} from './hooks/useOnboardingPersist'
import type { DestinationId } from './data/onboardingContent'

type AppView = 'onboarding' | 'placeholder'

export default function App() {
  const params =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search)
      : null
  if (params?.get('sheet') === '1') return <ContactSheet />
  if (params?.get('solo') === '1') return <SoloCharacter />
  if (params?.get('icons') === '1') return <GlassIconsSheet />
  return <AppShell />
}

function AppShell() {
  const { complete, reset } = useOnboardingPersist()
  const [view, setView] = useState<AppView | null>(null)

  useEffect(() => {
    setView(readOnboardingDone() ? 'placeholder' : 'onboarding')
  }, [])

  // Every real destination is stubbed out in this prototype — they all land
  // on the same placeholder screen.
  const finishTo = (dest: DestinationId) => {
    complete(dest)
    setView('placeholder')
  }

  const backToStart = () => {
    reset()
    setView('onboarding')
  }

  if (view === null) {
    return <main className="nasouh-app h-[100dvh] w-full" />
  }

  return (
    <main className="nasouh-app relative flex h-[100dvh] min-h-[100dvh] w-full items-center justify-center gap-3 overflow-hidden px-2">
      <div className="relative h-[100dvh] w-full max-w-[430px] overflow-hidden sm:h-[min(100dvh,920px)] sm:max-h-[920px] sm:rounded-[28px] sm:shadow-[0_24px_60px_-28px_rgba(143,131,255,0.35)]">
        {view === 'onboarding' && (
          <OnboardingFlow
            onComplete={(dest) => finishTo(dest)}
            onSkip={() => finishTo('home')}
          />
        )}
        {view === 'placeholder' && (
          <PlaceholderScreen onBackToStart={backToStart} />
        )}
      </div>

      <div className="hidden shrink-0 sm:block">
        <LanguageToggle exterior />
      </div>
      <div className="pointer-events-auto absolute bottom-[max(1rem,env(safe-area-inset-bottom))] end-3 z-50 sm:hidden">
        <LanguageToggle exterior />
      </div>
    </main>
  )
}
