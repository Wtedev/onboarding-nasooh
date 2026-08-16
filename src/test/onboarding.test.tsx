import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderHook, act } from '@testing-library/react'
import '../i18n'
import { OnboardingFlow } from '../components/onboarding/OnboardingFlow'
import { STORAGE_KEYS } from '../data/onboardingContent'
import {
  readOnboardingDone,
  useOnboardingPersist,
} from '../hooks/useOnboardingPersist'

function mockReducedMotion(value: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: query.includes('prefers-reduced-motion') ? value : false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
}

async function goToStage(
  user: ReturnType<typeof userEvent.setup>,
  target: number,
) {
  if (target >= 1) {
    await user.click(
      await screen.findByRole('button', {
        name: /جولة في نصوح|Tour Nasouh|أنا هنا|I’m here|I'm here/i,
      }),
    )
    await screen.findByRole('button', { name: /اكتشف|Discover/i })
  }
  if (target >= 2) {
    await user.click(screen.getByRole('button', { name: /اكتشف|Discover/i }))
    await screen.findByRole('button', { name: /التالي|Next/i })
  }
  // stages 2–4: sessions → assessment → courses (Next)
  for (let s = 2; s < Math.min(target, 5); s++) {
    await user.click(screen.getByRole('button', { name: /التالي|Next/i }))
    if (s < 4) {
      await screen.findByRole('button', { name: /التالي|Next/i })
    } else {
      await screen.findByRole('button', { name: /إبدأ مع نصوح|Start with Nasouh/i })
    }
  }
}

describe('OnboardingFlow', () => {
  beforeEach(() => {
    localStorage.clear()
    mockReducedMotion(true)
  })

  it('shows six progress segments and skip', () => {
    render(<OnboardingFlow onComplete={() => {}} onSkip={() => {}} />)
    const bar = screen.getByRole('progressbar')
    expect(bar).toHaveAttribute('aria-valuemax', '6')
    expect(screen.getByRole('button', { name: /تخطي|Skip/i })).toBeInTheDocument()
  })

  it('calls onSkip', async () => {
    const user = userEvent.setup()
    const onSkip = vi.fn()
    render(<OnboardingFlow onComplete={() => {}} onSkip={onSkip} />)
    await user.click(screen.getByRole('button', { name: /تخطي|Skip/i }))
    expect(onSkip).toHaveBeenCalledTimes(1)
  })

  it('advances stages manually without waiting for motion', async () => {
    const user = userEvent.setup()
    render(<OnboardingFlow onComplete={() => {}} onSkip={() => {}} />)
    await goToStage(user, 1)
    expect(
      screen.getByText(/لست وحدك|You’re not alone|You're not alone/i),
    ).toBeInTheDocument()
  })

  it('supports back navigation', async () => {
    const user = userEvent.setup()
    render(<OnboardingFlow onComplete={() => {}} onSkip={() => {}} />)
    await goToStage(user, 1)
    await user.click(screen.getByRole('button', { name: /رجوع|Back/i }))
    expect(
      await screen.findByRole('button', {
        name: /جولة في نصوح|Tour Nasouh|أنا هنا|I’m here|I'm here/i,
      }),
    ).toBeInTheDocument()
  })

  it('opens each service as its own slide', async () => {
    const user = userEvent.setup()
    render(<OnboardingFlow onComplete={() => {}} onSkip={() => {}} />)
    await goToStage(user, 2)
    expect(
      screen.getByRole('heading', { name: /تحدث مع شخص|Talk with someone/i }),
    ).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /التالي|Next/i }))
    expect(
      await screen.findByRole('heading', {
        name: /افهم ما يحدث|Understand what’s|Understand what's/i,
      }),
    ).toBeInTheDocument()
  })

  it('finishes on the Nasouh companion CTA', async () => {
    const user = userEvent.setup()
    const onComplete = vi.fn()
    render(<OnboardingFlow onComplete={onComplete} onSkip={() => {}} />)
    await goToStage(user, 5)
    await user.click(
      screen.getByRole('button', { name: /إبدأ مع نصوح|Start with Nasouh/i }),
    )
    expect(onComplete).toHaveBeenCalledWith('companion')
  })

  it('does not request mic or camera permissions', () => {
    const getUserMedia = vi.fn()
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: { getUserMedia },
    })
    render(<OnboardingFlow onComplete={() => {}} onSkip={() => {}} />)
    expect(getUserMedia).not.toHaveBeenCalled()
  })
})

describe('persist', () => {
  beforeEach(() => localStorage.clear())

  it('stores completion and hides for returning users', () => {
    const { result } = renderHook(() => useOnboardingPersist())
    expect(readOnboardingDone()).toBe(false)
    act(() => result.current.complete('companion'))
    expect(localStorage.getItem(STORAGE_KEYS.done)).toBe('1')
    expect(localStorage.getItem(STORAGE_KEYS.choice)).toBe('companion')
    expect(readOnboardingDone()).toBe(true)
  })

  it('reset allows replay from settings', () => {
    const { result } = renderHook(() => useOnboardingPersist())
    act(() => {
      result.current.complete('sessions')
      result.current.reset()
    })
    expect(readOnboardingDone()).toBe(false)
  })
})
