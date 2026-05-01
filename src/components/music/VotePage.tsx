'use client'

import { useCallback, useState } from 'react'
import { usePolling } from '@/lib/hooks/usePolling'
import { BattleCard } from './BattleCard'
import { NominationSearch } from './NominationSearch'
import Link from 'next/link'

const STREAM_URL = process.env.NEXT_PUBLIC_RADIO_STREAM_URL

type Track = { id: string; spotifyId: string; title: string; artist: string; albumArt: string | null; previewUrl: string | null }
type Battle = {
  id: string
  status: 'ACTIVE' | 'DONE' | 'PENDING'
  startedAt: string | null
  trackA: Track
  trackB: Track
  winner: Track | null
  voteCounts: { trackAVotes: number; trackBVotes: number }
}
type NowPlayingData = { battle: Battle | null; currentTrack: Track | null }

interface VotePageProps {
  isLoggedIn: boolean
  username: string | null
}

export function VotePage({ isLoggedIn, username }: VotePageProps) {
  const [votedBattleId, setVotedBattleId] = useState<string | null>(null)
  const [votedPickedId, setVotedPickedId] = useState<string | null>(null)
  const [localVoteCounts, setLocalVoteCounts] = useState<{ trackAVotes: number; trackBVotes: number } | null>(null)

  const fetcher = useCallback(() => fetch('/api/music/now-playing').then(r => r.json()) as Promise<NowPlayingData>, [])
  const { data } = usePolling<NowPlayingData>(fetcher, 4_000)

  const battle = data?.battle ?? null

  // Reset local vote state if battle changed
  if (battle && votedBattleId && battle.id !== votedBattleId) {
    setVotedBattleId(null)
    setVotedPickedId(null)
    setLocalVoteCounts(null)
  }

  const voteCounts = localVoteCounts ?? battle?.voteCounts ?? { trackAVotes: 0, trackBVotes: 0 }
  const totalVotes = voteCounts.trackAVotes + voteCounts.trackBVotes

  const handleVote = async (pickedId: string) => {
    if (!battle || !isLoggedIn || votedBattleId === battle.id) return
    const res = await fetch('/api/music/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ battleId: battle.id, pickedId }),
    })
    if (res.ok) {
      const data = await res.json()
      setVotedBattleId(battle.id)
      setVotedPickedId(pickedId)
      setLocalVoteCounts(data.voteCounts)
    }
  }

  const hasVoted = battle ? votedBattleId === battle.id : false
  const isActive = battle?.status === 'ACTIVE'

  return (
    <div className="px-6 py-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-epilogue font-black text-5xl uppercase tracking-tight leading-none">Battle</h1>
        <p className="font-grotesk text-sm text-outline uppercase tracking-widest mt-1">Vote for the next track</p>
      </div>

      {/* Radio player */}
      {STREAM_URL && (
        <div className="border-2 border-primary shadow-hard bg-white mb-8">
          <div className="px-3 py-1 border-b-2 border-primary flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-live-dot inline-block" />
            <span className="font-epilogue font-black text-xs uppercase tracking-widest">Live Radio</span>
          </div>
          <audio src={STREAM_URL} controls autoPlay className="w-full" style={{ height: '40px' }} />
        </div>
      )}

      {/* Battle */}
      {battle ? (
        <div className="mb-8">
          <div className="grid grid-cols-2 gap-4 items-start relative">
            <BattleCard
              track={battle.trackA}
              voteCount={voteCounts.trackAVotes}
              isWinner={battle.winner?.id === battle.trackA.id}
              hasVoted={hasVoted}
              votedForThis={votedPickedId === battle.trackA.id}
              onVote={() => handleVote(battle.trackA.id)}
              disabled={!isLoggedIn || hasVoted || !isActive}
            />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
              <span className="font-epilogue font-black text-2xl bg-white border-2 border-primary px-2 py-1 shadow-hard">VS</span>
            </div>
            <BattleCard
              track={battle.trackB}
              voteCount={voteCounts.trackBVotes}
              isWinner={battle.winner?.id === battle.trackB.id}
              hasVoted={hasVoted}
              votedForThis={votedPickedId === battle.trackB.id}
              onVote={() => handleVote(battle.trackB.id)}
              disabled={!isLoggedIn || hasVoted || !isActive}
            />
          </div>

          {/* Vote bar */}
          <div className="mt-4">
            <div className="h-4 border-2 border-primary overflow-hidden flex">
              <div
                className="bg-secondary-fixed transition-all duration-500"
                style={{ width: totalVotes > 0 ? `${(voteCounts.trackAVotes / totalVotes) * 100}%` : '50%' }}
              />
              <div className="flex-1 bg-primary" />
            </div>
            <p className="font-grotesk text-xs text-outline uppercase tracking-widest mt-1 text-center">
              {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'} total
            </p>
          </div>

          {!isLoggedIn && (
            <p className="font-grotesk text-sm text-outline text-center mt-4">
              <Link href="/login" className="underline font-bold text-primary">Log in</Link> to vote
            </p>
          )}
        </div>
      ) : (
        <div className="border-2 border-primary shadow-hard p-8 bg-white text-center mb-8">
          <p className="font-epilogue font-black text-xl uppercase tracking-tight">No Battle In Progress</p>
          <p className="font-grotesk text-sm text-outline mt-2">Nominate a song to get things started.</p>
        </div>
      )}

      {/* Nomination panel */}
      <div className="border-2 border-primary shadow-hard bg-white">
        <div className="px-4 py-3 border-b-2 border-primary">
          <span className="font-epilogue font-black text-xs uppercase tracking-widest bg-secondary-fixed text-on-secondary-fixed px-2 py-0.5 inline-block">
            Nominate a Track
          </span>
        </div>
        <div className="p-4">
          {isLoggedIn && username ? (
            <NominationSearch username={username} />
          ) : (
            <p className="font-grotesk text-sm text-outline">
              <Link href="/login" className="underline font-bold text-primary">Log in</Link> to nominate tracks
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
