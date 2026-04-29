interface PageHeaderProps {
  title: string
  subtitle?: string
}

export function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <div className="relative overflow-hidden bg-secondary-fixed border-b-2 border-primary torn-edge-bottom px-8 pt-10 pb-20 mb-8 animate-fade-up">
      {/* Doodle: corner marks */}
      <svg
        className="absolute top-3 right-6 opacity-15 pointer-events-none"
        width="36" height="36" viewBox="0 0 36 36" fill="none"
        stroke="#161e00" strokeWidth="2.5" aria-hidden
      >
        <polyline points="10,4 4,4 4,10" />
        <polyline points="26,4 32,4 32,10" />
        <polyline points="4,26 4,32 10,32" />
        <polyline points="32,26 32,32 26,32" />
      </svg>
      {/* Doodle: small rotated asterisk */}
      <span
        className="absolute top-3 left-1/2 font-epilogue font-black text-4xl opacity-10 select-none pointer-events-none"
        style={{ transform: 'translateX(-50%) rotate(20deg)', color: '#161e00' }}
        aria-hidden
      >
        ✦
      </span>
      <h1 className="font-epilogue font-black text-5xl uppercase tracking-tight leading-none text-on-secondary-fixed">
        {title}
      </h1>
      {subtitle && (
        <p className="font-grotesk text-base mt-3 text-on-secondary-fixed opacity-70">{subtitle}</p>
      )}
    </div>
  )
}
