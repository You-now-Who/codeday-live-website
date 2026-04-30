import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAccountFromToken, TEAM_SESSION_COOKIE } from '@/lib/teamAuth'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const token = req.cookies.get(TEAM_SESSION_COOKIE)?.value
  if (!token) return Response.json({ error: 'Not logged in' }, { status: 401 })
  const account = await getAccountFromToken(token)
  if (!account) return Response.json({ error: 'Session expired' }, { status: 401 })

  const { emoji } = await req.json()
  if (!emoji || typeof emoji !== 'string' || emoji.length > 10) {
    return Response.json({ error: 'Invalid emoji' }, { status: 400 })
  }

  const post = await prisma.post.findUnique({ where: { id: params.id } })
  if (!post) return Response.json({ error: 'Post not found' }, { status: 404 })

  const existing = await prisma.reaction.findUnique({
    where: { postId_teamAccountId_emoji: { postId: params.id, teamAccountId: account.id, emoji } },
  })

  if (existing) {
    await prisma.reaction.delete({ where: { id: existing.id } })
    return Response.json({ action: 'removed' })
  } else {
    await prisma.reaction.create({ data: { emoji, postId: params.id, teamAccountId: account.id } })
    return Response.json({ action: 'added' })
  }
}
