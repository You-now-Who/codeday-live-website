import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkAdminKey } from '@/lib/auth'

export async function GET() {
  try {
    const config = await prisma.eventConfig.findUnique({ where: { id: '1' } })
    if (!config) {
      return Response.json(
        { error: 'Event config not found — run the seed script' },
        { status: 404 }
      )
    }
    return Response.json({ config })
  } catch {
    return Response.json({ error: 'Failed to fetch config' }, { status: 500 })
  }
}

type ImportantLink = { label: string; url: string }
type Sponsor = { name: string; url?: string; tier?: string }

function validateImportantLinks(links: unknown): string | null {
  if (!Array.isArray(links)) return 'importantLinks must be an array'
  if (links.length > 10) return 'Maximum 10 important links allowed'
  for (const link of links) {
    if (
      typeof link !== 'object' || link === null ||
      typeof (link as ImportantLink).label !== 'string' ||
      (link as ImportantLink).label.trim() === '' ||
      typeof (link as ImportantLink).url !== 'string' ||
      !/^https?:\/\//.test((link as ImportantLink).url)
    ) {
      return 'Each importantLink must have a non-empty label and a valid url'
    }
  }
  return null
}

function validateSponsors(sponsors: unknown): string | null {
  if (!Array.isArray(sponsors)) return 'sponsors must be an array'
  if (sponsors.length > 30) return 'Maximum 30 sponsors allowed'
  for (const s of sponsors) {
    if (typeof s !== 'object' || s === null || typeof (s as Sponsor).name !== 'string' || (s as Sponsor).name.trim() === '') {
      return 'Each sponsor must have a non-empty name'
    }
  }
  return null
}

export async function PATCH(request: NextRequest) {
  if (!checkAdminKey(request)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const {
    eventName, submissionDeadline, wifiSsid, wifiPassword, discordUrl, importantLinks,
    location, locationUrl, contactEmail, contactPhone, sponsors,
  } = body
  const data: Record<string, unknown> = {}

  if (eventName !== undefined) {
    if (typeof eventName !== 'string' || eventName.trim() === '') {
      return Response.json({ error: 'eventName must be a non-empty string', field: 'eventName' }, { status: 400 })
    }
    if (eventName.trim().length > 200) {
      return Response.json({ error: 'eventName must be 200 characters or fewer', field: 'eventName' }, { status: 400 })
    }
    data.eventName = eventName.trim()
  }
  if (submissionDeadline !== undefined) {
    if (isNaN(new Date(submissionDeadline).getTime())) {
      return Response.json({ error: 'submissionDeadline must be a valid ISO date', field: 'submissionDeadline' }, { status: 400 })
    }
    data.submissionDeadline = new Date(submissionDeadline)
  }
  if (wifiSsid !== undefined)    data.wifiSsid    = wifiSsid?.trim()    ?? null
  if (wifiPassword !== undefined) data.wifiPassword = wifiPassword?.trim() ?? null
  if (discordUrl !== undefined)   data.discordUrl   = discordUrl?.trim()   ?? null
  if (location !== undefined)     data.location     = location?.trim()     ?? null
  if (locationUrl !== undefined)  data.locationUrl  = locationUrl?.trim()  ?? null
  if (contactEmail !== undefined) data.contactEmail = contactEmail?.trim() ?? null
  if (contactPhone !== undefined) data.contactPhone = contactPhone?.trim() ?? null

  if (importantLinks !== undefined) {
    const error = validateImportantLinks(importantLinks)
    if (error) return Response.json({ error, field: 'importantLinks' }, { status: 400 })
    data.importantLinks = importantLinks
  }
  if (sponsors !== undefined) {
    const error = validateSponsors(sponsors)
    if (error) return Response.json({ error, field: 'sponsors' }, { status: 400 })
    data.sponsors = sponsors
  }

  try {
    const config = await prisma.eventConfig.upsert({
      where: { id: '1' },
      update: data,
      create: {
        id: '1',
        eventName: (data.eventName as string) ?? 'CodeDay London',
        submissionDeadline: (data.submissionDeadline as Date) ?? new Date(),
        ...data,
      },
    })
    return Response.json({ config })
  } catch {
    return Response.json({ error: 'Failed to update config' }, { status: 500 })
  }
}
