'use client'

import { useCallback } from 'react'
import { usePolling } from '@/lib/hooks/usePolling'
import { ScheduleCard } from '@/components/ui/ScheduleCard'
import { PageHeader } from '@/components/ui/PageHeader'
import { ScrollReveal } from '@/components/ui/ScrollReveal'

type ScheduleItem = { id: string; title: string; description: string | null; location: string | null; startsAt: string; endsAt: string | null }
type Status = 'past' | 'current' | 'upcoming'

function getStatus(item: ScheduleItem): Status {
  const now = new Date()
  const start = new Date(item.startsAt)
  const end = item.endsAt ? new Date(item.endsAt) : null
  if (end && now > end) return 'past'
  if (now >= start && (end == null || now <= end)) return 'current'
  return 'upcoming'
}

export function ScheduleClient({ initialItems }: { initialItems: ScheduleItem[] }) {
  const fetcher = useCallback(
    () => fetch('/api/schedule').then(r => r.json()).then(d => d.items),
    []
  )
  const { data } = usePolling<ScheduleItem[]>(fetcher, 30_000)
  const items: ScheduleItem[] = data ?? initialItems

  return (
    <div>
      <PageHeader title="Schedule" />
      <div className="px-6 py-4 space-y-4 max-w-2xl mx-auto">
        {items.length === 0 && (
          <p className="font-grotesk text-outline">No schedule items yet.</p>
        )}
        {items.map((item, i) => (
          <ScrollReveal key={item.id} delay={i * 40}>
            <ScheduleCard item={item} status={getStatus(item)} />
          </ScrollReveal>
        ))}
      </div>
    </div>
  )
}
