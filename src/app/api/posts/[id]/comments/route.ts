import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAccountFromToken, TEAM_SESSION_COOKIE } from '@/lib/teamAuth'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const comments = await prisma.comment.findMany({
    where: { postId: params.id },
    orderBy: { createdAt: 'asc' },
    include: { teamAccount: { select: { username: true, displayName: true } } },
  })
  return Response.json({
    comments: comments.map(c => ({
      id: c.id,
      body: c.body,
      createdAt: c.createdAt,
      author: c.teamAccount,
    })),
  })
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const token = req.cookies.get(TEAM_SESSION_COOKIE)?.value
  if (!token) return Response.json({ error: 'Not logged in' }, { status: 401 })
  const account = await getAccountFromToken(token)
  if (!account) return Response.json({ error: 'Session expired' }, { status: 401 })

  const { body } = await req.json()
  if (!body?.trim()) return Response.json({ error: 'Comment cannot be empty' }, { status: 400 })
  if (body.trim().length > 500) return Response.json({ error: 'Comment must be 500 characters or fewer' }, { status: 400 })

  const post = await prisma.post.findUnique({ where: { id: params.id } })
  if (!post) return Response.json({ error: 'Post not found' }, { status: 404 })

  const comment = await prisma.comment.create({
    data: { body: body.trim(), postId: params.id, teamAccountId: account.id },
    include: { teamAccount: { select: { username: true, displayName: true } } },
  })

  return Response.json({
    comment: { id: comment.id, body: comment.body, createdAt: comment.createdAt, author: comment.teamAccount },
  }, { status: 201 })
}
