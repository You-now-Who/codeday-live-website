'use client'

import { useCallback, useState } from 'react'
import { usePolling } from '@/lib/hooks/usePolling'
import { PostCard, PostData } from '@/components/ui/PostCard'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import Link from 'next/link'

type Account = { id: string; username: string; displayName: string | null }

interface WallClientProps {
  account: Account | null
  initialPosts: PostData[]
}

function PostModal({ onClose, onPosted }: { onClose: () => void; onPosted: (p: PostData) => void }) {
  const [content, setContent] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!content.trim()) { setError('Write something first.'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content.trim(), imageUrl: imageUrl.trim() || null }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Error posting'); return }
      onPosted(data.post)
      onClose()
    } catch {
      setError('Network error — try again')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white border-2 border-primary shadow-hard-lg w-full max-w-lg"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b-2 border-primary">
          <h2 className="font-epilogue font-black text-xl uppercase tracking-tight">New Post</h2>
          <button
            onClick={onClose}
            className="font-epilogue font-black text-lg w-8 h-8 flex items-center justify-center hover:bg-surface transition-colors"
            aria-label="Close"
          >✕</button>
        </div>

        <form onSubmit={submit} className="p-5 space-y-4">
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="What's happening at your table?"
            rows={4}
            maxLength={2000}
            className="w-full border-2 border-primary bg-white px-3 py-2 font-grotesk text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            autoFocus
          />
          <div>
            <label className="font-grotesk text-xs uppercase tracking-widest text-outline block mb-1">
              Image URL <span className="normal-case">(optional)</span>
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={e => setImageUrl(e.target.value)}
              placeholder="https://..."
              className="w-full border-2 border-primary bg-white px-3 py-2 font-grotesk text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          {error && <p className="font-grotesk text-sm text-error">{error}</p>}
          <div className="flex justify-between items-center pt-1">
            <span className="font-grotesk text-xs text-outline">{content.length}/2000</span>
            <button
              type="submit"
              disabled={loading || !content.trim()}
              className="font-epilogue font-black text-sm uppercase tracking-tight border-2 border-primary bg-primary text-on-primary px-5 py-2 hover:bg-secondary-fixed hover:border-secondary-fixed hover:text-on-secondary-fixed transition-colors disabled:opacity-40"
            >
              {loading ? 'Posting…' : 'Post →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export function WallClient({ account, initialPosts }: WallClientProps) {
  const [showModal, setShowModal] = useState(false)
  const [extraPosts, setExtraPosts] = useState<PostData[]>([])

  const fetcher = useCallback(
    () => fetch('/api/posts').then(r => r.json()).then(d => d.posts as PostData[]),
    []
  )
  const { data: polledPosts } = usePolling<PostData[]>(fetcher, 30_000)
  const basePosts = polledPosts ?? initialPosts

  const allPosts = [
    ...extraPosts.filter(ep => !basePosts.find(p => p.id === ep.id)),
    ...basePosts,
  ]

  const handlePosted = (post: PostData) => {
    setExtraPosts(prev => [post, ...prev])
  }

  const handleDeleted = (id: string) => {
    setExtraPosts(prev => prev.filter(p => p.id !== id))
  }

  return (
    <div>
      {/* Header */}
      <div className="border-b-2 border-primary px-6 py-5">
        <div className="max-w-2xl mx-auto flex items-end justify-between gap-4">
          <div>
            <h1 className="font-epilogue font-black text-4xl uppercase tracking-tight leading-none">Wall</h1>
            <p className="font-grotesk text-sm text-outline mt-1">
              {allPosts.length === 0 ? 'No posts yet' : `${allPosts.length} post${allPosts.length === 1 ? '' : 's'}`}
            </p>
          </div>
          {account ? (
            <button
              onClick={() => setShowModal(true)}
              className="font-epilogue font-black text-sm uppercase tracking-tight border-2 border-primary bg-primary text-on-primary px-4 py-2 hover:bg-secondary-fixed hover:border-secondary-fixed hover:text-on-secondary-fixed transition-colors"
            >
              + Post
            </button>
          ) : (
            <Link
              href="/login"
              className="font-epilogue font-bold text-xs uppercase tracking-tight border-2 border-primary px-3 py-2 hover:bg-surface transition-colors"
            >
              Log in to post →
            </Link>
          )}
        </div>
      </div>

      {/* Feed */}
      <div className="px-6 py-6">
        <div className="max-w-2xl mx-auto space-y-4">
          {allPosts.length === 0 ? (
            <div className="text-center py-24">
              <p className="font-epilogue font-black text-6xl opacity-10 mb-4">✦</p>
              <p className="font-epilogue font-bold text-xl uppercase tracking-tight text-outline">Nothing here yet</p>
              <p className="font-grotesk text-sm text-outline mt-2">
                {account ? 'Be the first to post something.' : 'Log in and be the first to post.'}
              </p>
            </div>
          ) : (
            allPosts.map((p, i) => (
              <ScrollReveal key={p.id} delay={i * 30}>
                <PostCard
                  post={p}
                  accountId={account?.id ?? null}
                  isOwn={account?.id === p.author.id}
                  onDelete={handleDeleted}
                />
              </ScrollReveal>
            ))
          )}
        </div>
      </div>

      {showModal && <PostModal onClose={() => setShowModal(false)} onPosted={handlePosted} />}
    </div>
  )
}
