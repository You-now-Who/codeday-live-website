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
      className={`border-2 border-primary p-4 card-lift ${
        isCurrent
          ? 'bg-secondary-fixed shadow-hard-lg'
          : 'bg-white shadow-hard'
      } ${isPast ? 'opacity-50' : ''}`}
    >
      <div className="flex gap-6">
        <div className="flex-shrink-0 font-grotesk text-sm font-medium tabular-nums w-16">
          <div>{formatTime(item.startsAt)}</div>
          {item.endsAt && (
            <div className="text-outline">— {formatTime(item.endsAt)}</div>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-start gap-3 flex-wrap">
            <h3 className="font-epilogue font-black text-lg uppercase tracking-tight leading-none">
              {item.title}
            </h3>
            {isCurrent && (
              <span className="flex-shrink-0 bg-primary text-on-primary font-epilogue font-bold text-xs uppercase px-2 py-0.5 rotate-[-2deg] inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-secondary-fixed rounded-full animate-live-dot inline-block" />
                LIVE NOW
              </span>
            )}
          </div>
          {item.description && (
            <p className="font-grotesk text-sm mt-1 text-on-surface">{item.description}</p>
          )}
          {item.location && (
            <p className="font-grotesk text-xs uppercase tracking-widest mt-1 text-outline">
              {item.location}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
