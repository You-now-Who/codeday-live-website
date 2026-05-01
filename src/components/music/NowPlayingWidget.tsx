'use client'

import { useCallback } from 'react'
import { usePolling } from '@/lib/hooks/usePolling'
import Link from 'next/link'

type Track = { spotifyId: string; title: string; artist: string; albumArt: string | null; previewUrl: string | null }
type NowPlayingData = { battle: { trackA: Track; trackB: Track } | null; currentTrack: Track | null }

export function NowPlayingWidget() {
  const fetcher = useCallback(() => fetch('/api/music/now-playing').then(r => r.json()) as Promise<NowPlayingData>, [])
  const { data } = usePolling<NowPlayingData>(fetcher, 4_000)

  const track = data?.currentTrack ?? data?.battle?.trackA ?? null

  if (!data) {
    return (
      <div className="border-2 border-primary shadow-hard bg-white p-4 animate-pulse">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-primary/10 w-2/3" />
            <div className="h-2 bg-primary/10 w-1/2" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="border-2 border-primary shadow-hard bg-white">
      <div className="px-3 py-1 border-b-2 border-primary">
        <span className="font-epilogue font-black text-xs uppercase tracking-widest bg-secondary-fixed text-on-secondary-fixed px-2 py-0.5 inline-block">
          ♫ Now Playing
        </span>
      </div>
      <div className="p-4 flex items-center gap-4">
        {track ? (
          <>
            <div className="w-12 h-12 flex-shrink-0 border-2 border-primary overflow-hidden">
              {track.albumArt
                ? <img src={track.albumArt} alt={track.title} className="w-full h-full object-cover" />
                : <div className="w-full h-full bg-kraft flex items-center justify-center text-xl">♫</div>
              }
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-epilogue font-black uppercase text-sm leading-tight truncate">{track.title}</p>
              <p className="font-grotesk text-xs text-outline uppercase tracking-widest truncate">{track.artist}</p>
            </div>
            <Link
              href="/vote"
              className="font-epilogue font-black text-xs uppercase border-2 border-primary px-3 py-1 shadow-hard-sm hover:bg-secondary-fixed transition-colors flex-shrink-0"
            >
              Vote →
            </Link>
          </>
        ) : (
          <div className="flex-1">
            <p className="font-epilogue font-black uppercase text-sm">No Track Playing</p>
            <p className="font-grotesk text-xs text-outline mt-0.5">
              <Link href="/vote" className="underline">Nominate a song →</Link>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
