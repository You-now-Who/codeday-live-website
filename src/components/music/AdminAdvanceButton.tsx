'use client'

import { useState } from 'react'

type Track = { title: string; artist: string }
type BattleInfo = {
  id: string
  status: 'ACTIVE' | 'DONE' | 'PENDING'
  trackA: Track
  trackB: Track
  voteCounts: { trackAVotes: number; trackBVotes: number }
}

interface AdminAdvanceButtonProps {
  initialBattle: BattleInfo | null
  adminKey: string
}

export function AdminAdvanceButton({ initialBattle, adminKey }: AdminAdvanceButtonProps) {
  const [battle, setBattle] = useState<BattleInfo | null>(initialBattle)
  const [advancing, setAdvancing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAdvance = async () => {
    setAdvancing(true)
    setError(null)
    try {
      const res = await fetch('/api/music/advance', {
        method: 'POST',
        headers: { 'x-admin-key': adminKey },
      })
      if (!res.ok) {
        setError('Advance failed — check admin key')
        return
      }
      const data = await res.json()
      if (data.battle) setBattle(data.battle)
    } catch {
      setError('Advance failed — network error')
    } finally {
      setAdvancing(false)
    }
  }

  return (
    <div className="border-2 border-primary shadow-hard p-4 bg-white mt-8">
      <h2 className="font-epilogue font-black text-lg uppercase mb-4">Music Battle</h2>

      {battle ? (
        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className={`font-epilogue font-black text-xs uppercase px-2 py-0.5 border-2 border-primary ${battle.status === 'ACTIVE' ? 'bg-secondary-fixed text-on-secondary-fixed' : 'bg-white'}`}>
              {battle.status}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-grotesk text-xs text-outline uppercase tracking-widest">Track A</p>
              <p className="font-grotesk text-sm font-medium">{battle.trackA.title}</p>
              <p className="font-grotesk text-xs text-outline">{battle.trackA.artist}</p>
              <p className="font-epilogue font-black text-xl mt-1">{battle.voteCounts.trackAVotes} <span className="font-grotesk text-xs text-outline">votes</span></p>
            </div>
            <div>
              <p className="font-grotesk text-xs text-outline uppercase tracking-widest">Track B</p>
              <p className="font-grotesk text-sm font-medium">{battle.trackB.title}</p>
              <p className="font-grotesk text-xs text-outline">{battle.trackB.artist}</p>
              <p className="font-epilogue font-black text-xl mt-1">{battle.voteCounts.trackBVotes} <span className="font-grotesk text-xs text-outline">votes</span></p>
            </div>
          </div>
        </div>
      ) : (
        <p className="font-grotesk text-sm text-outline mb-4">No active battle</p>
      )}

      <button
        onClick={handleAdvance}
        disabled={advancing}
        className="font-epilogue font-black uppercase text-sm px-4 py-2 border-2 border-primary shadow-hard bg-secondary-fixed text-on-secondary-fixed hover:bg-primary hover:text-on-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {advancing ? 'Advancing…' : 'Advance Battle'}
      </button>

      {error && <p className="font-grotesk text-xs text-error mt-2">{error}</p>}
    </div>
  )
}
