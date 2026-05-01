interface ScheduleItem {
  id: string
  title: string
  description: string | null
  location: string | null
  startsAt: string
  endsAt: string | null
}

type ScheduleStatus = 'past' | 'current' | 'upcoming'

interface ScheduleCardProps {
  item: ScheduleItem
  status: ScheduleStatus
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export function ScheduleCard({ item, status }: ScheduleCardProps) {
  const isPast = status === 'past'
  const isCurrent = status === 'current'

  return (
    <div
      className={`border-l-4 border-primary p-4 card-lift ${
        isCurrent
          ? 'bg-secondary-fixed shadow-paper-lg tape border border-primary/20'
          : isPast
          ? 'index-card border border-primary/10'
          : 'bg-paper border border-primary/10 shadow-paper'
      } ${isPast ? 'opacity-50' : ''}`}
    >
      <div className="flex gap-6">
        <div className="flex-shrink-0 font-grotesk text-xs font-medium tabular-nums w-16 uppercase opacity-50">
          <div>{formatTime(item.startsAt)}</div>
          {item.endsAt && (
            <div>— {formatTime(item.endsAt)}</div>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-start gap-3 flex-wrap">
            <h3 className="font-epilogue font-black text-lg uppercase tracking-tight leading-none">
              {item.title}
            </h3>
            {isCurrent && (
              <span className="flex-shrink-0 bg-primary text-on-primary font-epilogue font-bold text-xs uppercase px-2 py-0.5 inline-flex items-center gap-1.5 stamp animate-stamp-appear border-2 border-primary">
                <span className="w-1.5 h-1.5 bg-secondary-fixed rounded-full animate-live-dot inline-block" />
                LIVE NOW
              </span>
            )}
          </div>
          {item.description && (
            <p className="font-grotesk text-sm mt-1 text-on-surface">{item.description}</p>
          )}
          {item.location && (
            <p className="font-grotesk text-xs uppercase tracking-widest mt-1 text-outline flex items-center gap-1">
              <svg width="10" height="12" viewBox="0 0 10 12" fill="currentColor" aria-hidden>
                <path d="M5 0C2.8 0 1 1.8 1 4c0 3 4 8 4 8s4-5 4-8c0-2.2-1.8-4-4-4zm0 5.5C4.2 5.5 3.5 4.8 3.5 4S4.2 2.5 5 2.5 6.5 3.2 6.5 4 5.8 5.5 5 5.5z" />
              </svg>
              {item.location}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
