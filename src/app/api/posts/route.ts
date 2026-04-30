import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAccountFromToken, TEAM_SESSION_COOKIE } from '@/lib/teamAuth'

export async function GET(req: NextRequest) {
  const token = req.cookies.get(TEAM_SESSION_COOKIE)?.value
  const account = token ? await getAccountFromToken(token) : null

  const raw = await prisma.post.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      teamAccount: { select: { id: true, username: true, displayName: true } },
      _count: { select: { comments: true } },
      reactions: { select: { emoji: true, teamAccountId: true } },
    },
  })

  const posts = raw.map(p => {
    const reactionCounts: Record<string, number> = {}
    const myReactions: string[] = []
    for (const r of p.reactions) {
      reactionCounts[r.emoji] = (reactionCounts[r.emoji] ?? 0) + 1
      if (account && r.teamAccountId === account.id) myReactions.push(r.emoji)
    }
    return {
      id: p.id,
      content: p.content,
      imageUrl: p.imageUrl,
      createdAt: p.createdAt,
      author: p.teamAccount,
      commentCount: p._count.comments,
      reactionCounts,
      myReactions,
    }
  })

  return Response.json({ posts })
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(TEAM_SESSION_COOKIE)?.value
  if (!token) return Response.json({ error: 'Not logged in' }, { status: 401 })
  const account = await getAccountFromToken(token)
  if (!account) return Response.json({ error: 'Session expired' }, { status: 401 })

  const { content, imageUrl } = await req.json()
  if (!content?.trim()) return Response.json({ error: 'Post content is required' }, { status: 400 })
  if (content.trim().length > 2000) return Response.json({ error: 'Post must be 2000 characters or fewer' }, { status: 400 })

  const post = await prisma.post.create({
    data: {
      content: content.trim(),
      imageUrl: imageUrl?.trim() || null,
      teamAccountId: account.id,
    },
    include: {
      teamAccount: { select: { id: true, username: true, displayName: true } },
      _count: { select: { comments: true } },
    },
  })

  return Response.json({
    post: {
      id: post.id,
      content: post.content,
      imageUrl: post.imageUrl,
      createdAt: post.createdAt,
      author: post.teamAccount,
      commentCount: 0,
      reactionCounts: {},
      myReactions: [],
    },
  }, { status: 201 })
}
