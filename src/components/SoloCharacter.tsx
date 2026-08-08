import { NasouhCharacter } from './NasouhCharacter'

/** Large solo character for material QA — open with ?solo=1 */
export function SoloCharacter() {
  return (
    <div
      className="flex min-h-[100dvh] w-full items-center justify-center"
      style={{
        background:
          'radial-gradient(ellipse at 50% 40%, rgba(111,140,244,0.08), transparent 50%), #EDF3FD',
      }}
    >
      <NasouhCharacter
        mood="curious"
        isActive
        expressionOverride="curious"
        className="!h-[420px] !w-[420px]"
      />
    </div>
  )
}
