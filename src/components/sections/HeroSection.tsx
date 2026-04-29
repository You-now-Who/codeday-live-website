import { Countdown } from '@/components/ui/Countdown'

interface HeroSectionProps {
  config: {
    eventName: string
    submissionDeadline: string
  }
}

export function HeroSection({ config }: HeroSectionProps) {
  return (
    <div className="relative overflow-hidden bg-secondary-fixed border-b-2 border-primary torn-edge-bottom px-8 pt-12 pb-24">

      {/* Doodle: large rotated asterisk top-right */}
      <span
        className="absolute top-3 right-10 font-epilogue font-black text-8xl opacity-10 select-none pointer-events-none animate-spin-slow"
        style={{ color: 'var(--color-on-secondary-fixed, #161e00)' }}
        aria-hidden
      >
        ✦
      </span>

      {/* Doodle: stacked squares bottom-right */}
      <svg
        className="absolute bottom-14 right-6 opacity-15 animate-float-b pointer-events-none"
        width="48" height="48" viewBox="0 0 48 48" fill="none"
        stroke="#161e00" strokeWidth="3" aria-hidden
      >
        <rect x="4"  y="4"  width="18" height="18" />
        <rect x="16" y="16" width="18" height="18" />
        <rect x="28" y="4"  width="12" height="12" />
      </svg>

      {/* Doodle: small cross marks top-left corner */}
      <svg
        className="absolute top-4 left-4 opacity-20 pointer-events-none"
        width="40" height="40" viewBox="0 0 40 40" fill="none"
        stroke="#161e00" strokeWidth="2.5" aria-hidden
      >
        <line x1="8"  y1="5"  x2="8"  y2="15" />
        <line x1="3"  y1="10" x2="13" y2="10" />
        <line x1="28" y1="20" x2="28" y2="30" />
        <line x1="23" y1="25" x2="33" y2="25" />
        <circle cx="22" cy="8" r="2" fill="#161e00" />
      </svg>

      {/* Doodle: wavy underline accent */}
      <svg
        className="absolute left-8 opacity-20 pointer-events-none"
        style={{ top: '6.5rem' }}
        width="200" height="10" viewBox="0 0 200 10" fill="none"
        stroke="#161e00" strokeWidth="2.5" aria-hidden
      >
        <path d="M0 5 C20 0, 40 10, 60 5 C80 0, 100 10, 120 5 C140 0, 160 10, 180 5 C190 1, 198 7, 200 5" />
      </svg>

      {/* Content */}
      <div className="relative animate-fade-up">
        <h1 className="font-epilogue font-black text-6xl uppercase tracking-tight leading-none mb-8 text-on-secondary-fixed">
          {config.eventName}
        </h1>
        <p className="font-grotesk text-xs uppercase tracking-widest text-on-secondary-fixed/60 mb-3">
          SUBMISSION DEADLINE
        </p>
        <Countdown targetDate={config.submissionDeadline} />
      </div>
    </div>
  )
}
