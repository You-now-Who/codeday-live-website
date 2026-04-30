'use client'

import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { usePolling } from '@/lib/hooks/usePolling'
import { ProjectCard } from '@/components/ui/ProjectCard'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

type Account = { id: string; username: string; displayName: string | null }
type Project = { id: string; teamName: string; projectName: string; description: string | null; iframeUrl: string; createdAt: string }

interface WallClientProps {
  account: Account | null
  userProject: Project | null
  initialProjects: Project[]
  deadlinePassed: boolean
}

function PostForm({ account, existing, deadlinePassed, onSaved }: {
  account: Account
  existing: Project | null
  deadlinePassed: boolean
  onSaved: () => void
}) {
  const router = useRouter()
  const [form, setForm] = useState({
    projectName: existing?.projectName ?? '',
    description: existing?.description ?? '',
    iframeUrl:   existing?.iframeUrl   ?? '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

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
      onSaved()
    } catch {
      setErrors({ general: 'Network error — please try again' })
    } finally {
      setLoading(false)
    }
  }

  if (deadlinePassed) {
    return (
      <p className="font-grotesk text-sm text-outline">
        The submission deadline has passed. Your project is still live on the wall.
      </p>
    )
  }

  return (
    <form onSubmit={handleSave} className="space-y-4 mt-4">
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <Input
            label="Project Name"
            value={form.projectName}
            onChange={e => setForm(f => ({ ...f, projectName: e.target.value }))}
            placeholder="Something Awesome"
            required
          />
          {errors.projectName && <p className="font-grotesk text-xs text-error mt-1">{errors.projectName}</p>}
        </div>
        <div>
          <Input
            label="Live URL"
            value={form.iframeUrl}
            onChange={e => setForm(f => ({ ...f, iframeUrl: e.target.value }))}
            placeholder="https://your-project.vercel.app"
            required
          />
          {errors.iframeUrl && <p className="font-grotesk text-xs text-error mt-1">{errors.iframeUrl}</p>}
        </div>
      </div>
      <div>
        <label className="font-grotesk text-xs font-medium uppercase tracking-widest text-on-surface block mb-1">
          Description <span className="text-outline">(optional)</span>
        </label>
        <textarea
          value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          placeholder="What did you build and what problem does it solve?"
          rows={2}
          className="w-full border-2 border-primary bg-white px-3 py-2 font-grotesk text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
        />
      </div>
      {errors.general && (
        <p className="font-grotesk text-sm text-error border-2 border-error px-3 py-2">{errors.general}</p>
      )}
      {saved && (
        <p className="font-grotesk text-sm border-2 border-primary px-3 py-2">
          ✓ {existing ? 'Updated!' : 'Posted!'} It&apos;s live on the wall.
        </p>
      )}
      <Button type="submit" variant="primary" disabled={loading} className="py-3 px-6">
        {loading ? 'SAVING...' : existing ? 'UPDATE →' : 'POST TO WALL →'}
      </Button>
    </form>
  )
}

export function WallClient({ account, userProject, initialProjects, deadlinePassed }: WallClientProps) {
  const router = useRouter()
  const [editing, setEditing] = useState(!userProject && !!account)
  const [loggingOut, setLoggingOut] = useState(false)

  const fetcher = useCallback(
    () => fetch('/api/projects').then(r => r.json()).then(d => d.projects),
    []
  )
  const { data } = usePolling<Project[]>(fetcher, 30_000)
  const projects: Project[] = data ?? initialProjects

  const handleLogout = async () => {
    setLoggingOut(true)
    await fetch('/api/teams/logout', { method: 'POST' })
    router.refresh()
  }

  const displayName = account?.displayName ?? account?.username

  return (
    <div>
      {/* ── Page header ── */}
      <div className="border-b-2 border-primary px-6 py-5">
        <div className="max-w-6xl mx-auto flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-epilogue font-black text-4xl uppercase tracking-tight leading-none">Wall</h1>
            <p className="font-grotesk text-sm text-outline mt-1">
              {projects.length === 0
                ? 'No projects yet — be the first!'
                : `${projects.length} team${projects.length === 1 ? '' : 's'} building`}
            </p>
          </div>

          {account ? (
            <div className="flex items-center gap-3">
              <span className="font-grotesk text-xs text-outline">
                Logged in as <strong className="text-primary">{displayName}</strong>
              </span>
              <button
                onClick={() => setEditing(e => !e)}
                className={`font-epilogue font-bold text-xs uppercase tracking-tight border-2 border-primary px-3 py-2 transition-colors ${
                  editing
                    ? 'bg-primary text-on-primary'
                    : 'hover:bg-secondary-fixed hover:border-secondary-fixed hover:text-on-secondary-fixed'
                }`}
              >
                {editing ? 'Close ✕' : userProject ? 'Edit project ✎' : '+ Post project'}
              </button>
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="font-grotesk text-xs uppercase tracking-widest text-outline hover:text-primary transition-colors"
              >
                {loggingOut ? '...' : 'Log out'}
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="font-epilogue font-bold text-xs uppercase tracking-tight border-2 border-primary px-3 py-2 hover:bg-secondary-fixed hover:border-secondary-fixed hover:text-on-secondary-fixed transition-colors"
            >
              Log in to post →
            </Link>
          )}
        </div>
      </div>

      {/* ── Inline post/edit form ── */}
      {account && editing && (
        <div className="border-b-2 border-primary bg-surface px-6 py-6">
          <div className="max-w-6xl mx-auto">
            <p className="font-epilogue font-black text-sm uppercase tracking-widest mb-1">
              {userProject ? `Editing — ${userProject.projectName}` : 'Post your project'}
            </p>
            <PostForm
              account={account}
              existing={userProject}
              deadlinePassed={deadlinePassed}
              onSaved={() => setEditing(false)}
            />
          </div>
        </div>
      )}

      {/* ── Feed ── */}
      <div className="px-6 py-6">
        <div className="max-w-6xl mx-auto">
          {projects.length === 0 ? (
            <div className="text-center py-24">
              <p className="font-epilogue font-black text-6xl opacity-10 mb-4">✦</p>
              <p className="font-epilogue font-bold text-xl uppercase tracking-tight text-outline">
                Projects will appear here
              </p>
              <p className="font-grotesk text-sm text-outline mt-2">
                Log in and post your project to be first.
              </p>
            </div>
          ) : (
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-5">
              {projects.map((p, i) => (
                <ScrollReveal key={p.id} delay={i * 40}>
                  <div className="break-inside-avoid mb-5">
                    <ProjectCard
                      project={p}
                      isOwn={account?.id != null && p.teamName === (account.displayName ?? account.username)}
                    />
                  </div>
                </ScrollReveal>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
