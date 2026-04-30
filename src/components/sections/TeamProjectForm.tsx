'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { PageHeader } from '@/components/ui/PageHeader'

type Account = { id: string; username: string; displayName: string | null }
type Project = { projectName: string; description: string | null; iframeUrl: string } | null

interface TeamProjectFormProps {
  account: Account
  project: Project
  deadlinePassed: boolean
}

export function TeamProjectForm({ account, project, deadlinePassed }: TeamProjectFormProps) {
  const router = useRouter()
  const [form, setForm] = useState({
    projectName: project?.projectName ?? '',
    description: project?.description ?? '',
    iframeUrl:   project?.iframeUrl ?? '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  const displayName = account.displayName ?? account.username

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setSaved(false)
    setLoading(true)
    try {
      const res = await fetch('/api/teams/project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectName: form.projectName.trim(),
          description: form.description.trim() || undefined,
          iframeUrl:   form.iframeUrl.trim(),
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (data.field) setErrors({ [data.field]: data.error })
        else setErrors({ general: data.error })
        return
      }
      setSaved(true)
      router.refresh()
    } catch {
      setErrors({ general: 'Network error — please try again' })
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    setLoggingOut(true)
    await fetch('/api/teams/logout', { method: 'POST' })
    router.refresh()
  }

  return (
    <div>
      <PageHeader
        title={project ? 'Edit Your Project' : 'Post Your Project'}
        subtitle={`Logged in as ${displayName}`}
      />

      <div className="px-6 py-8 max-w-lg mx-auto">

        {deadlinePassed ? (
          <div className="border-4 border-primary bg-primary text-on-primary shadow-hard-lg p-8 rotate-[-0.5deg] mb-8">
            <p className="font-epilogue font-black text-3xl uppercase tracking-tight leading-none">
              Submissions Closed
            </p>
            <p className="font-grotesk text-sm mt-3 opacity-70">
              The deadline has passed — your project is still visible on the wall.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-5">
            <Input
              label="Project Name"
              value={form.projectName}
              onChange={e => setForm(f => ({ ...f, projectName: e.target.value }))}
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
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="What did you build and what problem does it solve?"
                rows={3}
                className="w-full border-2 border-primary bg-white px-3 py-2 font-grotesk text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              />
            </div>

            <div>
              <Input
                label="Live URL"
                value={form.iframeUrl}
                onChange={e => setForm(f => ({ ...f, iframeUrl: e.target.value }))}
                placeholder="https://your-project.vercel.app"
                required
              />
              <p className="font-grotesk text-xs text-outline mt-1">Must start with https://</p>
              {errors.iframeUrl && <p className="font-grotesk text-xs text-error mt-1">{errors.iframeUrl}</p>}
            </div>

            {errors.general && (
              <p className="font-grotesk text-sm text-error border-2 border-error px-3 py-2">{errors.general}</p>
            )}

            {saved && (
              <p className="font-grotesk text-sm text-green-700 border-2 border-green-700 px-3 py-2">
                ✓ Project {project ? 'updated' : 'posted'}! It&apos;s live on the wall.
              </p>
            )}

            <Button type="submit" variant="primary" disabled={loading} className="w-full py-4 text-base">
              {loading ? 'SAVING...' : project ? 'UPDATE PROJECT →' : 'POST PROJECT →'}
            </Button>
          </form>
        )}

        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="font-grotesk text-xs uppercase tracking-widest text-outline hover:text-primary mt-8 block"
        >
          {loggingOut ? 'Logging out...' : '← Log out'}
        </button>
      </div>
    </div>
  )
}
