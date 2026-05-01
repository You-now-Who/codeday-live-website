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

      {/* Doodle: scissors top-left */}
      <svg className="absolute top-4 left-4 opacity-30 pointer-events-none" width="44" height="20" viewBox="0 0 44 20" fill="none" stroke="#161e00" strokeWidth="1.5" aria-hidden>
        <circle cx="8" cy="7" r="4" />
        <circle cx="8" cy="13" r="4" />
        <line x1="11" y1="5" x2="42" y2="2" />
        <line x1="11" y1="15" x2="42" y2="18" />
      </svg>

      {/* Doodle: yarn ball bottom-right */}
      <svg className="absolute bottom-16 right-8 opacity-20 animate-float-b pointer-events-none" width="52" height="52" viewBox="0 0 52 52" fill="none" stroke="#161e00" strokeWidth="1.5" aria-hidden>
        <circle cx="26" cy="26" r="22" />
        <path d="M8 18 Q26 8 44 18" />
        <path d="M6 26 Q26 36 46 26" />
        <path d="M8 34 Q26 44 44 34" />
        <path d="M16 6 Q8 26 16 46" />
        <path d="M26 4 Q36 26 26 48" />
      </svg>

      {/* Doodle: star sticker top-right */}
      <svg className="absolute top-6 right-12 opacity-25 animate-spin-slow pointer-events-none" width="40" height="40" viewBox="0 0 40 40" fill="#161e00" aria-hidden>
        <polygon points="20,2 24,15 38,15 27,23 31,37 20,29 9,37 13,23 2,15 16,15" />
      </svg>

      {/* Doodle: dotted cut line left side */}
      <svg className="absolute left-8 opacity-15 pointer-events-none" style={{ top: '5rem' }} width="220" height="12" viewBox="0 0 220 12" fill="none" stroke="#161e00" strokeWidth="1.5" strokeDasharray="4 4" aria-hidden>
        <path d="M0 6 L220 6" />
      </svg>

      {/* Content */}
      <div className="relative animate-fade-up flex flex-col md:flex-row md:items-start gap-8">
        {/* Event name — paper cut-out with tape */}
        <div className="relative inline-block bg-white border-2 border-primary shadow-paper-lg rotate-[-1.5deg] px-6 py-4 tape">
          <h1 className="font-epilogue font-black text-6xl uppercase tracking-tight leading-none text-primary">
            {config.eventName}
          </h1>
        </div>

        {/* Countdown — sticky note with pin */}
        <div className="relative inline-block sticky-note border border-primary/20 px-5 py-4 mt-8 rotate-[1deg] pin">
          <p className="font-grotesk text-xs uppercase tracking-widest text-on-surface/60 mb-2">
            Submission Deadline
          </p>
          <Countdown targetDate={config.submissionDeadline} />
        </div>
      </div>
    </div>
  )
}
