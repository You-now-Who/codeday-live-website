'use client'

import { useState } from 'react'

export type PostData = {
  id: string
  content: string
  imageUrl: string | null
  createdAt: string
  author: { id: string; username: string; displayName: string | null }
  commentCount: number
  reactionCounts: Record<string, number>
  myReactions: string[]
}

type Comment = {
  id: string
  body: string
  createdAt: string
  author: { username: string; displayName: string | null }
}

const EMOJIS = ['❤️', '🔥', '👏', '🚀']

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h`
  return `${Math.floor(hrs / 24)}d`
}

function initials(name: string) {
  return name.split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

function hashStr(s: string) {
  return s.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
}

interface PostCardProps {
  post: PostData
  accountId: string | null
  isOwn: boolean
  onDelete?: (id: string) => void
}

export function PostCard({ post, accountId, isOwn, onDelete }: PostCardProps) {
  const [reactions, setReactions] = useState({
    counts: post.reactionCounts,
    mine: new Set(post.myReactions),
  })
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState<Comment[] | null>(null)
  const [commentBody, setCommentBody] = useState('')
  const [commentLoading, setCommentLoading] = useState(false)
  const [commentCount, setCommentCount] = useState(post.commentCount)

  const displayName = post.author.displayName ?? post.author.username
  const h = hashStr(post.author.id)
  const badgeBg = h % 2 === 0 ? 'bg-secondary-fixed text-on-secondary-fixed' : 'bg-primary text-on-primary'

  const toggleReaction = async (emoji: string) => {
    if (!accountId) return
    const had = reactions.mine.has(emoji)
    setReactions(prev => {
      const newCounts = { ...prev.counts }
      const newMine = new Set(prev.mine)
      if (had) {
        newCounts[emoji] = Math.max(0, (newCounts[emoji] ?? 1) - 1)
        if (newCounts[emoji] === 0) delete newCounts[emoji]
        newMine.delete(emoji)
      } else {
        newCounts[emoji] = (newCounts[emoji] ?? 0) + 1
        newMine.add(emoji)
      }
      return { counts: newCounts, mine: newMine }
    })
    await fetch(`/api/posts/${post.id}/reactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emoji }),
    })
  }

  const loadComments = async () => {
    if (comments !== null) { setShowComments(s => !s); return }
    setShowComments(true)
    const res = await fetch(`/api/posts/${post.id}/comments`)
    const data = await res.json()
    setComments(data.comments ?? [])
  }

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentBody.trim() || commentLoading) return
    setCommentLoading(true)
    const res = await fetch(`/api/posts/${post.id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body: commentBody.trim() }),
    })
    if (res.ok) {
      const data = await res.json()
      setComments(c => [...(c ?? []), data.comment])
      setCommentBody('')
      setCommentCount(n => n + 1)
    }
    setCommentLoading(false)
  }

  const handleDelete = async () => {
    if (!confirm('Delete this post?')) return
    await fetch(`/api/posts/${post.id}`, { method: 'DELETE' })
    onDelete?.(post.id)
  }

  return (
    <article className="bg-white border-2 border-primary shadow-hard">

      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3">
        <span className={`w-9 h-9 flex-shrink-0 flex items-center justify-center font-epilogue font-black text-xs ${badgeBg}`}>
          {initials(displayName)}
        </span>
        <div className="flex-1 min-w-0">
          <p className="font-epilogue font-black text-sm uppercase tracking-tight leading-none">{displayName}</p>
          <p className="font-grotesk text-xs text-outline mt-0.5">@{post.author.username} · {timeAgo(post.createdAt)}</p>
        </div>
        {isOwn && (
          <button onClick={handleDelete} className="font-grotesk text-xs text-outline hover:text-error transition-colors flex-shrink-0" aria-label="Delete post">✕</button>
        )}
      </div>

      {/* Content */}
      <div className="px-4 pb-3">
        <p className="font-grotesk text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>
      </div>

      {/* Image */}
      {post.imageUrl && (
        <div className="mx-4 mb-3 border-2 border-primary overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={post.imageUrl} alt="Post image" className="w-full object-cover max-h-80" />
        </div>
      )}

      {/* Reactions + comment toggle */}
      <div className="px-4 pb-3 flex items-center gap-1 flex-wrap border-t border-primary/10 pt-3">
        {EMOJIS.map(emoji => {
          const count = reactions.counts[emoji] ?? 0
          const reacted = reactions.mine.has(emoji)
          return (
            <button
              key={emoji}
              onClick={() => toggleReaction(emoji)}
              disabled={!accountId}
              className={`flex items-center gap-1 px-2 py-1 font-grotesk text-xs border transition-colors ${
                reacted
                  ? 'border-primary bg-secondary-fixed text-on-secondary-fixed'
                  : 'border-primary/20 hover:border-primary hover:bg-surface'
              } ${!accountId ? 'cursor-default opacity-60' : ''}`}
            >
              <span>{emoji}</span>
              {count > 0 && <span className="font-bold">{count}</span>}
            </button>
          )
        })}
        <button
          onClick={loadComments}
          className="ml-auto font-grotesk text-xs text-outline hover:text-primary transition-colors"
        >
          💬 {commentCount > 0 ? commentCount : ''} {commentCount === 1 ? 'comment' : 'comments'}
        </button>
      </div>

      {/* Comments section */}
      {showComments && (
        <div className="border-t-2 border-primary/10 bg-surface">
          {comments === null ? (
            <p className="px-4 py-3 font-grotesk text-xs text-outline">Loading…</p>
          ) : (
            <div className="px-4 py-3 space-y-3">
              {comments.length === 0 && (
                <p className="font-grotesk text-xs text-outline">No comments yet.</p>
              )}
              {comments.map(c => (
                <div key={c.id} className="flex gap-2">
                  <span className="font-epilogue font-black text-xs flex-shrink-0 mt-0.5 opacity-60">
                    {initials(c.author.displayName ?? c.author.username)}
                  </span>
                  <div>
                    <span className="font-epilogue font-black text-xs uppercase tracking-tight">
                      {c.author.displayName ?? c.author.username}
                    </span>
                    <span className="font-grotesk text-xs text-outline ml-2">{timeAgo(c.createdAt)}</span>
                    <p className="font-grotesk text-xs mt-0.5">{c.body}</p>
                  </div>
                </div>
              ))}

              {accountId && (
                <form onSubmit={submitComment} className="flex gap-2 pt-1">
                  <input
                    value={commentBody}
                    onChange={e => setCommentBody(e.target.value)}
                    placeholder="Add a comment…"
                    className="flex-1 border-2 border-primary px-2 py-1 font-grotesk text-xs focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
                    maxLength={500}
                  />
                  <button
                    type="submit"
                    disabled={commentLoading || !commentBody.trim()}
                    className="font-epilogue font-black text-xs uppercase border-2 border-primary px-3 py-1 hover:bg-secondary-fixed hover:border-secondary-fixed hover:text-on-secondary-fixed transition-colors disabled:opacity-40"
                  >
                    Post
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      )}
    </article>
  )
}
