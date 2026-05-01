export type SpotifyTrack = {
  spotifyId: string
  title: string
  artist: string
  albumArt: string | null
  previewUrl: string | null
}

let cachedToken: { token: string; expiresAt: number } | null = null

export async function getSpotifyToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60_000) {
    return cachedToken.token
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET
  if (!clientId || !clientSecret) throw new Error('Spotify auth failed')

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
    },
    body: 'grant_type=client_credentials',
  })

  if (!res.ok) throw new Error('Spotify auth failed')

  const data = await res.json()
  cachedToken = { token: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 }
  return cachedToken.token
}

export async function searchTracks(query: string): Promise<SpotifyTrack[]> {
  try {
    const token = await getSpotifyToken()
    const url = `https://api.spotify.com/v1/search?type=track&limit=8&q=${encodeURIComponent(query)}`
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
    if (!res.ok) return []
    const data = await res.json()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data.tracks?.items ?? []).map((t: any) => ({
      spotifyId: t.id,
      title: t.name,
      artist: t.artists.map((a: { name: string }) => a.name).join(', '),
      albumArt: t.album?.images?.[0]?.url ?? null,
      previewUrl: t.preview_url ?? null,
    }))
  } catch {
    return []
  }
}
