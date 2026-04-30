'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { PageHeader } from '@/components/ui/PageHeader'

interface SubmitFormProps {
  deadlinePassed: boolean
  requiresCode: boolean
}

type Field = 'teamName' | 'projectName' | 'iframeUrl' | 'submitCode'

export function SubmitForm({ deadlinePassed, requiresCode }: SubmitFormProps) {
  const [form, setForm] = useState({
    teamName: '', projectName: '', description: '', iframeUrl: '', submitCode: '',
  })
  const [errors, setErrors] = useState<Partial<Record<Field | 'general', string>>>({})
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState<{ teamName: string; projectName: string } | null>(null)
  const [isUpdate, setIsUpdate] = useState(false)

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)
    try {
      const res = await fetch('/api/projects/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamName:    form.teamName.trim(),
          projectName: form.projectName.trim(),
          description: form.description.trim() || undefined,
          iframeUrl:   form.iframeUrl.trim(),
          submitCode:  form.submitCode.trim() || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (data.field) {
          setErrors({ [data.field]: data.error })
        } else {
          setErrors({ general: data.error })
        }
        return
      }
      setIsUpdate(false) // could detect from status 200 vs 201 but upsert always returns 201 here
      setSubmitted({ teamName: form.teamName.trim(), projectName: form.projectName.trim() })
    } catch {
      setErrors({ general: 'Network error — please try again' })
    } finally {
      setLoading(false)
    }
  }

  if (deadlinePassed) {
    return (
      <div>
        <PageHeader title="Submit Project" />
        <div className="px-6 py-12 max-w-lg mx-auto text-center">
          <div className="border-4 border-primary bg-primary text-on-primary shadow-hard-lg p-10 rotate-[-0.5deg]">
            <p className="font-epilogue font-black text-4xl uppercase tracking-tight leading-none">
              Submissions Closed
            </p>
            <p className="font-grotesk text-sm mt-4 opacity-70">
              The submission deadline has passed.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div>
        <PageHeader title="Submit Project" />
        <div className="px-6 py-12 max-w-lg mx-auto">
          <div className="border-4 border-primary bg-secondary-fixed shadow-hard-lg p-10 rotate-[-0.5deg]">
            <p className="font-epilogue font-black text-4xl uppercase tracking-tight leading-none mb-3">
              {isUpdate ? 'Updated!' : "You're in!"}
            </p>
            <p className="font-grotesk text-base">
              <strong>{submitted.projectName}</strong> by team <strong>{submitted.teamName}</strong> has been {isUpdate ? 'updated' : 'submitted'}.
            </p>
            <p className="font-grotesk text-sm mt-4 opacity-70">
              Need to change something? Submit again with the same team name to update.
            </p>
          </div>
          <button
            onClick={() => { setSubmitted(null); setForm(f => ({ ...f, projectName: '', description: '', iframeUrl: '' })) }}
            className="font-grotesk text-xs uppercase tracking-widest text-outline hover:text-primary mt-6 block"
          >
            ← Submit another / update
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Submit Project" subtitle="Submit once — resubmit anytime to update." />

      <div className="px-6 py-8 max-w-lg mx-auto">
        <form onSubmit={handleSubmit} className="space-y-5">

          <Input
            label="Team Name"
            value={form.teamName}
            onChange={set('teamName')}
            placeholder="Team Rocket"
            required
          />
          {errors.teamName && <p className="font-grotesk text-xs text-error -mt-3">{errors.teamName}</p>}

          <Input
            label="Project Name"
            value={form.projectName}
            onChange={set('projectName')}
            placeholder="Something Awesome"
            required
          />
          {errors.projectName && <p className="font-grotesk text-xs text-error -mt-3">{errors.projectName}</p>}

          <div>
            <label className="font-grotesk text-xs font-medium uppercase tracking-widest text-on-surface block mb-1">
              Description <span className="text-outline">(optional)</span>
            </label>
            <textarea
              value={form.description}
              onChange={set('description')}
              placeholder="What did you build and what problem does it solve?"
              rows={3}
              className="w-full border-2 border-primary bg-white px-3 py-2 font-grotesk text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
          </div>

          <div>
            <Input
              label="Project URL"
              value={form.iframeUrl}
              onChange={set('iframeUrl')}
              placeholder="https://your-project.vercel.app"
              required
            />
            <p className="font-grotesk text-xs text-outline mt-1">
              A live URL — used for demos during judging. Must start with https://
            </p>
            {errors.iframeUrl && <p className="font-grotesk text-xs text-error mt-1">{errors.iframeUrl}</p>}
          </div>

          {requiresCode && (
            <div>
              <Input
                label="Event Code"
                value={form.submitCode}
                onChange={set('submitCode')}
                placeholder="Ask an organiser"
                required
              />
              {errors.submitCode && <p className="font-grotesk text-xs text-error -mt-3">{errors.submitCode}</p>}
            </div>
          )}

          {errors.general && (
            <p className="font-grotesk text-sm text-error border-2 border-error px-3 py-2">
              {errors.general}
            </p>
          )}

          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            className="w-full py-4 text-base"
          >
            {loading ? 'SUBMITTING...' : 'SUBMIT PROJECT →'}
          </Button>
        </form>
      </div>
    </div>
  )
}
