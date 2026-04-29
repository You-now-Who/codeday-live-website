'use client'

import { useState, useEffect } from 'react'
import { adminFetch } from '@/lib/adminFetch'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

type ResourceLink = {
  id: string
  title: string
  url: string
  description: string | null
  category: string
}

type FormState = {
  title: string
  url: string
  description: string
  category: string
  error: string
  loading: boolean
}

const emptyForm: FormState = { title: '', url: '', description: '', category: '', error: '', loading: false }
const CATEGORY_SUGGESTIONS = ['TOOLS', 'DOCS', 'DESIGN', 'PRIZES', 'OTHER']

function ResourceForm({
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
      <Input label="Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
      <Input label="URL" value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} placeholder="https://" required />
      <Input label="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
      <div>
        <Input label="Category" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} required />
        <div className="flex gap-2 mt-2 flex-wrap">
          {CATEGORY_SUGGESTIONS.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setForm(f => ({ ...f, category: cat }))}
              className="font-grotesk text-xs uppercase bg-surface border border-primary px-2 py-0.5 hover:bg-secondary-fixed"
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
      {form.error && <p className="font-grotesk text-sm text-error">{form.error}</p>}
      <div className="flex gap-2">
        <Button type="submit" variant="accent" disabled={form.loading}>SAVE</Button>
        <Button type="button" onClick={onCancel}>CANCEL</Button>
      </div>
    </form>
  )
}

export default function AdminResourcesPage() {
  const [resources, setResources] = useState<ResourceLink[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [addForm, setAddForm] = useState<FormState>(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<FormState>(emptyForm)

  const fetchResources = async () => {
    const res = await adminFetch('/api/resources')
    const { resources } = await res.json()
    setResources(resources)
  }

  useEffect(() => { fetchResources() }, [])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setAddForm(f => ({ ...f, loading: true, error: '' }))
    const res = await adminFetch('/api/resources', {
      method: 'POST',
      body: JSON.stringify({ title: addForm.title, url: addForm.url, description: addForm.description || undefined, category: addForm.category }),
    })
    if (!res.ok) {
      const data = await res.json()
      setAddForm(f => ({ ...f, loading: false, error: data.error ?? 'Error' }))
      return
    }
    await fetchResources()
    setAddForm(emptyForm)
    setShowAdd(false)
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingId) return
    setEditForm(f => ({ ...f, loading: true, error: '' }))
    const res = await adminFetch(`/api/resources/${editingId}`, {
      method: 'PATCH',
      body: JSON.stringify({ title: editForm.title, url: editForm.url, description: editForm.description || null, category: editForm.category }),
    })
    if (!res.ok) {
      const data = await res.json()
      setEditForm(f => ({ ...f, loading: false, error: data.error ?? 'Error' }))
      return
    }
    await fetchResources()
    setEditingId(null)
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this resource?')) return
    await adminFetch(`/api/resources/${id}`, { method: 'DELETE' })
    await fetchResources()
  }

  const startEdit = (r: ResourceLink) => {
    setEditingId(r.id)
    setEditForm({ title: r.title, url: r.url, description: r.description ?? '', category: r.category, error: '', loading: false })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-epilogue font-black text-3xl uppercase tracking-tight">Resources</h1>
        <Button variant="primary" onClick={() => setShowAdd(v => !v)}>{showAdd ? 'CANCEL' : 'ADD RESOURCE'}</Button>
      </div>

      {showAdd && (
        <div className="bg-white border-2 border-primary shadow-hard p-4 mb-6">
          <ResourceForm form={addForm} setForm={setAddForm} onSubmit={handleAdd} onCancel={() => setShowAdd(false)} title="New Resource" />
        </div>
      )}

      <div className="bg-white border-2 border-primary shadow-hard overflow-x-auto">
        <table className="w-full text-sm font-grotesk">
          <thead>
            <tr className="border-b-2 border-primary">
              <th className="text-left px-4 py-2 font-epilogue uppercase text-xs">Title</th>
              <th className="text-left px-4 py-2 font-epilogue uppercase text-xs">Category</th>
              <th className="text-left px-4 py-2 font-epilogue uppercase text-xs">URL</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {resources.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-6 text-outline text-center">No resources</td></tr>
            )}
            {resources.map(r => (
              editingId === r.id ? (
                <tr key={r.id} className="border-b border-primary/20">
                  <td colSpan={4} className="p-4">
                    <ResourceForm form={editForm} setForm={setEditForm} onSubmit={handleEdit} onCancel={() => setEditingId(null)} title="Edit Resource" />
                  </td>
                </tr>
              ) : (
                <tr key={r.id} className="border-b border-primary/20 hover:bg-surface">
                  <td className="px-4 py-2 font-medium">
                    {r.title}
                    {r.description && <span className="block text-outline text-xs">{r.description}</span>}
                  </td>
                  <td className="px-4 py-2">{r.category}</td>
                  <td className="px-4 py-2 text-outline truncate max-w-xs">
                    <a href={r.url} target="_blank" rel="noopener noreferrer" className="underline">{r.url}</a>
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex gap-2 justify-end">
                      <Button onClick={() => startEdit(r)} className="text-xs py-1 px-2">EDIT</Button>
                      <Button onClick={() => handleDelete(r.id)} className="text-xs py-1 px-2 text-error">DELETE</Button>
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
