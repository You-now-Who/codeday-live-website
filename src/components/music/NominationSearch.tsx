'use client'

import { useState, useEffect, useRef } from 'react'

type SpotifyTrack = {
  spotifyId: string
  title: string
  artist: string
  albumArt: string | null
  previewUrl: string | null
}

export function NominationSearch({ username }: { username: string }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SpotifyTrack[]>([])
  const [nominated, setNominated] = useState<Set<string>>(new Set())
  const [searching, setSearching] = useState(false)
  const [nominatingId, setNominatingId] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<Record<string, string>>({})
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!query.trim()) { setResults([]); return }
    debounceRef.current = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await fetch(`/api/music/search?q=${encodeURIComponent(query)}`)
        const data = await res.json()
        setResults(data.tracks ?? [])
      } finally {
        setSearching(false)
      }
    }, 400)
  }, [query])

  const nominate = async (track: SpotifyTrack) => {
    setNominatingId(track.spotifyId)
    try {
      const res = await fetch('/api/music/nominate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(track),
      })
      if (res.ok) {
        setNominated(prev => new Set([...prev, track.spotifyId]))
        setFeedback(prev => ({ ...prev, [track.spotifyId]: 'Nominated!' }))
        setTimeout(() => setFeedback(prev => { const n = { ...prev }; delete n[track.spotifyId]; return n }), 2000)
      } else {
        const data = await res.json()
        const msg = data.error === 'Nomination limit reached' ? 'Limit reached (max 3)' : 'Already nominated'
        setFeedback(prev => ({ ...prev, [track.spotifyId]: msg }))
        setTimeout(() => setFeedback(prev => { const n = { ...prev }; delete n[track.spotifyId]; return n }), 3000)
      }
    } finally {
      setNominatingId(null)
    }
  }

  return (
    <div>
      <p className="font-grotesk text-xs text-outline mb-3">Nominating as <span className="font-bold text-primary">@{username}</span> · max 3 nominations</p>
      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search Spotify..."
        className="w-full border-2 border-primary p-2 font-grotesk text-sm shadow-hard-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
      />

      {searching && <p className="font-grotesk text-xs text-outline mt-2 uppercase tracking-widest">Searching…</p>}

      {results.length > 0 && (
        <div className="border-2 border-primary border-t-0 divide-y divide-primary/20 bg-white">
          {results.map(track => {
            const isNominated = nominated.has(track.spotifyId)
            const fb = feedback[track.spotifyId]
            return (
              <button
                key={track.spotifyId}
                onClick={() => !isNominated && nominate(track)}
                disabled={isNominated || nominatingId === track.spotifyId}
                className="w-full flex items-center gap-3 p-3 hover:bg-kraft transition-colors text-left disabled:cursor-default"
              >
                <div className="w-10 h-10 flex-shrink-0 border border-primary/20 overflow-hidden bg-kraft">
                  {track.albumArt
                    ? <img src={track.albumArt} alt={track.title} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-sm opacity-40">♫</div>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-epilogue font-black text-xs uppercase leading-tight truncate">{track.title}</p>
                  <p className="font-grotesk text-xs text-outline truncate">{track.artist}</p>
                </div>
                {fb ? (
                  <span className={`font-epilogue font-black text-xs uppercase flex-shrink-0 ${fb === 'Nominated!' ? 'text-on-secondary-fixed bg-secondary-fixed px-1' : 'text-error'}`}>
                    {fb}
                  </span>
                ) : isNominated ? (
                  <span className="font-epilogue font-black text-xs uppercase flex-shrink-0 bg-secondary-fixed text-on-secondary-fixed px-1">✓ Done</span>
                ) : (
                  <span className="font-epilogue font-black text-xs uppercase flex-shrink-0 text-outline">+ Add</span>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
