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

function getStatus(item: ScheduleItem, allItems: ScheduleItem[]): Status {
  const now = new Date()
  const start = new Date(item.startsAt)
  let end = item.endsAt ? new Date(item.endsAt) : null

  if (!end) {
    const sorted = [...allItems].sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
    const idx = sorted.findIndex(i => i.id === item.id)
    if (idx !== -1 && idx < sorted.length - 1) {
      end = new Date(sorted[idx + 1].startsAt)
    }
  }

  if (end && now > end) return 'past'
  if (now >= start && (!end || now <= end)) return 'current'
  return 'upcoming'
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function Row({ item, status }: { item: ScheduleItem; status: Status }) {
  const isCurrent = status === 'current'
  const isPast    = status === 'past'

  return (
    <div
      className={`flex items-start gap-4 px-5 py-4 border-b-2 border-primary last:border-b-0 transition-colors ${
        isCurrent ? 'bg-secondary-fixed' : isPast ? 'bg-white opacity-50' : 'bg-white'
      }`}
    >
      {/* Status dot */}
      <div className="flex-shrink-0 w-5 flex items-center justify-center pt-[5px]">
        {isCurrent ? (
          <span className="w-3 h-3 bg-primary inline-block animate-live-dot" />
        ) : isPast ? (
          <span className="w-3 h-3 bg-primary inline-block" />
        ) : (
          <span className="w-3 h-3 border-2 border-primary bg-white inline-block" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-baseline gap-2">
          <span className="font-epilogue font-black text-base uppercase tracking-tight leading-snug">
            {item.title}
          </span>
          {isCurrent && (
            <span className="font-epilogue font-bold text-xs bg-primary text-on-primary px-1.5 uppercase leading-5">
              NOW
            </span>
          )}
          {isPast && (
            <span className="font-grotesk text-xs text-outline uppercase tracking-widest">done</span>
          )}
        </div>
        <span className="font-grotesk text-xs text-outline">
          {formatTime(item.startsAt)}
          {item.endsAt && ` — ${formatTime(item.endsAt)}`}
        </span>
      </div>
    </div>
  )
}

interface CompactScheduleSectionProps {
  items: ScheduleItem[]
}

export function CompactScheduleSection({ items }: CompactScheduleSectionProps) {
  if (items.length === 0) return null

  const statuses = items.map(item => ({ item, status: getStatus(item, items) }))

  // Find anchor: current item, or next upcoming if nothing current
  const currentIdx = statuses.findIndex(s => s.status === 'current')
  const anchorIdx  = currentIdx !== -1
    ? currentIdx
    : statuses.findIndex(s => s.status === 'upcoming')

  if (anchorIdx === -1) {
    // All done — show last 3
    const slice = statuses.slice(-3)
    return <Shell items={slice} />
  }

  // Collect: one before anchor, anchor, one after
  const prev = anchorIdx > 0 ? statuses[anchorIdx - 1] : null
  const curr = statuses[anchorIdx]
  const next = anchorIdx < statuses.length - 1 ? statuses[anchorIdx + 1] : null

  const slice = [prev, curr, next].filter(Boolean) as typeof statuses

  return <Shell items={slice} />
}

function Shell({ items }: { items: { item: ScheduleItem; status: Status }[] }) {
  return (
    <section>
      <div className="flex items-baseline justify-between mb-5">
        <h2 className="font-epilogue font-black text-xl uppercase tracking-tight leading-none">Schedule</h2>
        <Link href="/schedule" className="font-grotesk text-xs uppercase tracking-widest text-outline hover:text-primary transition-colors">
          Full schedule →
        </Link>
      </div>
      <div className="border-2 border-primary shadow-hard overflow-hidden">
        {items.map(({ item, status }) => (
          <Row key={item.id} item={item} status={status} />
        ))}
      </div>
    </section>
  )
}
