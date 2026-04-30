'use client'

import { useEffect, useState } from 'react'

type HelpRequest = {
  id: string
  teamName: string
  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED'
  claimedBy: string | null
  createdAt: string
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  return `${Math.floor(mins / 60)}h ago`
}

export function MentorSection() {
  const [requests, setRequests] = useState<HelpRequest[]>([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    fetch('/api/mentor/help')
      .then(r => r.json())
      .then(d => { setRequests(d.requests ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    load()
    const t = setInterval(load, 20_000)
    return () => clearInterval(t)
  }, [])

  const update = async (id: string, status: string) => {
    await fetch(`/api/mentor/help/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    load()
  }

  const pending = requests.filter(r => r.status === 'PENDING')
  const inProgress = requests.filter(r => r.status === 'IN_PROGRESS')

  return (
    <div className="border-b-2 border-primary bg-primary text-on-primary">
      <div className="max-w-2xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-epilogue font-black text-sm uppercase tracking-widest">
            Help Queue
          </h2>
          <div className="flex gap-3 font-grotesk text-xs opacity-70">
            {pending.length > 0 && <span>{pending.length} pending</span>}
            {inProgress.length > 0 && <span>{inProgress.length} in progress</span>}
            {requests.length === 0 && !loading && <span>All clear ✓</span>}
          </div>
        </div>

        {loading && <p className="font-grotesk text-xs opacity-50">Loading…</p>}

        {requests.length === 0 && !loading && (
          <p className="font-grotesk text-xs opacity-50">No active help requests.</p>
        )}

        <div className="space-y-2">
          {requests.map(r => (
            <div key={r.id} className="flex items-center gap-3 bg-on-primary/10 px-3 py-2">
              <div className="flex-1 min-w-0">
                <span className="font-epilogue font-black text-sm uppercase tracking-tight">{r.teamName}</span>
                <span className="font-grotesk text-xs opacity-50 ml-2">{timeAgo(r.createdAt)}</span>
                {r.claimedBy && (
                  <span className="font-grotesk text-xs opacity-50 ml-2">· claimed by {r.claimedBy}</span>
                )}
              </div>
              <div className="flex gap-2 flex-shrink-0">
                {r.status === 'PENDING' && (
                  <button
                    onClick={() => update(r.id, 'IN_PROGRESS')}
                    className="font-epilogue font-black text-xs uppercase border border-on-primary/40 px-2 py-1 hover:bg-secondary-fixed hover:border-secondary-fixed hover:text-on-secondary-fixed transition-colors"
                  >
                    Claim →
                  </button>
                )}
                {r.status === 'IN_PROGRESS' && (
                  <>
                    <span className="font-grotesk text-xs opacity-60 self-center">In progress</span>
                    <button
                      onClick={() => update(r.id, 'RESOLVED')}
                      className="font-epilogue font-black text-xs uppercase border border-on-primary/40 px-2 py-1 hover:bg-secondary-fixed hover:border-secondary-fixed hover:text-on-secondary-fixed transition-colors"
                    >
                      Resolve ✓
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
