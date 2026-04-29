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
  const { headline, body: postBody, imageUrl, type, pinned } = body
  const data: Record<string, unknown> = {}

  if (headline !== undefined) {
    if (typeof headline !== 'string' || headline.trim() === '') {
      return Response.json({ error: 'headline must be a non-empty string', field: 'headline' }, { status: 400 })
    }
    if (headline.trim().length > 300) {
      return Response.json({ error: 'headline must be 300 characters or fewer', field: 'headline' }, { status: 400 })
    }
    data.headline = headline.trim()
  }
  if (postBody !== undefined) {
    if (typeof postBody !== 'string' || postBody.trim() === '') {
      return Response.json({ error: 'body must be a non-empty string', field: 'body' }, { status: 400 })
    }
    data.body = postBody.trim()
  }
  if (imageUrl !== undefined) {
    if (imageUrl !== null && (typeof imageUrl !== 'string' || !/^https?:\/\//.test(imageUrl))) {
      return Response.json({ error: 'imageUrl must be a valid http(s) URL', field: 'imageUrl' }, { status: 400 })
    }
    data.imageUrl = imageUrl
  }
  if (type !== undefined) {
    if (!['NEWS', 'ANNOUNCEMENT'].includes(type)) {
      return Response.json({ error: 'type must be NEWS or ANNOUNCEMENT', field: 'type' }, { status: 400 })
    }
    data.type = type
  }
  if (pinned !== undefined) data.pinned = Boolean(pinned)

  try {
    const post = await prisma.newsPost.update({ where: { id: params.id }, data })
    return Response.json(post)
  } catch (e: unknown) {
    if ((e as { code?: string }).code === 'P2025') {
      return Response.json({ error: 'Not found' }, { status: 404 })
    }
    return Response.json({ error: 'Failed to update news post' }, { status: 500 })
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
    await prisma.newsPost.delete({ where: { id: params.id } })
    return Response.json({ success: true })
  } catch (e: unknown) {
    if ((e as { code?: string }).code === 'P2025') {
      return Response.json({ error: 'Not found' }, { status: 404 })
    }
    return Response.json({ error: 'Failed to delete news post' }, { status: 500 })
  }
}
