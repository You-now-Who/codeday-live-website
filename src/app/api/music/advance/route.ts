import { NextRequest } from 'next/server'
import { checkAdminKey } from '@/lib/auth'
import { advanceCurrentBattle } from '@/lib/battle'

export async function POST(request: NextRequest) {
  if (!checkAdminKey(request)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const battle = await advanceCurrentBattle()
    const voteCounts = {
      trackAVotes: battle.votes.filter(v => v.pickedId === battle.trackAId).length,
      trackBVotes: battle.votes.filter(v => v.pickedId === battle.trackBId).length,
    }
    return Response.json({
      ok: true,
      battle: {
        id: battle.id,
        status: battle.status,
        startedAt: battle.startedAt,
        trackA: battle.trackA,
        trackB: battle.trackB,
        winner: battle.winner,
        voteCounts,
      },
    })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    return Response.json({ error: message }, { status: 500 })
  }
}
