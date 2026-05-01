import { NextRequest } from 'next/server'
import { getAccountFromToken } from '@/lib/teamAuth'
import { searchTracks } from '@/lib/spotify'

export async function GET(request: NextRequest) {
  const token = request.cookies.get('teamSession')?.value
  if (!token) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const account = await getAccountFromToken(token)
  if (!account) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const q = request.nextUrl.searchParams.get('q')?.trim()
  if (!q) return Response.json({ error: 'q is required' }, { status: 400 })

  try {
    const tracks = await searchTracks(q)
    return Response.json({ tracks })
  } catch {
    return Response.json({ error: 'Search failed' }, { status: 500 })
  }
}
