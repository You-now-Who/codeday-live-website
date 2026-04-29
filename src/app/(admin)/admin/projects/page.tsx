'use client'

import { useState, useEffect } from 'react'
import { adminFetch } from '@/lib/adminFetch'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

type Project = {
  id: string
  teamName: string
  projectName: string
  description: string | null
  iframeUrl: string
}

type FormState = {
  teamName: string
  projectName: string
  description: string
  iframeUrl: string
  error: string
  loading: boolean
}

const emptyForm: FormState = { teamName: '', projectName: '', description: '', iframeUrl: '', error: '', loading: false }

function ProjectForm({
  form,
  setForm,
  onSubmit,
  onCancel,
  title,
}: {
  form: FormState
  setForm: React.Dispatch<React.SetStateAction<FormState>>
  onSubmit: (e: React.FormEvent) => void
  onCancel: () => void
  title: string
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <h2 className="font-epilogue font-bold text-sm uppercase">{title}</h2>
      <Input label="Team Name" value={form.teamName} onChange={e => setForm(f => ({ ...f, teamName: e.target.value }))} required />
      <Input label="Project Name" value={form.projectName} onChange={e => setForm(f => ({ ...f, projectName: e.target.value }))} required />
      <Input label="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
      <Input label="iframe URL (HTTPS)" value={form.iframeUrl} onChange={e => setForm(f => ({ ...f, iframeUrl: e.target.value }))} placeholder="https://" required />
      {form.iframeUrl.startsWith('https://') && (
        <div className="relative w-full border-2 border-primary" style={{ paddingBottom: '30%' }}>
          <iframe
            src={form.iframeUrl}
            className="absolute inset-0 w-full h-full"
            sandbox="allow-scripts allow-same-origin allow-forms"
            title="preview"
          />
        </div>
      )}
      {form.error && <p className="font-grotesk text-sm text-error">{form.error}</p>}
      <div className="flex gap-2">
        <Button type="submit" variant="accent" disabled={form.loading}>SAVE</Button>
        <Button type="button" onClick={onCancel}>CANCEL</Button>
      </div>
    </form>
  )
}

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [addForm, setAddForm] = useState<FormState>(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<FormState>(emptyForm)

  const fetchProjects = async () => {
    const res = await adminFetch('/api/projects')
    const { projects } = await res.json()
    setProjects(projects)
  }

  useEffect(() => { fetchProjects() }, [])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setAddForm(f => ({ ...f, loading: true, error: '' }))
    const res = await adminFetch('/api/projects', {
      method: 'POST',
      body: JSON.stringify({ teamName: addForm.teamName, projectName: addForm.projectName, description: addForm.description || undefined, iframeUrl: addForm.iframeUrl }),
    })
    if (!res.ok) {
      const data = await res.json()
      setAddForm(f => ({ ...f, loading: false, error: data.error ?? 'Error' }))
      return
    }
    await fetchProjects()
    setAddForm(emptyForm)
    setShowAdd(false)
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingId) return
    setEditForm(f => ({ ...f, loading: true, error: '' }))
    const res = await adminFetch(`/api/projects/${editingId}`, {
      method: 'PATCH',
      body: JSON.stringify({ teamName: editForm.teamName, projectName: editForm.projectName, description: editForm.description || null, iframeUrl: editForm.iframeUrl }),
    })
    if (!res.ok) {
      const data = await res.json()
      setEditForm(f => ({ ...f, loading: false, error: data.error ?? 'Error' }))
      return
    }
    await fetchProjects()
    setEditingId(null)
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this project?')) return
    await adminFetch(`/api/projects/${id}`, { method: 'DELETE' })
    await fetchProjects()
  }

  const startEdit = (p: Project) => {
    setEditingId(p.id)
    setEditForm({ teamName: p.teamName, projectName: p.projectName, description: p.description ?? '', iframeUrl: p.iframeUrl, error: '', loading: false })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-epilogue font-black text-3xl uppercase tracking-tight">Projects</h1>
        <Button variant="primary" onClick={() => setShowAdd(v => !v)}>{showAdd ? 'CANCEL' : 'ADD PROJECT'}</Button>
      </div>

      {showAdd && (
        <div className="bg-white border-2 border-primary shadow-hard p-4 mb-6">
          <ProjectForm form={addForm} setForm={setAddForm} onSubmit={handleAdd} onCancel={() => setShowAdd(false)} title="New Project" />
        </div>
      )}

      <div className="bg-white border-2 border-primary shadow-hard overflow-x-auto">
        <table className="w-full text-sm font-grotesk">
          <thead>
            <tr className="border-b-2 border-primary">
              <th className="text-left px-4 py-2 font-epilogue uppercase text-xs">Team</th>
              <th className="text-left px-4 py-2 font-epilogue uppercase text-xs">Project</th>
              <th className="text-left px-4 py-2 font-epilogue uppercase text-xs">URL</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {projects.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-6 text-outline text-center">No projects</td></tr>
            )}
            {projects.map(p => (
              editingId === p.id ? (
                <tr key={p.id} className="border-b border-primary/20">
                  <td colSpan={4} className="p-4">
                    <ProjectForm form={editForm} setForm={setEditForm} onSubmit={handleEdit} onCancel={() => setEditingId(null)} title="Edit Project" />
                  </td>
                </tr>
              ) : (
                <tr key={p.id} className="border-b border-primary/20 hover:bg-surface">
                  <td className="px-4 py-2 font-medium">{p.teamName}</td>
                  <td className="px-4 py-2">{p.projectName}</td>
                  <td className="px-4 py-2 text-outline truncate max-w-xs">
                    <a href={p.iframeUrl} target="_blank" rel="noopener noreferrer" className="underline">{p.iframeUrl}</a>
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex gap-2 justify-end">
                      <Button onClick={() => startEdit(p)} className="text-xs py-1 px-2">EDIT</Button>
                      <Button onClick={() => handleDelete(p.id)} className="text-xs py-1 px-2 text-error">DELETE</Button>
                    </div>
                  </td>
                </tr>
              )
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
