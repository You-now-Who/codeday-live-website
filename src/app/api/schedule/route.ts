import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkAdminKey } from '@/lib/auth'

export async function GET() {
  try {
    const items = await prisma.scheduleItem.findMany({
      orderBy: { startsAt: 'asc' },
    })
    return Response.json({ items })
  } catch {
    return Response.json({ error: 'Failed to fetch schedule' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  if (!checkAdminKey(request)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { title, description, location, startsAt, endsAt } = body

  if (!title || typeof title !== 'string' || title.trim() === '') {
    return Response.json({ error: 'title is required', field: 'title' }, { status: 400 })
  }
  if (title.trim().length > 200) {
    return Response.json({ error: 'title must be 200 characters or fewer', field: 'title' }, { status: 400 })
  }
  if (!startsAt || isNaN(new Date(startsAt).getTime())) {
    return Response.json({ error: 'startsAt must be a valid ISO date', field: 'startsAt' }, { status: 400 })
  }
  if (endsAt !== undefined && endsAt !== null) {
    if (isNaN(new Date(endsAt).getTime())) {
      return Response.json({ error: 'endsAt must be a valid ISO date', field: 'endsAt' }, { status: 400 })
    }
    if (new Date(endsAt) <= new Date(startsAt)) {
      return Response.json({ error: 'endsAt must be after startsAt', field: 'endsAt' }, { status: 400 })
    }
  }

  try {
    const item = await prisma.scheduleItem.create({
      data: {
        title: title.trim(),
        description: description?.trim() ?? null,
        location: location?.trim() ?? null,
        startsAt: new Date(startsAt),
        endsAt: endsAt ? new Date(endsAt) : null,
      },
    })
    return Response.json(item, { status: 201 })
  } catch (e) {
    console.error('Create schedule item error:', e)
    return Response.json({ error: 'Failed to create schedule item' }, { status: 500 })
  }
}
