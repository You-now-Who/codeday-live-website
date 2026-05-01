import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkAdminKey } from '@/lib/auth'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const post = await prisma.blogPost.findUnique({ where: { id: params.id } })
  if (!post || !post.published) return Response.json({ error: 'Not found' }, { status: 404 })
  return Response.json({ post })
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!checkAdminKey(req)) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { title, body, excerpt, coverImageUrl, published } = await req.json()
  const data: Record<string, unknown> = {}
  if (title !== undefined) data.title = title.trim()
  if (body !== undefined) data.body = body.trim()
  if (excerpt !== undefined) data.excerpt = excerpt?.trim() || null
  if (coverImageUrl !== undefined) data.coverImageUrl = coverImageUrl?.trim() || null
  if (published !== undefined) data.published = published

  const post = await prisma.blogPost.update({ where: { id: params.id }, data })
  return Response.json({ post })
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!checkAdminKey(req)) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  await prisma.blogPost.delete({ where: { id: params.id } })
  return Response.json({ ok: true })
}
