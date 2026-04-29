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
  const { title, url, description, category } = body
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
  if (url !== undefined) {
    if (typeof url !== 'string' || !/^https?:\/\//.test(url)) {
      return Response.json({ error: 'url must be a valid http(s) URL', field: 'url' }, { status: 400 })
    }
    data.url = url
  }
  if (description !== undefined) data.description = description?.trim() ?? null
  if (category !== undefined) {
    if (typeof category !== 'string' || category.trim() === '') {
      return Response.json({ error: 'category must be a non-empty string', field: 'category' }, { status: 400 })
    }
    if (category.trim().length > 50) {
      return Response.json({ error: 'category must be 50 characters or fewer', field: 'category' }, { status: 400 })
    }
    data.category = category.trim().toUpperCase()
  }

  try {
    const resource = await prisma.resourceLink.update({ where: { id: params.id }, data })
    return Response.json(resource)
  } catch (e: unknown) {
    if ((e as { code?: string }).code === 'P2025') {
      return Response.json({ error: 'Not found' }, { status: 404 })
    }
    return Response.json({ error: 'Failed to update resource' }, { status: 500 })
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
    await prisma.resourceLink.delete({ where: { id: params.id } })
    return Response.json({ success: true })
  } catch (e: unknown) {
    if ((e as { code?: string }).code === 'P2025') {
      return Response.json({ error: 'Not found' }, { status: 404 })
    }
    return Response.json({ error: 'Failed to delete resource' }, { status: 500 })
  }
}
