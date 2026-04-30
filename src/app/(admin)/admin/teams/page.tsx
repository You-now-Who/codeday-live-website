'use client'

import { useState, useEffect, useCallback } from 'react'
import { adminFetch } from '@/lib/adminFetch'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

type Account = {
  id: string
  username: string
  displayName: string | null
  role: 'TEAM' | 'MENTOR' | 'ADMIN'
  createdAt: string
  project: { projectName: string; iframeUrl: string } | null
}

function generatePassword(len = 10) {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789'
  const arr = new Uint8Array(len)
  crypto.getRandomValues(arr)
  return Array.from(arr).map(b => chars[b % chars.length]).join('')
}

export default function AdminTeamsPage() {
  const [accounts, setAccounts]     = useState<Account[]>([])
  const [loading, setLoading]       = useState(true)
  const [form, setForm]             = useState({ username: '', displayName: '', password: '' })
  const [formError, setFormError]   = useState('')
  const [saving, setSaving]         = useState(false)
  const [created, setCreated]       = useState<{ username: string; password: string } | null>(null)
  const [resetMap, setResetMap]     = useState<Record<string, string>>({})
  const [resetSaved, setResetSaved] = useState<string | null>(null)

  const load = useCallback(() => {
    adminFetch('/api/admin/teams').then(r => r.json()).then(d => {
      setAccounts(d.accounts ?? [])
      setLoading(false)
    })
  }, [])

  useEffect(() => { load() }, [load])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    setSaving(true)
    const res = await adminFetch('/api/admin/teams', {
      method: 'POST',
      body: JSON.stringify({ username: form.username, displayName: form.displayName, password: form.password }),
    })
    const data = await res.json()
    setSaving(false)
    if (!res.ok) { setFormError(data.error ?? 'Error creating account'); return }
    setCreated({ username: form.username.trim().toLowerCase(), password: form.password })
    setForm({ username: '', displayName: '', password: '' })
    load()
  }

  const handleDelete = async (id: string, username: string) => {
    if (!confirm(`Delete account @${username}? Their project will remain on the wall.`)) return
    await adminFetch(`/api/admin/teams/${id}`, { method: 'DELETE' })
    load()
  }

  const handleResetPassword = async (id: string) => {
    const pw = resetMap[id]?.trim()
    if (!pw || pw.length < 4) return
    const res = await adminFetch(`/api/admin/teams/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ password: pw }),
    })
    if (res.ok) {
      setResetSaved(id)
      setTimeout(() => setResetSaved(null), 3000)
    }
  }

  const handleRoleChange = async (id: string, role: string) => {
    const res = await adminFetch(`/api/admin/teams/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    })
    if (!res.ok) {
      const data = await res.json()
      alert(`Failed to update role: ${data.error ?? res.status}`)
    }
    load()
  }

  return (
    <div className="max-w-2xl">
      <h1 className="font-epilogue font-black text-3xl uppercase tracking-tight mb-6">Team Accounts</h1>

      {/* Create form */}
      <section className="bg-white border-2 border-primary shadow-hard p-6 mb-8">
        <h2 className="font-epilogue font-black text-sm uppercase tracking-widest border-b-2 border-primary pb-1 mb-4">
          Create Account
        </h2>
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Username"
              value={form.username}
              onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
              placeholder="teamrocket"
              required
            />
            <Input
              label="Display Name"
              value={form.displayName}
              onChange={e => setForm(f => ({ ...f, displayName: e.target.value }))}
              placeholder="Team Rocket"
            />
          </div>
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <Input
                label="Password"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="Enter or auto-generate"
                required
              />
            </div>
            <Button
              type="button"
              onClick={() => setForm(f => ({ ...f, password: generatePassword() }))}
              className="py-2 px-3 text-xs mb-0.5"
            >
              AUTO
            </Button>
          </div>
          {formError && <p className="font-grotesk text-sm text-error">{formError}</p>}
          <Button type="submit" variant="primary" disabled={saving} className="w-full py-3">
            {saving ? 'CREATING...' : 'CREATE ACCOUNT'}
          </Button>
        </form>

        {/* Show credentials after creation */}
        {created && (
          <div className="mt-4 border-2 border-primary bg-secondary-fixed p-4">
            <p className="font-epilogue font-black text-sm uppercase tracking-widest mb-2">Share these credentials</p>
            <div className="font-grotesk text-sm space-y-1">
              <p><span className="text-outline uppercase text-xs tracking-widest mr-2">Username</span> <strong>{created.username}</strong></p>
              <p><span className="text-outline uppercase text-xs tracking-widest mr-2">Password</span> <strong>{created.password}</strong></p>
            </div>
            <p className="font-grotesk text-xs text-outline mt-3">Copy these now — the password won&apos;t be shown again.</p>
            <button
              onClick={() => setCreated(null)}
              className="font-grotesk text-xs uppercase tracking-widest underline mt-2 block"
            >
              Dismiss
            </button>
          </div>
        )}
      </section>

      {/* Accounts list */}
      <section>
        <h2 className="font-epilogue font-black text-sm uppercase tracking-widest border-b-2 border-primary pb-1 mb-4">
          All Accounts ({accounts.length})
        </h2>

        {loading && <p className="font-grotesk text-sm text-outline">Loading...</p>}

        <div className="space-y-3">
          {accounts.map(a => (
            <div key={a.id} className="bg-white border-2 border-primary p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-epilogue font-black text-base uppercase tracking-tight">
                    {a.displayName ?? a.username}
                    <span className="font-grotesk font-normal text-xs text-outline ml-2 normal-case">@{a.username}</span>
                  </p>
                  {a.project ? (
                    <p className="font-grotesk text-xs text-green-700 mt-0.5">
                      ✓ Posted: <strong>{a.project.projectName}</strong>
                    </p>
                  ) : (
                    <p className="font-grotesk text-xs text-outline mt-0.5">No project yet</p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <select
                    value={a.role}
                    onChange={e => handleRoleChange(a.id, e.target.value)}
                    className={`font-epilogue font-black text-xs uppercase border-2 px-2 py-1 focus:outline-none cursor-pointer ${
                      a.role === 'MENTOR' ? 'border-primary bg-secondary-fixed text-on-secondary-fixed' :
                      a.role === 'ADMIN'  ? 'border-primary bg-primary text-on-primary' :
                      'border-primary/30 bg-white text-primary'
                    }`}
                  >
                    <option value="TEAM">Team</option>
                    <option value="MENTOR">Mentor</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
                <Button
                  type="button"
                  onClick={() => handleDelete(a.id, a.username)}
                  className="text-xs py-1 px-2 text-error flex-shrink-0"
                >
                  Delete
                </Button>
              </div>

              {/* Reset password */}
              <div className="flex gap-2 items-end mt-3 pt-3 border-t border-primary/10">
                <div className="flex-1">
                  <Input
                    label="New Password"
                    value={resetMap[a.id] ?? ''}
                    onChange={e => setResetMap(m => ({ ...m, [a.id]: e.target.value }))}
                    placeholder="Reset password"
                  />
                </div>
                <Button
                  type="button"
                  onClick={() => setResetMap(m => ({ ...m, [a.id]: generatePassword() }))}
                  className="py-2 px-2 text-xs mb-0.5"
                >
                  AUTO
                </Button>
                <Button
                  type="button"
                  onClick={() => handleResetPassword(a.id)}
                  className="py-2 px-2 text-xs mb-0.5"
                >
                  {resetSaved === a.id ? '✓ Saved' : 'Reset'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
