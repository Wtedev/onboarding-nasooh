import { GlassIconsGallery } from './FloatingElements'

/** Glass icons QA sheet — open with ?icons=1 */
export function GlassIconsSheet() {
  return (
    <div
      className="flex min-h-[100dvh] w-full flex-col items-center justify-center px-4 py-10"
      style={{
        background:
          'radial-gradient(ellipse at 50% 28%, rgba(111,140,244,0.1), transparent 44%), linear-gradient(180deg, #F3F6FE 0%, #EDF3FD 52%, #F7F9FE 100%)',
      }}
    >
      <h1 className="mb-8 text-center text-lg font-medium tracking-tight text-nasouh-ink">
        Nasouh — Glass Icons
      </h1>
      <div
        className="w-full max-w-3xl rounded-[28px] px-4 py-8"
        style={{
          background: 'rgba(255,255,255,0.35)',
          boxShadow: '0 20px 50px -28px rgba(115,141,244,0.35)',
        }}
      >
        <GlassIconsGallery />
      </div>
    </div>
  )
}
