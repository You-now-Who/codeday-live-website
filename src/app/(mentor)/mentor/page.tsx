'use client'

import { useState, useCallback } from 'react'
import { usePolling } from '@/lib/hooks/usePolling'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { adminFetch } from '@/lib/adminFetch'

type HelpRequest = {
  id: string
  teamName: string
  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED'
  claimedBy: string | null
  createdAt: string
  updatedAt: string
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  return `${hrs}h ago`
}

function RequestCard({
  request,
  onUpdate,
}: {
  request: HelpRequest
  onUpdate: () => void
}) {
  const [claiming, setClaiming] = useState(false)
  const [mentorName, setMentorName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleClaim = async () => {
    if (!mentorName.trim()) { setError('Enter your name'); return }
    setLoading(true)
    setError(null)
    try {
      const res = await adminFetch(`/api/help-requests/${request.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'IN_PROGRESS', claimedBy: mentorName.trim() }),
      })
      if (!res.ok) { const d = await res.json(); setError(d.error); return }
      setClaiming(false)
      setMentorName('')
      onUpdate()
    } finally {
      setLoading(false)
    }
  }

  const handleResolve = async () => {
    setLoading(true)
    try {
      await adminFetch(`/api/help-requests/${request.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'RESOLVED' }),
      })
      onUpdate()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`border-2 border-primary shadow-hard p-4 ${
      request.status === 'IN_PROGRESS' ? 'bg-secondary-fixed' : 'bg-white'
    }`}>
      <h3 className="font-epilogue font-black text-xl uppercase tracking-tight leading-none">
        {request.teamName}
      </h3>
      <p className="font-grotesk text-xs text-outline mt-1">{timeAgo(request.createdAt)}</p>
      {request.claimedBy && (
        <p className="font-grotesk text-xs mt-1">
          <span className="uppercase tracking-widest text-outline">Claimed by </span>
          {request.claimedBy}
        </p>
      )}
      <div className="mt-3">
        <StatusBadge status={request.status} />
      </div>

      {request.status === 'PENDING' && !claiming && (
        <Button className="mt-3 w-full" onClick={() => setClaiming(true)} disabled={loading}>
          CLAIM
        </Button>
      )}

      {request.status === 'PENDING' && claiming && (
        <div className="mt-3 space-y-2">
          <Input
            label="Your Name"
            value={mentorName}
            onChange={e => setMentorName(e.target.value)}
            placeholder="Alice"
          />
          {error && <p className="font-grotesk text-xs text-error">{error}</p>}
          <div className="flex gap-2">
            <Button variant="primary" onClick={handleClaim} disabled={loading} className="flex-1">
              {loading ? '...' : 'CONFIRM'}
            </Button>
            <Button onClick={() => { setClaiming(false); setError(null) }} className="flex-1">
              CANCEL
            </Button>
          </div>
        </div>
      )}

      {request.status === 'IN_PROGRESS' && (
        <Button variant="primary" className="mt-3 w-full" onClick={handleResolve} disabled={loading}>
          {loading ? '...' : 'RESOLVE'}
        </Button>
      )}
    </div>
  )
}

export default function MentorPage() {
  const fetcher = useCallback(
    () => adminFetch('/api/help-requests').then(r => r.json()).then(d => d.requests ?? []),
    []
  )
  const { data: requests, loading, error, refresh } = usePolling<HelpRequest[]>(fetcher, 15_000)

  const pending = (requests ?? []).filter(r => r.status === 'PENDING')
  const inProgress = (requests ?? []).filter(r => r.status === 'IN_PROGRESS')
  const resolved = (requests ?? []).filter(r => r.status === 'RESOLVED')

  if (loading && !requests) {
    return <p className="font-grotesk text-outline">Loading...</p>
  }
  if (error) {
    return <p className="font-grotesk text-error">Failed to load help requests.</p>
  }

  const columns = [
    { label: 'PENDING', items: pending, count: pending.length },
    { label: 'IN PROGRESS', items: inProgress, count: inProgress.length },
    { label: 'RESOLVED', items: resolved, count: resolved.length },
  ]

  return (
    <div>
      <h1 className="font-epilogue font-black text-3xl uppercase tracking-tight leading-none mb-2">
        Help Queue
      </h1>
      <p className="font-grotesk text-xs text-outline mb-6 uppercase tracking-widest">
        Auto-refreshes every 15 seconds
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map(({ label, items, count }) => (
          <div key={label}>
            <div className="border-b-2 border-primary mb-4 pb-2 flex items-baseline gap-2">
              <h2 className="font-epilogue font-black text-lg uppercase tracking-tight">{label}</h2>
              <span className="font-grotesk text-sm text-outline">({count})</span>
            </div>
            <div className="space-y-4">
              {items.length === 0 && (
                <p className="font-grotesk text-xs text-outline">None</p>
              )}
              {items.map(r => (
                <RequestCard key={r.id} request={r} onUpdate={refresh} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
