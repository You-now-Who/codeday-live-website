'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { PageHeader } from '@/components/ui/PageHeader'

export function TeamLoginForm() {
  const router = useRouter()
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/teams/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: form.username.trim(), password: form.password }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Login failed')
        return
      }
      router.push('/wall')
    } catch {
      setError('Network error — please try again')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <PageHeader title="Team Login" subtitle="Log in to post and edit your project." />
      <div className="px-6 py-8 max-w-sm mx-auto">
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Username"
            value={form.username}
            onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
            placeholder="teamrocket"
            required
            autoComplete="username"
          />
          <Input
            label="Password"
            type="password"
            value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            placeholder="Given by an organiser"
            required
            autoComplete="current-password"
          />
          {error && (
            <p className="font-grotesk text-sm text-error border-2 border-error px-3 py-2">{error}</p>
          )}
          <Button type="submit" variant="primary" disabled={loading} className="w-full py-4 text-base">
            {loading ? 'LOGGING IN...' : 'LOG IN →'}
          </Button>
        </form>
        <p className="font-grotesk text-xs text-outline mt-6 text-center">
          Don&apos;t have an account? Ask an organiser.
        </p>
      </div>
    </div>
  )
}
