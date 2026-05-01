interface PageHeaderProps {
  title: string
  subtitle?: string
}

export function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <div className="relative overflow-hidden bg-secondary-fixed border-b-2 border-primary torn-edge-bottom px-8 pt-10 pb-20 mb-8 animate-fade-up">
      {/* Paperclip top-right */}
      <svg className="absolute top-4 right-6 opacity-30 pointer-events-none" width="16" height="36" viewBox="0 0 16 36" fill="none" stroke="#161e00" strokeWidth="2" strokeLinecap="round" aria-hidden>
        <path d="M8 2 C14 2 14 10 14 10 L14 28 C14 34 2 34 2 28 L2 8 C2 4 6 2 8 2 Z" />
        <line x1="8" y1="10" x2="8" y2="28" />
      </svg>

      {/* Scissors left side */}
      <svg className="absolute pointer-events-none opacity-15" style={{ left: '1.5rem', top: '25%' }} width="32" height="15" viewBox="0 0 44 20" fill="none" stroke="#161e00" strokeWidth="1.5" aria-hidden>
        <circle cx="8" cy="7" r="4" />
        <circle cx="8" cy="13" r="4" />
        <line x1="11" y1="5" x2="42" y2="2" />
        <line x1="11" y1="15" x2="42" y2="18" />
      </svg>

      {/* Title — paper cut-out with tape */}
      <div className="relative inline-block bg-white border-2 border-primary shadow-paper rotate-[-1deg] px-5 py-3 tape">
        <h1 className="font-epilogue font-black text-5xl uppercase tracking-tight leading-none text-primary">
          {title}
        </h1>
      </div>

      {/* Subtitle — sticky note */}
      {subtitle && (
        <div className="inline-block sticky-note px-3 py-2 text-xs font-grotesk mt-4 rotate-[0.5deg] ml-4">
          {subtitle}
        </div>
      )}
    </div>
  )
}
