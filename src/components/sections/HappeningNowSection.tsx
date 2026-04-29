type ScheduleItem = { id: string; title: string; description: string | null; location: string | null; startsAt: string; endsAt: string | null }

interface HappeningNowSectionProps {
  currentItem: ScheduleItem | null
  nextItem: ScheduleItem | null
}

export function HappeningNowSection({ currentItem, nextItem }: HappeningNowSectionProps) {
  const item = currentItem ?? nextItem
  const label = currentItem ? 'HAPPENING NOW' : 'UP NEXT'
  const isCurrent = !!currentItem

  if (!item) return null

  return (
    <div className={`bg-secondary-fixed border-2 border-primary shadow-hard p-5 rotate-[0.5deg] animate-fade-up animate-float-b`}>
      <div className="mb-3 flex items-center gap-2">
        {isCurrent && (
          <span className="w-2 h-2 bg-primary rounded-full animate-live-dot inline-block" />
        )}
        <span className="font-epilogue font-bold text-xs uppercase bg-primary text-on-primary px-2 py-0.5 rotate-[-2deg] inline-block">
          {label}
        </span>
      </div>
      <h2 className="font-epilogue font-black text-2xl uppercase tracking-tight leading-none">
        {item.title}
      </h2>
      {item.description && (
        <p className="font-grotesk text-sm mt-2">{item.description}</p>
      )}
      {item.location && (
        <p className="font-grotesk text-xs uppercase tracking-widest mt-2 opacity-70">
          {item.location}
        </p>
      )}
      <p className="font-grotesk text-xs mt-2 opacity-70">
        {new Date(item.startsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        {item.endsAt && ` — ${new Date(item.endsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
      </p>
    </div>
  )
}
