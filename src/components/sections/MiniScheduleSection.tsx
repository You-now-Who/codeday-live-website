import Link from 'next/link'

type ScheduleItem = {
  id: string
  title: string
  startsAt: string
  endsAt: string | null
  description: string | null
  location: string | null
}

type Status = 'past' | 'current' | 'upcoming'

function getStatus(item: ScheduleItem): Status {
  const now = new Date()
  const start = new Date(item.startsAt)
  const end = item.endsAt ? new Date(item.endsAt) : null
  if (end && now > end) return 'past'
  if (now >= start && (end == null || now <= end)) return 'current'
  return 'upcoming'
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function dayLabel(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
}

interface MiniScheduleSectionProps {
  items: ScheduleItem[]
}

export function MiniScheduleSection({ items }: MiniScheduleSectionProps) {
  if (items.length === 0) return null

  // Group by calendar day
  const groups: { day: string; items: ScheduleItem[] }[] = []
  for (const item of items) {
    const day = dayLabel(item.startsAt)
    const existing = groups.find(g => g.day === day)
    if (existing) existing.items.push(item)
    else groups.push({ day, items: [item] })
  }

  return (
    <section>
      <div className="flex items-baseline justify-between mb-5">
        <h2 className="font-epilogue font-black text-xl uppercase tracking-tight leading-none">
          Schedule
        </h2>
        <Link
          href="/schedule"
          className="font-grotesk text-xs uppercase tracking-widest text-outline hover:text-primary transition-colors"
        >
          View all →
        </Link>
      </div>

      <div className="space-y-8">
        {groups.map(({ day, items: dayItems }) => (
          <div key={day}>
            {/* Day divider */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-primary/20" />
              <span className="font-epilogue font-bold text-xs uppercase tracking-widest text-outline">
                {day}
              </span>
              <div className="flex-1 h-px bg-primary/20" />
            </div>

            {/* Timeline */}
            <div className="relative">
              <div className="absolute left-[13px] top-3 bottom-3 w-px bg-primary/15" />
              <div className="space-y-1">
                {dayItems.map(item => {
                  const status = getStatus(item)
                  const isPast = status === 'past'
                  const isCurrent = status === 'current'

                  return (
                    <div key={item.id} className={`flex gap-4 items-start py-2 transition-opacity ${isPast ? 'opacity-40' : ''}`}>
                      {/* Timeline dot */}
                      <div className="flex-shrink-0 w-7 flex items-center justify-center pt-[3px]">
                        {isCurrent ? (
                          <span className="w-3.5 h-3.5 bg-primary border-2 border-primary inline-block animate-live-dot" />
                        ) : isPast ? (
                          <span className="w-3.5 h-3.5 bg-primary inline-block" />
                        ) : (
                          <span className="w-3.5 h-3.5 border-2 border-primary bg-white inline-block" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-baseline gap-2">
                          <span className={`font-epilogue font-black text-sm uppercase tracking-tight leading-snug ${isCurrent ? '' : ''}`}>
                            {item.title}
                          </span>
                          {isCurrent && (
                            <span className="font-epilogue font-bold text-xs bg-primary text-on-primary px-1.5 py-0 uppercase leading-5">
                              NOW
                            </span>
                          )}
                        </div>
                        <span className="font-grotesk text-xs text-outline">
                          {formatTime(item.startsAt)}
                          {item.endsAt && ` — ${formatTime(item.endsAt)}`}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
