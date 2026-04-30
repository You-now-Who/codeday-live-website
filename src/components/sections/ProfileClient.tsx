'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { PageHeader } from '@/components/ui/PageHeader'

interface ProfileClientProps {
  account: { id: string; username: string; displayName: string | null }
}

export function ProfileClient({ account }: ProfileClientProps) {
  const router = useRouter()
  const [displayName, setDisplayName] = useState(account.displayName ?? '')
  const [nameStatus, setNameStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [nameError, setNameError] = useState('')

  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [pwStatus, setPwStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [pwError, setPwError] = useState('')

  const [loggingOut, setLoggingOut] = useState(false)

  const saveName = async (e: React.FormEvent) => {
    e.preventDefault()
    setNameStatus('saving')
    setNameError('')
    const res = await fetch('/api/teams/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ displayName }),
    })
    if (res.ok) {
      setNameStatus('saved')
      router.refresh()
      setTimeout(() => setNameStatus('idle'), 3000)
    } else {
      const data = await res.json()
      setNameError(data.error ?? 'Error saving')
      setNameStatus('error')
    }
  }

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPwStatus('saving')
    setPwError('')
    const res = await fetch('/api/teams/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
    })
    if (res.ok) {
      setPwStatus('saved')
      setCurrentPw('')
      setNewPw('')
      setTimeout(() => setPwStatus('idle'), 3000)
    } else {
      const data = await res.json()
      setPwError(data.error ?? 'Error updating password')
      setPwStatus('error')
    }
  }

  const logout = async () => {
    setLoggingOut(true)
    await fetch('/api/teams/logout', { method: 'POST' })
    router.push('/wall')
  }

  return (
    <div>
      <PageHeader title="Profile" subtitle={`@${account.username}`} />

      <div className="px-6 py-8 max-w-md mx-auto space-y-8">

        {/* Display Name */}
        <section className="bg-white border-2 border-primary shadow-hard p-5">
          <h2 className="font-epilogue font-black text-sm uppercase tracking-widest mb-4">Display Name</h2>
          <form onSubmit={saveName} className="space-y-3">
            <Input
              label="Name shown on the wall"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder={account.username}
            />
            {nameError && <p className="font-grotesk text-xs text-error">{nameError}</p>}
            {nameStatus === 'saved' && <p className="font-grotesk text-xs text-green-700">✓ Saved!</p>}
            <Button type="submit" variant="primary" disabled={nameStatus === 'saving'} className="py-2 px-5">
              {nameStatus === 'saving' ? 'Saving…' : 'Save'}
            </Button>
          </form>
        </section>

        {/* Change Password */}
        <section className="bg-white border-2 border-primary shadow-hard p-5">
          <h2 className="font-epilogue font-black text-sm uppercase tracking-widest mb-4">Change Password</h2>
          <form onSubmit={savePassword} className="space-y-3">
            <Input
              label="Current password"
              type="password"
              value={currentPw}
              onChange={e => setCurrentPw(e.target.value)}
              required
              autoComplete="current-password"
            />
            <Input
              label="New password"
              type="password"
              value={newPw}
              onChange={e => setNewPw(e.target.value)}
              required
              autoComplete="new-password"
            />
            {pwError && <p className="font-grotesk text-xs text-error">{pwError}</p>}
            {pwStatus === 'saved' && <p className="font-grotesk text-xs text-green-700">✓ Password updated!</p>}
            <Button type="submit" variant="primary" disabled={pwStatus === 'saving'} className="py-2 px-5">
              {pwStatus === 'saving' ? 'Saving…' : 'Update Password'}
            </Button>
          </form>
        </section>

        {/* Logout */}
        <button
          onClick={logout}
          disabled={loggingOut}
          className="font-grotesk text-xs uppercase tracking-widest text-outline hover:text-primary transition-colors"
        >
          {loggingOut ? 'Logging out…' : '← Log out'}
        </button>
      </div>
    </div>
  )
}
