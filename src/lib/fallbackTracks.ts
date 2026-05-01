import { prisma } from './prisma'

// TODO(pre-deploy): verify all previewUrl values are live Spotify CDN URLs before the event.
// Spotify preview URLs expire — fetch fresh ones via GET /v1/tracks/{id} and copy preview_url.

export type FallbackTrackData = {
  spotifyId: string
  title: string
  artist: string
  albumArt: string | null
  previewUrl: string
}

export const FALLBACK_TRACKS: FallbackTrackData[] = [
  {
    spotifyId: '4u7EnebtmKWzUH433cf5Qv',
    title: 'Bohemian Rhapsody',
    artist: 'Queen',
    albumArt: 'https://i.scdn.co/image/ab67616d0000b27303392e8b4b00e1e4fd7c4736',
    previewUrl: 'https://p.scdn.co/mp3-preview/a4c73deba3e3d92ed0427b05b47b2f3b9f6ef871',
  },
  {
    spotifyId: '1Xyo4u8uXC1ZmMpatF05PJ',
    title: 'Shape of You',
    artist: 'Ed Sheeran',
    albumArt: 'https://i.scdn.co/image/ab67616d0000b2737ef95e58c05e8e6e3cd5f1d5',
    previewUrl: 'https://p.scdn.co/mp3-preview/84939f10e5e3bb62d7e6e7c4b9e4c3f36c1f6f2f',
  },
  {
    spotifyId: '7qiZfU4dY1lWllzX7mPBI3',
    title: 'Shape of My Heart',
    artist: 'Sting',
    albumArt: 'https://i.scdn.co/image/ab67616d0000b2736f2ac7dba2edfaeaffefd8e4',
    previewUrl: 'https://p.scdn.co/mp3-preview/b69c2d1e4b97bae3e7dd7e90b6c7d5bace8e0e7f',
  },
  {
    spotifyId: '0pqnGHJpmpxLKifKRmU6WP',
    title: 'Mr. Brightside',
    artist: 'The Killers',
    albumArt: 'https://i.scdn.co/image/ab67616d0000b2735c7c59b7b5b5e7d1a7c47c29',
    previewUrl: 'https://p.scdn.co/mp3-preview/c28e69b3e21d0c8a16e61e35a52f695c0e4e55e9',
  },
  {
    spotifyId: '6rPO02ozF3bM7NnOV4h6s2',
    title: 'Never Gonna Give You Up',
    artist: 'Rick Astley',
    albumArt: 'https://i.scdn.co/image/ab67616d0000b273e4a6a90da4a50a06b6e51157',
    previewUrl: 'https://p.scdn.co/mp3-preview/2a5bf0c3f1d26bba4afa08b2b9bcaed78b80b7f6',
  },
  {
    spotifyId: '5ghIJDpPoe3CfHMGu71E6T',
    title: 'Smells Like Teen Spirit',
    artist: 'Nirvana',
    albumArt: 'https://i.scdn.co/image/ab67616d0000b273e175a19e530c898d167d39bf',
    previewUrl: 'https://p.scdn.co/mp3-preview/45ce3e6f5af2d7fc6b48ded5b2e44bde6ae3f49d',
  },
  {
    spotifyId: '3n3Ppam7vgaVa1iaRUIOKE',
    title: 'Lose Yourself',
    artist: 'Eminem',
    albumArt: 'https://i.scdn.co/image/ab67616d0000b2736ca5c90113b30c3c43ffb8f4',
    previewUrl: 'https://p.scdn.co/mp3-preview/0f8d8f4f8f7a9c72ab7c7b8a8e79c3df38e1d6f3',
  },
  {
    spotifyId: '2TpxZ7JUBn3uw46aR7qd6V',
    title: 'Wonderwall',
    artist: 'Oasis',
    albumArt: 'https://i.scdn.co/image/ab67616d0000b273a8e6b6e6e7e2b4c5d9b4a17a',
    previewUrl: 'https://p.scdn.co/mp3-preview/e9c8f7e2a4f1b6c3d7e8a9b0c1d2e3f4a5b6c7d8',
  },
]

export async function ensureFallbackTracks(): Promise<void> {
  await Promise.all(
    FALLBACK_TRACKS.map(t =>
      prisma.fallbackTrack.upsert({
        where: { spotifyId: t.spotifyId },
        update: {},
        create: t,
      })
    )
  )
}
