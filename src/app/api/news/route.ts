import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkAdminKey } from '@/lib/auth'

export async function GET() {
  try {
    const posts = await prisma.newsPost.findMany({
      orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }],
    })
    return Response.json({ posts })
  } catch {
    return Response.json({ error: 'Failed to fetch news' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  if (!checkAdminKey(request)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { headline, body: postBody, imageUrl, type, pinned } = body

  if (!headline || typeof headline !== 'string' || headline.trim() === '') {
    return Response.json({ error: 'headline is required', field: 'headline' }, { status: 400 })
  }
  if (headline.trim().length > 300) {
    return Response.json({ error: 'headline must be 300 characters or fewer', field: 'headline' }, { status: 400 })
  }
  if (!postBody || typeof postBody !== 'string' || postBody.trim() === '') {
    return Response.json({ error: 'body is required', field: 'body' }, { status: 400 })
  }
  if (imageUrl !== undefined && imageUrl !== null) {
    if (typeof imageUrl !== 'string' || !/^https?:\/\//.test(imageUrl)) {
      return Response.json({ error: 'imageUrl must be a valid http(s) URL', field: 'imageUrl' }, { status: 400 })
    }
  }
  if (type !== undefined && !['NEWS', 'ANNOUNCEMENT'].includes(type)) {
    return Response.json({ error: 'type must be NEWS or ANNOUNCEMENT', field: 'type' }, { status: 400 })
  }

  try {
    const post = await prisma.newsPost.create({
      data: {
        headline: headline.trim(),
        body: postBody.trim(),
        imageUrl: imageUrl ?? null,
        type: type ?? 'NEWS',
        pinned: pinned ?? false,
      },
    })
    return Response.json(post, { status: 201 })
  } catch {
    return Response.json({ error: 'Failed to create news post' }, { status: 500 })
  }
}
