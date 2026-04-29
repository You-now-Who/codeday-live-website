interface LocationSectionProps {
  location: string | null
  locationUrl: string | null
}

export function LocationSection({ location, locationUrl }: LocationSectionProps) {
  if (!location && !locationUrl) return null

  return (
    <section className="py-2">
      <p className="font-grotesk text-xs uppercase tracking-widest text-outline mb-3">Venue</p>
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <p className="font-epilogue font-black text-3xl uppercase tracking-tight leading-none">
          {location}
        </p>
        {locationUrl && (
          <a
            href={locationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-grotesk text-sm uppercase tracking-widest border-b-2 border-primary hover:opacity-60 transition-opacity flex-shrink-0 pb-0.5"
          >
            Open in Maps →
          </a>
        )}
      </div>
    </section>
  )
}
