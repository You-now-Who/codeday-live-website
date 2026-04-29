'use client'

import { useState, useEffect } from 'react'
import { adminFetch } from '@/lib/adminFetch'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

type ScheduleItem = {
  id: string
  title: string
  description: string | null
  location: string | null
  startsAt: string
  endsAt: string | null
}

type FormState = {
  title: string
  description: string
  location: string
  startsAt: string
  endsAt: string
  error: string
  loading: boolean
}

const emptyForm: FormState = { title: '', description: '', location: '', startsAt: '', endsAt: '', error: '', loading: false }

function toDatetimeLocal(iso: string) {
  return iso ? iso.slice(0, 16) : ''
}

export default function AdminSchedulePage() {
  const [items, setItems] = useState<ScheduleItem[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [addForm, setAddForm] = useState<FormState>(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<FormState>(emptyForm)

  const fetchItems = async () => {
    const res = await adminFetch('/api/schedule')
    const { items } = await res.json()
    setItems(items)
  }

  useEffect(() => { fetchItems() }, [])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setAddForm(f => ({ ...f, loading: true, error: '' }))
    const res = await adminFetch('/api/schedule', {
      method: 'POST',
      body: JSON.stringify({
        title: addForm.title,
        description: addForm.description || undefined,
        location: addForm.location || undefined,
        startsAt: addForm.startsAt,
        endsAt: addForm.endsAt || undefined,
      }),
    })
    if (!res.ok) {
      const data = await res.json()
      setAddForm(f => ({ ...f, loading: false, error: data.error ?? 'Error' }))
      return
    }
    await fetchItems()
    setAddForm(emptyForm)
    setShowAdd(false)
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingId) return
    setEditForm(f => ({ ...f, loading: true, error: '' }))
    const res = await adminFetch(`/api/schedule/${editingId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        title: editForm.title,
        description: editForm.description || null,
        location: editForm.location || null,
        startsAt: editForm.startsAt,
        endsAt: editForm.endsAt || null,
      }),
    })
    if (!res.ok) {
      const data = await res.json()
      setEditForm(f => ({ ...f, loading: false, error: data.error ?? 'Error' }))
      return
    }
    await fetchItems()
    setEditingId(null)
    setEditForm(emptyForm)
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this item?')) return
    await adminFetch(`/api/schedule/${id}`, { method: 'DELETE' })
    await fetchItems()
  }

  const startEdit = (item: ScheduleItem) => {
    setEditingId(item.id)
    setEditForm({
      title: item.title,
      description: item.description ?? '',
      location: item.location ?? '',
      startsAt: toDatetimeLocal(item.startsAt),
      endsAt: item.endsAt ? toDatetimeLocal(item.endsAt) : '',
      error: '',
      loading: false,
    })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-epilogue font-black text-3xl uppercase tracking-tight">Schedule</h1>
        <Button variant="primary" onClick={() => setShowAdd(v => !v)}>
          {showAdd ? 'CANCEL' : 'ADD ITEM'}
        </Button>
      </div>

      {showAdd && (
        <form onSubmit={handleAdd} className="bg-white border-2 border-primary shadow-hard p-4 mb-6 space-y-3">
          <h2 className="font-epilogue font-bold text-sm uppercase">New Item</h2>
          <Input label="Title" value={addForm.title} onChange={e => setAddForm(f => ({ ...f, title: e.target.value }))} required />
          <Input label="Description" value={addForm.description} onChange={e => setAddForm(f => ({ ...f, description: e.target.value }))} />
          <Input label="Location" value={addForm.location} onChange={e => setAddForm(f => ({ ...f, location: e.target.value }))} />
          <Input label="Starts At" type="datetime-local" value={addForm.startsAt} onChange={e => setAddForm(f => ({ ...f, startsAt: e.target.value }))} required />
          <Input label="Ends At" type="datetime-local" value={addForm.endsAt} onChange={e => setAddForm(f => ({ ...f, endsAt: e.target.value }))} />
          {addForm.error && <p className="font-grotesk text-sm text-error">{addForm.error}</p>}
          <Button type="submit" variant="accent" disabled={addForm.loading}>SAVE</Button>
        </form>
      )}

      <div className="bg-white border-2 border-primary shadow-hard overflow-x-auto">
        <table className="w-full text-sm font-grotesk">
          <thead>
            <tr className="border-b-2 border-primary">
              <th className="text-left px-4 py-2 font-epilogue uppercase text-xs">Time</th>
              <th className="text-left px-4 py-2 font-epilogue uppercase text-xs">Title</th>
              <th className="text-left px-4 py-2 font-epilogue uppercase text-xs">Location</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-6 text-outline text-center">No items</td></tr>
            )}
            {items.map(item => (
              editingId === item.id ? (
                <tr key={item.id} className="border-b border-primary/20">
                  <td colSpan={4} className="p-4">
                    <form onSubmit={handleEdit} className="space-y-3">
                      <Input label="Title" value={editForm.title} onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))} required />
                      <Input label="Description" value={editForm.description} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} />
                      <Input label="Location" value={editForm.location} onChange={e => setEditForm(f => ({ ...f, location: e.target.value }))} />
                      <Input label="Starts At" type="datetime-local" value={editForm.startsAt} onChange={e => setEditForm(f => ({ ...f, startsAt: e.target.value }))} required />
                      <Input label="Ends At" type="datetime-local" value={editForm.endsAt} onChange={e => setEditForm(f => ({ ...f, endsAt: e.target.value }))} />
                      {editForm.error && <p className="font-grotesk text-sm text-error">{editForm.error}</p>}
                      <div className="flex gap-2">
                        <Button type="submit" variant="accent" disabled={editForm.loading}>SAVE</Button>
                        <Button type="button" onClick={() => setEditingId(null)}>CANCEL</Button>
                      </div>
                    </form>
                  </td>
                </tr>
              ) : (
                <tr key={item.id} className="border-b border-primary/20 hover:bg-surface">
                  <td className="px-4 py-2 tabular-nums whitespace-nowrap">
                    {new Date(item.startsAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-4 py-2 font-medium">
                    {item.title}
                    {item.description && <span className="block text-outline text-xs">{item.description}</span>}
                  </td>
                  <td className="px-4 py-2 text-outline">{item.location ?? '—'}</td>
                  <td className="px-4 py-2">
                    <div className="flex gap-2 justify-end">
                      <Button onClick={() => startEdit(item)} className="text-xs py-1 px-2">EDIT</Button>
                      <Button onClick={() => handleDelete(item.id)} className="text-xs py-1 px-2 text-error">DELETE</Button>
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
