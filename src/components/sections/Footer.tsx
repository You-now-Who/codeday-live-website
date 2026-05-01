interface FooterProps {
  contactEmail: string | null
  contactPhone: string | null
  discordUrl: string | null
}

export function Footer({ contactEmail, contactPhone, discordUrl }: FooterProps) {
  return (
    <footer className="bg-kraft text-primary border-t-4 border-primary">
      {/* Bunting banner */}
      <div className="w-full overflow-hidden h-6 flex items-end gap-0" aria-hidden>
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="flex-1 h-5"
            style={{
              background: i % 3 === 0 ? '#000' : i % 3 === 1 ? '#c3f400' : '#fff',
              clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
              border: '1px solid rgba(0,0,0,0.15)'
            }}
          />
        ))}
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8 flex flex-col sm:flex-row gap-8 sm:items-center justify-between">

        {/* Branding */}
        <div>
          <span className="font-epilogue font-black text-xs uppercase tracking-widest bg-secondary-fixed text-on-secondary-fixed px-2 py-1 inline-block stamp animate-peel">
            CODEDAY
          </span>
          <p className="font-grotesk text-xs uppercase tracking-widest text-primary/50 mt-2">
            London 2026
          </p>
        </div>

        {/* Links */}
        <nav className="flex flex-wrap gap-x-6 gap-y-2">
          {contactEmail && (
            <a
              href={`mailto:${contactEmail}`}
              className="font-grotesk text-sm text-primary/60 hover:text-primary underline decoration-dotted decoration-primary/30 hover:decoration-primary transition-colors flex items-center gap-1.5"
            >
              <svg width="14" height="12" viewBox="0 0 14 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <rect x="1" y="1" width="12" height="10" rx="1" />
                <polyline points="1,1 7,7 13,1" />
              </svg>
              {contactEmail}
            </a>
          )}
          {contactPhone && (
            <a
              href={`tel:${contactPhone.replace(/\s/g, '')}`}
              className="font-grotesk text-sm text-primary/60 hover:text-primary underline decoration-dotted decoration-primary/30 hover:decoration-primary transition-colors flex items-center gap-1.5"
            >
              <svg width="12" height="14" viewBox="0 0 12 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M2 1h3l1.5 3L5 5.5C5.8 7.2 6.8 8.2 8.5 9L10 7.5l3 1.5v3C13 12 11 13 9 12 5 10 2 7 1 3c-1-2 0-4 1-2z" />
              </svg>
              {contactPhone}
            </a>
          )}
          {discordUrl && (
            <a
              href={discordUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-grotesk text-sm text-primary/60 hover:text-primary underline decoration-dotted decoration-primary/30 hover:decoration-primary transition-colors flex items-center gap-1.5"
            >
              <svg width="14" height="12" viewBox="0 0 14 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M11 1C10 0.5 8.5 0 7 0S4 0.5 3 1C1.5 3 1 5 1 6s0.5 3 2 4l1-1c0.5 0.5 1.5 1 3 1s2.5-0.5 3-1l1 1c1.5-1 2-3 2-4s-0.5-3-2-5z" />
                <circle cx="5" cy="6" r="1" fill="currentColor" />
                <circle cx="9" cy="6" r="1" fill="currentColor" />
              </svg>
              Discord
            </a>
          )}
          <a
            href="https://codeday.org"
            target="_blank"
            rel="noopener noreferrer"
            className="font-grotesk text-sm text-primary/60 hover:text-primary underline decoration-dotted decoration-primary/30 hover:decoration-primary transition-colors flex items-center gap-1.5"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <line x1="2" y1="10" x2="10" y2="2" />
              <polyline points="4,2 10,2 10,8" />
            </svg>
            codeday.org
          </a>
        </nav>
      </div>
    </footer>
  )
}
