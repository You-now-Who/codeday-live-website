import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkAdminKey } from '@/lib/auth'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!checkAdminKey(request)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { title, description, location, startsAt, endsAt } = body
  const data: Record<string, unknown> = {}

  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim() === '') {
      return Response.json({ error: 'title must be a non-empty string', field: 'title' }, { status: 400 })
    }
    if (title.trim().length > 200) {
      return Response.json({ error: 'title must be 200 characters or fewer', field: 'title' }, { status: 400 })
    }
    data.title = title.trim()
  }
  if (description !== undefined) data.description = description?.trim() ?? null
  if (location !== undefined) data.location = location?.trim() ?? null
  if (startsAt !== undefined) {
    if (isNaN(new Date(startsAt).getTime())) {
      return Response.json({ error: 'startsAt must be a valid ISO date', field: 'startsAt' }, { status: 400 })
    }
    data.startsAt = new Date(startsAt)
  }
  if (endsAt !== undefined) {
    if (endsAt !== null) {
      if (isNaN(new Date(endsAt).getTime())) {
        return Response.json({ error: 'endsAt must be a valid ISO date', field: 'endsAt' }, { status: 400 })
      }
      const effectiveStartsAt = startsAt
        ? new Date(startsAt)
        : (await prisma.scheduleItem.findUnique({ where: { id: params.id } }))?.startsAt
      if (effectiveStartsAt && new Date(endsAt) <= effectiveStartsAt) {
        return Response.json({ error: 'endsAt must be after startsAt', field: 'endsAt' }, { status: 400 })
      }
      data.endsAt = new Date(endsAt)
    } else {
      data.endsAt = null
    }
  }

  try {
    const item = await prisma.scheduleItem.update({
      where: { id: params.id },
      data,
    })
    return Response.json(item)
  } catch (e: unknown) {
    if ((e as { code?: string }).code === 'P2025') {
      return Response.json({ error: 'Not found' }, { status: 404 })
    }
    return Response.json({ error: 'Failed to update schedule item' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!checkAdminKey(request)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await prisma.scheduleItem.delete({ where: { id: params.id } })
    return Response.json({ success: true })
  } catch (e: unknown) {
    if ((e as { code?: string }).code === 'P2025') {
      return Response.json({ error: 'Not found' }, { status: 404 })
    }
    return Response.json({ error: 'Failed to delete schedule item' }, { status: 500 })
  }
}
