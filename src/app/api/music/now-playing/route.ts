import { prisma } from '@/lib/prisma'
import { getActiveBattle, advanceCurrentBattle } from '@/lib/battle'

const TRACK_SELECT = {
  id: true, spotifyId: true, title: true, artist: true, albumArt: true, previewUrl: true,
} as const

export async function GET() {
  try {
    let battle = await getActiveBattle()

    // Auto-advance if the preview window has elapsed (35s proxy for 30s preview)
    if (
      battle?.startedAt &&
      Date.now() - new Date(battle.startedAt).getTime() > 35_000
    ) {
      try {
        battle = await advanceCurrentBattle()
      } catch {
        // pool empty — keep returning current battle
      }
    }

    // If no active battle, try to seed one
    if (!battle) {
      try {
        battle = await advanceCurrentBattle()
      } catch {
        // no tracks available yet
      }
    }

    const voteCounts = battle
      ? {
          trackAVotes: battle.votes.filter(v => v.pickedId === battle!.trackAId).length,
          trackBVotes: battle.votes.filter(v => v.pickedId === battle!.trackBId).length,
        }
      : { trackAVotes: 0, trackBVotes: 0 }

    // Most recently resolved battle's winner = currentTrack
    const lastDone = await prisma.musicBattle.findFirst({
      where: { status: 'DONE', winnerId: { not: null } },
      orderBy: { endedAt: 'desc' },
      include: { winner: { select: TRACK_SELECT } },
    })

    return Response.json({
      battle: battle
        ? {
            id: battle.id,
            status: battle.status,
            startedAt: battle.startedAt,
            trackA: battle.trackA,
            trackB: battle.trackB,
            winner: battle.winner,
            voteCounts,
          }
        : null,
      currentTrack: lastDone?.winner ?? null,
    })
  } catch {
    return Response.json({ battle: null, currentTrack: null })
  }
}
