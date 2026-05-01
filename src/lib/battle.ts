import { prisma } from './prisma'
import { ensureFallbackTracks } from './fallbackTracks'

const TRACK_SELECT = {
  id: true, spotifyId: true, title: true, artist: true, albumArt: true, previewUrl: true,
} as const

export async function getActiveBattle() {
  return prisma.musicBattle.findFirst({
    where: { status: 'ACTIVE' },
    include: { trackA: { select: TRACK_SELECT }, trackB: { select: TRACK_SELECT }, winner: { select: TRACK_SELECT }, votes: true },
  })
}

export async function seedNextBattle() {
  // Tracks that have already appeared in any battle
  const usedBattles = await prisma.musicBattle.findMany({ select: { trackAId: true, trackBId: true } })
  const usedIds = new Set(usedBattles.flatMap(b => [b.trackAId, b.trackBId]))

  // Eligible nominations
  const eligibleNoms = await prisma.musicTrack.findMany({
    where: { id: { notIn: usedIds.size ? [...usedIds] : undefined } },
    select: TRACK_SELECT,
  })

  // Fallback tracks (as MusicTrack-compatible shape)
  let candidates = [...eligibleNoms]
  if (candidates.length < 2) {
    await ensureFallbackTracks()
    const fallbacks = await prisma.fallbackTrack.findMany({ select: { id: true, spotifyId: true, title: true, artist: true, albumArt: true, previewUrl: true } })
    // Seed any fallback not yet in MusicTrack
    for (const fb of fallbacks) {
      const exists = await prisma.musicTrack.findUnique({ where: { spotifyId: fb.spotifyId } })
      if (!exists) {
        const created = await prisma.musicTrack.create({
          data: { spotifyId: fb.spotifyId, title: fb.title, artist: fb.artist, albumArt: fb.albumArt, previewUrl: fb.previewUrl },
          select: TRACK_SELECT,
        })
        if (!usedIds.has(created.id)) candidates.push(created)
      } else if (!usedIds.has(exists.id)) {
        candidates.push(exists)
      }
    }
  }

  if (candidates.length < 2) throw new Error('Not enough tracks to seed a battle')

  // Pick 2 at random
  const shuffled = candidates.sort(() => Math.random() - 0.5)
  const [trackA, trackB] = shuffled

  const battle = await prisma.musicBattle.create({
    data: {
      trackAId: trackA.id,
      trackBId: trackB.id,
      status: 'ACTIVE',
      startedAt: new Date(),
    },
    include: { trackA: { select: TRACK_SELECT }, trackB: { select: TRACK_SELECT }, winner: { select: TRACK_SELECT }, votes: true },
  })

  return battle
}

export async function advanceCurrentBattle() {
  const active = await getActiveBattle()

  if (active) {
    const votesA = active.votes.filter(v => v.pickedId === active.trackAId).length
    const votesB = active.votes.filter(v => v.pickedId === active.trackBId).length
    const winnerId = votesB > votesA ? active.trackBId : active.trackAId

    await prisma.musicBattle.update({
      where: { id: active.id },
      data: { status: 'DONE', endedAt: new Date(), winnerId },
    })
  }

  return seedNextBattle()
}
