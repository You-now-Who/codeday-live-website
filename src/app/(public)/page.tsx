import { prisma } from '@/lib/prisma'
import { HomeClient } from '@/components/sections/HomeClient'

export default async function HomePage() {
  const [config, items] = await Promise.all([
    prisma.eventConfig.findUnique({ where: { id: '1' } }),
    prisma.scheduleItem.findMany({ orderBy: { startsAt: 'asc' } }),
  ])
  return (
    <HomeClient
      initialConfig={JSON.parse(JSON.stringify(config))}
      initialSchedule={JSON.parse(JSON.stringify(items))}
      initialNews={[]}
    />
  )
}
