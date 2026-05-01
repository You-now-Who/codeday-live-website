'use client'

import { useState, useEffect } from 'react'
import { adminFetch } from '@/lib/adminFetch'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

type BlogPost = {
  id: string
  title: string
  excerpt: string | null
  coverImageUrl: string | null
  published: boolean
  createdAt: string
}

type FormState = {
  title: string
  excerpt: string
  coverImageUrl: string
  body: string
  published: boolean
  error: string
  loading: boolean
}

const emptyForm: FormState = {
  title: '', excerpt: '', coverImageUrl: '', body: '', published: false, error: '', loading: false,
}

function BlogForm({
  form,
  setForm,
  onSubmit,
  onCancel,
  heading,
}: {
  form: FormState
  setForm: React.Dispatch<React.SetStateAction<FormState>>
  onSubmit: (e: React.FormEvent) => void
  onCancel: () => void
  heading: string
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <h2 className="font-epilogue font-bold text-sm uppercase">{heading}</h2>
      <Input label="Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
      <Input label="Excerpt (optional)" value={form.excerpt} onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))} />
      <Input label="Cover Image URL (optional)" value={form.coverImageUrl} onChange={e => setForm(f => ({ ...f, coverImageUrl: e.target.value }))} placeholder="https://" />
      <div className="flex flex-col gap-1">
        <label className="font-grotesk text-xs font-medium uppercase tracking-widest text-primary/70">
          Body (Markdown)
        </label>
        <textarea
          value={form.body}
          onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
          required
          rows={14}
          placeholder="Write in **markdown**..."
          className="border-0 border-b-2 border-primary bg-transparent outline-none focus:border-secondary-fixed font-grotesk text-sm text-on-surface resize-y p-0 py-2 caret-[#c3f400] w-full index-card px-3"
        />
      </div>
      <label className="flex items-center gap-2 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={form.published}
          onChange={e => setForm(f => ({ ...f, published: e.target.checked }))}
          className="w-4 h-4 border-2 border-primary accent-[#c3f400]"
        />
        <span className="font-grotesk text-sm uppercase tracking-widest">Published</span>
      </label>
      {form.error && <p className="font-grotesk text-sm text-error">{form.error}</p>}
      <div className="flex gap-2">
        <Button type="submit" variant="accent" disabled={form.loading}>SAVE</Button>
        <Button type="button" onClick={onCancel}>CANCEL</Button>
      </div>
    </form>
  )
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [addForm, setAddForm] = useState<FormState>(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<FormState>(emptyForm)

  const fetchPosts = async () => {
    const res = await adminFetch('/api/blog')
    const data = await res.json()
    setPosts(data.posts ?? [])
  }

  useEffect(() => { fetchPosts() }, [])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setAddForm(f => ({ ...f, loading: true, error: '' }))
    const res = await adminFetch('/api/blog', {
      method: 'POST',
      body: JSON.stringify({
        title: addForm.title,
        body: addForm.body,
        excerpt: addForm.excerpt || undefined,
        coverImageUrl: addForm.coverImageUrl || undefined,
        published: addForm.published,
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
    const res = await adminFetch(`/api/blog/${editingId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        title: editForm.title,
        body: editForm.body,
        excerpt: editForm.excerpt || null,
        coverImageUrl: editForm.coverImageUrl || null,
        published: editForm.published,
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
    await adminFetch(`/api/blog/${id}`, { method: 'DELETE' })
    await fetchPosts()
  }

  const startEdit = (p: BlogPost) => {
    setEditingId(p.id)
    // fetch full post to get body
    adminFetch(`/api/blog/${p.id}`).then(r => r.json()).then(data => {
      const post = data.post
      setEditForm({
        title: post.title,
        excerpt: post.excerpt ?? '',
        coverImageUrl: post.coverImageUrl ?? '',
        body: post.body,
        published: post.published,
        error: '',
        loading: false,
      })
    })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-epilogue font-black text-3xl uppercase tracking-tight">Blog</h1>
        <Button variant="primary" onClick={() => setShowAdd(v => !v)}>
          {showAdd ? 'CANCEL' : 'NEW POST'}
        </Button>
      </div>

      {showAdd && (
        <div className="bg-white border-2 border-primary shadow-hard p-6 mb-6">
          <BlogForm form={addForm} setForm={setAddForm} onSubmit={handleAdd} onCancel={() => setShowAdd(false)} heading="New Post" />
        </div>
      )}

      <div className="bg-white border-2 border-primary shadow-hard overflow-x-auto">
        <table className="w-full text-sm font-grotesk">
          <thead>
            <tr className="border-b-2 border-primary">
              <th className="text-left px-4 py-2 font-epilogue uppercase text-xs">Title</th>
              <th className="text-left px-4 py-2 font-epilogue uppercase text-xs">Status</th>
              <th className="text-left px-4 py-2 font-epilogue uppercase text-xs">Date</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody>
            {posts.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-6 text-outline text-center">No posts yet</td></tr>
            )}
            {posts.map(p => (
              editingId === p.id ? (
                <tr key={p.id} className="border-b border-primary/20">
                  <td colSpan={4} className="p-4">
                    <BlogForm form={editForm} setForm={setEditForm} onSubmit={handleEdit} onCancel={() => setEditingId(null)} heading="Edit Post" />
                  </td>
                </tr>
              ) : (
                <tr key={p.id} className="border-b border-primary/20 hover:bg-surface">
                  <td className="px-4 py-2 font-medium">
                    {p.title}
                    {p.excerpt && <span className="block text-outline text-xs line-clamp-1">{p.excerpt}</span>}
                  </td>
                  <td className="px-4 py-2">
                    <span className={`font-epilogue font-bold text-xs uppercase px-2 py-0.5 ${p.published ? 'bg-secondary-fixed text-on-secondary-fixed' : 'bg-surface text-outline border border-primary/20'}`}>
                      {p.published ? 'Live' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-outline text-xs">
                    {new Date(p.createdAt).toLocaleDateString('en-GB')}
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
