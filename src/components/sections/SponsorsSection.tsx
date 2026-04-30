type Sponsor = { name: string; url?: string; tier?: string; logoUrl?: string }

interface SponsorsSectionProps {
  sponsors: Sponsor[]
}

export function SponsorsSection({ sponsors }: SponsorsSectionProps) {
  if (sponsors.length === 0) return null

  const main   = sponsors.filter(s => (s.tier ?? '').toLowerCase() !== 'thanks')
  const thanks = sponsors.filter(s => (s.tier ?? '').toLowerCase() === 'thanks')

  return (
    <section className="bg-primary text-on-primary py-14">
      <div className="max-w-3xl mx-auto px-6">
        <p className="font-grotesk text-xs uppercase tracking-widest opacity-50 mb-10 text-center">
          Presented by
        </p>

        <div className="flex flex-wrap gap-12 items-center justify-center mb-10">
          {main.map((s, i) => {
            const inner = (
              <div key={i} className="flex items-center group">
                {s.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={s.logoUrl}
                    alt={s.name}
                    className="h-14 max-w-[180px] object-contain brightness-0 invert opacity-80 group-hover:opacity-100 transition-opacity"
                  />
                ) : (
                  <span className="font-epilogue font-black text-3xl uppercase tracking-tight leading-none opacity-80 group-hover:opacity-100 transition-opacity">
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
          <p className="font-grotesk text-xs uppercase tracking-widest opacity-40 text-center">
            Special thanks &nbsp;·&nbsp; {thanks.map(s => s.name).join(' · ')}
          </p>
        )}
      </div>
    </section>
  )
}
