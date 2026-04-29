import { prisma } from '@/lib/prisma'
import { ScheduleClient } from '@/components/sections/ScheduleClient'

export default async function SchedulePage() {
  const raw = await prisma.scheduleItem.findMany({ orderBy: { startsAt: 'asc' } })
  const items = JSON.parse(JSON.stringify(raw))
  return <ScheduleClient initialItems={items} />
}
