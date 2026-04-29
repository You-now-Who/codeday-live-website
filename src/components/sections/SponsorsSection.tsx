type Sponsor = { name: string; url?: string; tier?: string; logoUrl?: string }

interface SponsorsSectionProps {
  sponsors: Sponsor[]
}

export function SponsorsSection({ sponsors }: SponsorsSectionProps) {
  if (sponsors.length === 0) return null

  const main    = sponsors.filter(s => (s.tier ?? '').toLowerCase() !== 'thanks')
  const thanks  = sponsors.filter(s => (s.tier ?? '').toLowerCase() === 'thanks')

  return (
    /* break out of the parent px-6 so this can go edge-to-edge */
    <section className="bg-primary text-on-primary -mx-6 px-8 py-10">
      <p className="font-grotesk text-xs uppercase tracking-widest opacity-50 mb-8">
        Presented by
      </p>

      <div className="flex flex-wrap gap-8 items-center mb-8">
        {main.map((s, i) => {
          const inner = (
            <div key={i} className="flex items-center gap-3 group">
              {s.logoUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={s.logoUrl}
                  alt={s.name}
                  className="h-10 max-w-[140px] object-contain brightness-0 invert opacity-90 group-hover:opacity-100 transition-opacity"
                />
              ) : (
                <span className="font-epilogue font-black text-2xl uppercase tracking-tight leading-none opacity-90 group-hover:opacity-100 transition-opacity">
                  {s.name}
                </span>
              )}
            </div>
          )

          return s.url ? (
            <a key={i} href={s.url} target="_blank" rel="noopener noreferrer">
              {inner}
            </a>
          ) : inner
        })}
      </div>

      {thanks.length > 0 && (
        <p className="font-grotesk text-xs uppercase tracking-widest opacity-40">
          Special thanks &nbsp;·&nbsp; {thanks.map(s => s.name).join(' · ')}
        </p>
      )}
    </section>
  )
}
