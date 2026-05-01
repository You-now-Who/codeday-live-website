import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkAdminKey } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const isAdmin = checkAdminKey(req)
  const posts = await prisma.blogPost.findMany({
    where: isAdmin ? undefined : { published: true },
    orderBy: { createdAt: 'desc' },
    select: { id: true, title: true, excerpt: true, coverImageUrl: true, createdAt: true, published: true },
  })
  return Response.json({ posts })
}

export async function POST(req: NextRequest) {
  if (!checkAdminKey(req)) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { title, body, excerpt, coverImageUrl, published } = await req.json()
  if (!title?.trim()) return Response.json({ error: 'Title is required' }, { status: 400 })
  if (!body?.trim()) return Response.json({ error: 'Body is required' }, { status: 400 })

  const post = await prisma.blogPost.create({
    data: {
      title: title.trim(),
      body: body.trim(),
      excerpt: excerpt?.trim() || null,
      coverImageUrl: coverImageUrl?.trim() || null,
      published: published ?? false,
    },
  })
  return Response.json({ post }, { status: 201 })
}
