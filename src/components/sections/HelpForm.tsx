'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { PageHeader } from '@/components/ui/PageHeader'

export function HelpForm() {
  const [teamName, setTeamName] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!teamName.trim()) {
      setError('Please enter your team name')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/help-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamName: teamName.trim() }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Something went wrong')
        return
      }
      setSubmitted(true)
    } catch {
      setError('Network error — please try again')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div>
        <PageHeader title="Help" />
        <div className="px-6 py-12 text-center">
          <div className="border-4 border-primary bg-secondary-fixed shadow-hard-lg p-10 max-w-md mx-auto rotate-[-1deg]">
            <h2 className="font-epilogue font-black text-4xl uppercase tracking-tight leading-none">
              HELP IS ON THE WAY
            </h2>
            <p className="font-grotesk text-base mt-4">
              A mentor will come find team <strong>{teamName}</strong> soon.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Get Help" subtitle="A mentor will come find you." />
      <div className="px-6 py-8 max-w-md mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Team Name"
            value={teamName}
            onChange={e => setTeamName(e.target.value)}
            placeholder="Team Alpha"
            required
          />
          {error && (
            <p className="font-grotesk text-sm text-error">{error}</p>
          )}
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            className="w-full py-3"
          >
            {loading ? 'SENDING...' : 'REQUEST HELP'}
          </Button>
        </form>
      </div>
    </div>
  )
}
