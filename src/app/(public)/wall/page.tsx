import { getSessionAccount } from '@/lib/serverAuth'
import { prisma } from '@/lib/prisma'
import { WallClient } from '@/components/sections/WallClient'
import type { PostData } from '@/components/ui/PostCard'

export default async function WallPage() {
  const account = await getSessionAccount()

  const raw = await prisma.post.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      teamAccount: { select: { id: true, username: true, displayName: true } },
      _count: { select: { comments: true } },
      reactions: { select: { emoji: true, teamAccountId: true } },
    },
  })

  const initialPosts: PostData[] = raw.map(p => {
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
      createdAt: p.createdAt.toISOString(),
      author: p.teamAccount,
      commentCount: p._count.comments,
      reactionCounts,
      myReactions,
    }
  })

  return (
    <WallClient
      account={account ? { id: account.id, username: account.username, displayName: account.displayName } : null}
      initialPosts={initialPosts}
    />
  )
}
