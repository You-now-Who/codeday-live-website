interface ContactSectionProps {
  contactEmail: string | null
  contactPhone: string | null
  discordUrl: string | null
}

export function ContactSection({ contactEmail, contactPhone, discordUrl }: ContactSectionProps) {
  if (!contactEmail && !contactPhone && !discordUrl) return null

  const items = [
    contactEmail && { label: contactEmail,       href: `mailto:${contactEmail}`,              prefix: '✉' },
    contactPhone && { label: contactPhone,        href: `tel:${contactPhone.replace(/\s/g,'')}`, prefix: '◎' },
    discordUrl   && { label: 'Join Discord',      href: discordUrl,                             prefix: '⊛', external: true },
  ].filter(Boolean) as { label: string; href: string; prefix: string; external?: boolean }[]

  return (
    <section>
      <p className="font-grotesk text-xs uppercase tracking-widest text-outline mb-4">Contact</p>
      <div className="flex flex-wrap gap-3">
        {items.map(({ label, href, prefix, external }) => (
          <a
            key={href}
            href={href}
            target={external ? '_blank' : undefined}
            rel={external ? 'noopener noreferrer' : undefined}
            className="inline-flex items-center gap-2 border-2 border-primary bg-white px-4 py-2.5 font-epilogue font-bold text-sm uppercase tracking-tight shadow-hard-sm btn-press hover:bg-surface transition-colors"
          >
            <span className="opacity-70">{prefix}</span>
            {label}
          </a>
        ))}
      </div>
    </section>
  )
}
