interface FooterProps {
  contactEmail: string | null
  contactPhone: string | null
  discordUrl: string | null
}

export function Footer({ contactEmail, contactPhone, discordUrl }: FooterProps) {
  return (
    <footer className="bg-primary text-on-primary border-t-2 border-on-primary/20">
      <div className="max-w-3xl mx-auto px-6 py-8 flex flex-col sm:flex-row gap-8 sm:items-center justify-between">

        {/* Branding */}
        <div>
          <span className="font-epilogue font-black text-xs uppercase tracking-widest bg-secondary-fixed text-on-secondary-fixed px-2 py-1 inline-block">
            CODEDAY
          </span>
          <p className="font-grotesk text-xs uppercase tracking-widest opacity-40 mt-2">
            London 2026
          </p>
        </div>

        {/* Links */}
        <nav className="flex flex-wrap gap-x-6 gap-y-2">
          {contactEmail && (
            <a
              href={`mailto:${contactEmail}`}
              className="font-grotesk text-xs uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity"
            >
              ✉ {contactEmail}
            </a>
          )}
          {contactPhone && (
            <a
              href={`tel:${contactPhone.replace(/\s/g, '')}`}
              className="font-grotesk text-xs uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity"
            >
              ◎ {contactPhone}
            </a>
          )}
          {discordUrl && (
            <a
              href={discordUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-grotesk text-xs uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity"
            >
              ⊛ Discord
            </a>
          )}
          <a
            href="https://codeday.org"
            target="_blank"
            rel="noopener noreferrer"
            className="font-grotesk text-xs uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity"
          >
            ↗ codeday.org
          </a>
        </nav>
      </div>
    </footer>
  )
}
