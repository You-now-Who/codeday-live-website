import { prisma } from '@/lib/prisma'
import { ResourcesClient } from '@/components/sections/ResourcesClient'

export default async function ResourcesPage() {
  const raw = await prisma.resourceLink.findMany({ orderBy: { category: 'asc' } })
  const resources = JSON.parse(JSON.stringify(raw))
  return <ResourcesClient initialResources={resources} />
}
