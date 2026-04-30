'use client'

import { useEffect, useState, useCallback } from 'react'

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

const adminKey = process.env.NEXT_PUBLIC_ADMIN_SECRET ?? ''

function apiFetch(url: string, options: RequestInit = {}) {
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'x-admin-key': adminKey,
      ...(options.headers ?? {}),
    },
  })
}

export default function MentorPage() {
  const [requests, setRequests] = useState<HelpRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [myName, setMyName] = useState('')
  const [nameInput, setNameInput] = useState('')
  const [nameSet, setNameSet] = useState(false)

  const load = useCallback(() => {
    apiFetch('/api/mentor/help')
      .then(r => r.json())
      .then(d => { setRequests(d.requests ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!nameSet) return
    load()
    const t = setInterval(load, 20_000)
    return () => clearInterval(t)
  }, [load, nameSet])

  const update = async (id: string, status: string) => {
    await apiFetch(`/api/mentor/help/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, claimedBy: status === 'IN_PROGRESS' ? myName : undefined }),
    })
    load()
  }

  const pending = requests.filter(r => r.status === 'PENDING')
  const inProgress = requests.filter(r => r.status === 'IN_PROGRESS')

  if (!nameSet) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-sm bg-white border-2 border-primary shadow-hard p-8">
          <h1 className="font-epilogue font-black text-2xl uppercase tracking-tight mb-1">Mentor Queue</h1>
          <p className="font-grotesk text-sm text-outline mb-6">Enter your name so teams know who&apos;s helping them.</p>
          <form onSubmit={e => { e.preventDefault(); if (nameInput.trim()) { setMyName(nameInput.trim()); setNameSet(true) } }}>
            <input
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              placeholder="Your name"
              className="w-full border-2 border-primary px-3 py-2 font-grotesk text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 mb-4"
              autoFocus
            />
            <button
              type="submit"
              disabled={!nameInput.trim()}
              className="w-full font-epilogue font-black text-sm uppercase border-2 border-primary bg-primary text-on-primary py-2 hover:bg-secondary-fixed hover:border-secondary-fixed hover:text-on-secondary-fixed transition-colors disabled:opacity-40"
            >
              Enter Queue →
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="font-epilogue font-black text-3xl uppercase tracking-tight leading-none">Help Queue</h1>
          <p className="font-grotesk text-sm text-outline mt-1">Mentoring as <strong>{myName}</strong></p>
        </div>
        <div className="flex gap-4 font-grotesk text-sm">
          {pending.length > 0 && (
            <span className="border-2 border-primary px-3 py-1 font-epilogue font-black text-xs uppercase">
              {pending.length} pending
            </span>
          )}
          {inProgress.length > 0 && (
            <span className="border-2 border-secondary-fixed bg-secondary-fixed text-on-secondary-fixed px-3 py-1 font-epilogue font-black text-xs uppercase">
              {inProgress.length} in progress
            </span>
          )}
        </div>
      </div>

      {loading && <p className="font-grotesk text-sm text-outline">Loading…</p>}

      {!loading && requests.length === 0 && (
        <div className="text-center py-24">
          <p className="font-epilogue font-black text-6xl opacity-10 mb-4">✓</p>
          <p className="font-epilogue font-bold text-xl uppercase tracking-tight text-outline">All clear</p>
          <p className="font-grotesk text-sm text-outline mt-2">No active help requests right now.</p>
        </div>
      )}

      <div className="space-y-3">
        {requests.map(r => (
          <div
            key={r.id}
            className={`bg-white border-2 border-primary shadow-hard p-4 ${r.status === 'IN_PROGRESS' ? 'border-secondary-fixed' : ''}`}
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-epilogue font-black text-lg uppercase tracking-tight leading-none">{r.teamName}</p>
                <p className="font-grotesk text-xs text-outline mt-1">
                  {timeAgo(r.createdAt)}
                  {r.claimedBy && <span> · claimed by <strong>{r.claimedBy}</strong></span>}
                </p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                {r.status === 'PENDING' && (
                  <button
                    onClick={() => update(r.id, 'IN_PROGRESS')}
                    className="font-epilogue font-black text-xs uppercase border-2 border-primary px-3 py-2 hover:bg-secondary-fixed hover:border-secondary-fixed hover:text-on-secondary-fixed transition-colors"
                  >
                    Claim →
                  </button>
                )}
                {r.status === 'IN_PROGRESS' && (
                  <>
                    <span className="font-grotesk text-xs text-outline self-center">In progress</span>
                    <button
                      onClick={() => update(r.id, 'RESOLVED')}
                      className="font-epilogue font-black text-xs uppercase border-2 border-primary bg-primary text-on-primary px-3 py-2 hover:bg-secondary-fixed hover:border-secondary-fixed hover:text-on-secondary-fixed transition-colors"
                    >
                      Resolve ✓
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
