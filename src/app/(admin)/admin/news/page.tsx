'use client'

import { useState, useEffect } from 'react'
import { adminFetch } from '@/lib/adminFetch'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

type NewsPost = {
  id: string
  headline: string
  body: string
  imageUrl: string | null
  type: 'NEWS' | 'ANNOUNCEMENT'
  pinned: boolean
  createdAt: string
}

type FormState = {
  headline: string
  body: string
  imageUrl: string
  type: 'NEWS' | 'ANNOUNCEMENT'
  pinned: boolean
  error: string
  loading: boolean
}

const emptyForm: FormState = { headline: '', body: '', imageUrl: '', type: 'NEWS', pinned: false, error: '', loading: false }

function NewsForm({
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
      <Input label="Headline" value={form.headline} onChange={e => setForm(f => ({ ...f, headline: e.target.value }))} required />
      <div className="flex flex-col gap-1">
        <label className="font-grotesk text-xs font-medium uppercase tracking-widest text-on-surface">Body</label>
        <textarea
          className="border-0 border-b-2 border-primary bg-transparent outline-none px-0 py-2 font-grotesk text-base text-on-surface resize-none"
          rows={3}
          value={form.body}
          onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
          required
        />
      </div>
      <Input label="Image URL (optional)" value={form.imageUrl} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))} placeholder="https://..." />
      {form.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={form.imageUrl} alt="" className="dither w-48 border-2 border-primary" />
      )}
      <div className="flex flex-col gap-1">
        <label className="font-grotesk text-xs font-medium uppercase tracking-widest text-on-surface">Type</label>
        <select
          className="border-0 border-b-2 border-primary bg-transparent outline-none px-0 py-2 font-grotesk text-base"
          value={form.type}
          onChange={e => setForm(f => ({ ...f, type: e.target.value as 'NEWS' | 'ANNOUNCEMENT' }))}
        >
          <option value="NEWS">NEWS</option>
          <option value="ANNOUNCEMENT">ANNOUNCEMENT</option>
        </select>
      </div>
      <label className="flex items-center gap-2 font-grotesk text-sm cursor-pointer">
        <input type="checkbox" checked={form.pinned} onChange={e => setForm(f => ({ ...f, pinned: e.target.checked }))} />
        Pinned
      </label>
      {form.error && <p className="font-grotesk text-sm text-error">{form.error}</p>}
      <div className="flex gap-2">
        <Button type="submit" variant="accent" disabled={form.loading}>SAVE</Button>
        <Button type="button" onClick={onCancel}>CANCEL</Button>
      </div>
    </form>
  )
}

export default function AdminNewsPage() {
  const [posts, setPosts] = useState<NewsPost[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [addForm, setAddForm] = useState<FormState>(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<FormState>(emptyForm)

  const fetchPosts = async () => {
    const res = await adminFetch('/api/news')
    const { posts } = await res.json()
    setPosts(posts)
  }

  useEffect(() => { fetchPosts() }, [])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setAddForm(f => ({ ...f, loading: true, error: '' }))
    const res = await adminFetch('/api/news', {
      method: 'POST',
      body: JSON.stringify({
        headline: addForm.headline,
        body: addForm.body,
        imageUrl: addForm.imageUrl || null,
        type: addForm.type,
        pinned: addForm.pinned,
      }),
    })
    if (!res.ok) {
      const data = await res.json()
      setAddForm(f => ({ ...f, loading: false, error: data.error ?? 'Error' }))
      return
    }
    await fetchPosts()
    setAddForm(emptyForm)
    setShowAdd(false)
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingId) return
    setEditForm(f => ({ ...f, loading: true, error: '' }))
    const res = await adminFetch(`/api/news/${editingId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        headline: editForm.headline,
        body: editForm.body,
        imageUrl: editForm.imageUrl || null,
        type: editForm.type,
        pinned: editForm.pinned,
      }),
    })
    if (!res.ok) {
      const data = await res.json()
      setEditForm(f => ({ ...f, loading: false, error: data.error ?? 'Error' }))
      return
    }
    await fetchPosts()
    setEditingId(null)
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this post?')) return
    await adminFetch(`/api/news/${id}`, { method: 'DELETE' })
    await fetchPosts()
  }

  const startEdit = (post: NewsPost) => {
    setEditingId(post.id)
    setEditForm({ headline: post.headline, body: post.body, imageUrl: post.imageUrl ?? '', type: post.type, pinned: post.pinned, error: '', loading: false })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-epilogue font-black text-3xl uppercase tracking-tight">News</h1>
        <Button variant="primary" onClick={() => setShowAdd(v => !v)}>{showAdd ? 'CANCEL' : 'ADD POST'}</Button>
      </div>

      {showAdd && (
        <div className="bg-white border-2 border-primary shadow-hard p-4 mb-6">
          <NewsForm form={addForm} setForm={setAddForm} onSubmit={handleAdd} onCancel={() => setShowAdd(false)} title="New Post" />
        </div>
      )}

      <div className="bg-white border-2 border-primary shadow-hard overflow-x-auto">
        <table className="w-full text-sm font-grotesk">
          <thead>
            <tr className="border-b-2 border-primary">
              <th className="text-left px-4 py-2 font-epilogue uppercase text-xs">Headline</th>
              <th className="text-left px-4 py-2 font-epilogue uppercase text-xs">Type</th>
              <th className="text-left px-4 py-2 font-epilogue uppercase text-xs">Pinned</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {posts.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-6 text-outline text-center">No posts</td></tr>
            )}
            {posts.map(post => (
              editingId === post.id ? (
                <tr key={post.id} className="border-b border-primary/20">
                  <td colSpan={4} className="p-4">
                    <NewsForm form={editForm} setForm={setEditForm} onSubmit={handleEdit} onCancel={() => setEditingId(null)} title="Edit Post" />
                  </td>
                </tr>
              ) : (
                <tr key={post.id} className="border-b border-primary/20 hover:bg-surface">
                  <td className="px-4 py-2 font-medium">{post.headline}</td>
                  <td className="px-4 py-2">{post.type}</td>
                  <td className="px-4 py-2">{post.pinned ? '★' : '—'}</td>
                  <td className="px-4 py-2">
                    <div className="flex gap-2 justify-end">
                      <Button onClick={() => startEdit(post)} className="text-xs py-1 px-2">EDIT</Button>
                      <Button onClick={() => handleDelete(post.id)} className="text-xs py-1 px-2 text-error">DELETE</Button>
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
