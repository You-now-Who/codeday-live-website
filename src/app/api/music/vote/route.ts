import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAccountFromToken } from '@/lib/teamAuth'

export async function POST(request: NextRequest) {
  const token = request.cookies.get('teamSession')?.value
  if (!token) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const account = await getAccountFromToken(token)
  if (!account) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { battleId, pickedId } = body

  if (!battleId || !pickedId) return Response.json({ error: 'battleId and pickedId are required' }, { status: 400 })

  const battle = await prisma.musicBattle.findUnique({ where: { id: battleId } })
  if (!battle) return Response.json({ error: 'Battle not found' }, { status: 404 })
  if (battle.status !== 'ACTIVE') return Response.json({ error: 'Battle is not active' }, { status: 409 })
  if (pickedId !== battle.trackAId && pickedId !== battle.trackBId) {
    return Response.json({ error: 'pickedId must be trackA or trackB' }, { status: 400 })
  }

  try {
    await prisma.battleVote.create({
      data: { battleId, teamAccountId: account.id, pickedId },
    })
  } catch (e: unknown) {
    if ((e as { code?: string }).code === 'P2002') {
      return Response.json({ error: 'Already voted' }, { status: 409 })
    }
    return Response.json({ error: 'Failed to cast vote' }, { status: 500 })
  }

  const [trackAVotes, trackBVotes] = await Promise.all([
    prisma.battleVote.count({ where: { battleId, pickedId: battle.trackAId } }),
    prisma.battleVote.count({ where: { battleId, pickedId: battle.trackBId } }),
  ])

  return Response.json({ ok: true, voteCounts: { trackAVotes, trackBVotes } })
}
