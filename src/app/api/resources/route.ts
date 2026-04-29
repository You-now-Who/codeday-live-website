import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkAdminKey } from '@/lib/auth'

export async function GET() {
  try {
    const resources = await prisma.resourceLink.findMany({
      orderBy: [{ category: 'asc' }, { createdAt: 'asc' }],
    })
    return Response.json({ resources })
  } catch {
    return Response.json({ error: 'Failed to fetch resources' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  if (!checkAdminKey(request)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { title, url, description, category } = body

  if (!title || typeof title !== 'string' || title.trim() === '') {
    return Response.json({ error: 'title is required', field: 'title' }, { status: 400 })
  }
  if (title.trim().length > 200) {
    return Response.json({ error: 'title must be 200 characters or fewer', field: 'title' }, { status: 400 })
  }
  if (!url || typeof url !== 'string' || !/^https?:\/\//.test(url)) {
    return Response.json({ error: 'url must be a valid http(s) URL', field: 'url' }, { status: 400 })
  }
  if (!category || typeof category !== 'string' || category.trim() === '') {
    return Response.json({ error: 'category is required', field: 'category' }, { status: 400 })
  }
  if (category.trim().length > 50) {
    return Response.json({ error: 'category must be 50 characters or fewer', field: 'category' }, { status: 400 })
  }

  try {
    const resource = await prisma.resourceLink.create({
      data: {
        title: title.trim(),
        url,
        description: description?.trim() ?? null,
        category: category.trim().toUpperCase(),
      },
    })
    return Response.json(resource, { status: 201 })
  } catch {
    return Response.json({ error: 'Failed to create resource' }, { status: 500 })
  }
}
