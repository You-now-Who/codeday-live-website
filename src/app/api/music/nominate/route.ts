import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAccountFromToken } from '@/lib/teamAuth'

const NOMINATION_CAP = 3

export async function POST(request: NextRequest) {
  const token = request.cookies.get('teamSession')?.value
  if (!token) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const account = await getAccountFromToken(token)
  if (!account) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { spotifyId, title, artist, albumArt, previewUrl } = body

  if (!spotifyId || typeof spotifyId !== 'string') return Response.json({ error: 'spotifyId is required', field: 'spotifyId' }, { status: 400 })
  if (!title || typeof title !== 'string') return Response.json({ error: 'title is required', field: 'title' }, { status: 400 })
  if (!artist || typeof artist !== 'string') return Response.json({ error: 'artist is required', field: 'artist' }, { status: 400 })

  const existingCount = await prisma.musicTrack.count({ where: { nominatedBy: account.username } })
  if (existingCount >= NOMINATION_CAP) {
    return Response.json({ error: 'Nomination limit reached' }, { status: 409 })
  }

  const existing = await prisma.musicTrack.findUnique({ where: { spotifyId } })
  if (existing) return Response.json({ error: 'Track already nominated' }, { status: 409 })

  try {
    const track = await prisma.musicTrack.create({
      data: {
        spotifyId,
        title,
        artist,
        albumArt: albumArt ?? null,
        previewUrl: previewUrl ?? null,
        nominatedBy: account.username,
      },
    })
    return Response.json(track, { status: 201 })
  } catch {
    return Response.json({ error: 'Failed to nominate track' }, { status: 500 })
  }
}
