'use client'

import { useState } from 'react'
import { EmojiPicker } from './EmojiPicker'

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
  authorId: string
  author: { username: string; displayName: string | null }
}

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
  canDelete: boolean
  onDelete?: (id: string) => void
}

export function PostCard({ post, accountId, canDelete, onDelete }: PostCardProps) {
  const [reactions, setReactions] = useState({
    counts: post.reactionCounts,
    mine: new Set(post.myReactions),
  })
  const [showPicker, setShowPicker] = useState(false)
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
      const counts = { ...prev.counts }
      const mine = new Set(prev.mine)
      if (had) {
        counts[emoji] = Math.max(0, (counts[emoji] ?? 1) - 1)
        if (counts[emoji] === 0) delete counts[emoji]
        mine.delete(emoji)
      } else {
        counts[emoji] = (counts[emoji] ?? 0) + 1
        mine.add(emoji)
      }
      return { counts, mine }
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

  const deleteComment = async (commentId: string) => {
    if (!confirm('Delete this comment?')) return
    const res = await fetch(`/api/posts/${post.id}/comments/${commentId}`, { method: 'DELETE' })
    if (res.ok) {
      setComments(c => (c ?? []).filter(x => x.id !== commentId))
      setCommentCount(n => Math.max(0, n - 1))
    }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this post?')) return
    await fetch(`/api/posts/${post.id}`, { method: 'DELETE' })
    onDelete?.(post.id)
  }

  const activeEmojis = Object.entries(reactions.counts)
    .filter(([, c]) => c > 0)
    .sort((a, b) => b[1] - a[1])

  return (
    <article className="bg-white shadow-paper sketch-box torn-bottom-sm">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3">
        <span className={`w-9 h-9 flex-shrink-0 flex items-center justify-center font-epilogue font-black text-xs ${badgeBg}`} style={{ borderRadius: '50% 45% 48% 50% / 50% 48% 45% 50%' }}>
          {initials(displayName)}
        </span>
        <div className="flex-1 min-w-0">
          <p className="font-epilogue font-black text-sm uppercase tracking-tight leading-none">{displayName}</p>
          <p className="font-grotesk text-xs text-outline mt-0.5">@{post.author.username} · {timeAgo(post.createdAt)}</p>
        </div>
        {canDelete && (
          <button onClick={handleDelete} className="font-grotesk text-xs text-outline hover:text-error transition-colors flex-shrink-0 px-1" aria-label="Delete post">✕</button>
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

      {/* Reactions row */}
      <div className="px-4 pb-3 flex items-center gap-1 flex-wrap border-t border-primary/10 pt-3 relative">
        {activeEmojis.map(([emoji, count]) => (
          <button
            key={emoji}
            onClick={() => toggleReaction(emoji)}
            disabled={!accountId}
            className={`flex items-center gap-1 px-2 py-1 font-grotesk text-xs border transition-colors sketch-box ${
              reactions.mine.has(emoji)
                ? 'border-primary bg-secondary-fixed text-on-secondary-fixed hover:bg-secondary-fixed hover:text-on-secondary-fixed hover:border-secondary-fixed'
                : 'border-primary/20 hover:border-primary hover:bg-secondary-fixed hover:text-on-secondary-fixed hover:border-secondary-fixed'
            } ${!accountId ? 'cursor-default' : ''}`}
          >
            <span>{emoji}</span>
            <span className="font-bold">{count}</span>
          </button>
        ))}

        {accountId && (
          <div className="relative">
            <button
              onClick={() => setShowPicker(s => !s)}
              className="flex items-center px-2 py-1 font-grotesk text-xs border border-dashed border-primary/40 hover:border-primary transition-colors text-outline hover:text-primary sketch-box"
              aria-label="Add reaction"
            >
              + React
            </button>
            {showPicker && (
              <EmojiPicker onSelect={toggleReaction} onClose={() => setShowPicker(false)} />
            )}
          </div>
        )}

        <button
          onClick={loadComments}
          className="ml-auto font-grotesk text-xs text-outline hover:text-primary transition-colors"
        >
          💬 {commentCount > 0 ? commentCount : ''} {commentCount === 1 ? 'comment' : 'comments'}
        </button>
      </div>

      {/* Comments */}
      {showComments && (
        <div className="border-t-2 border-primary/10 bg-surface">
          {comments === null ? (
            <p className="px-4 py-3 font-grotesk text-xs text-outline">Loading…</p>
          ) : (
            <div className="px-4 py-3 space-y-3">
              {comments.length === 0 && (
                <p className="font-grotesk text-xs text-outline">No comments yet.</p>
              )}
              {comments.map(c => {
                const canDeleteComment = canDelete || c.authorId === accountId
                return (
                  <div key={c.id} className="flex gap-2 group">
                    <span className="font-epilogue font-black text-xs flex-shrink-0 mt-0.5 opacity-50">
                      {initials(c.author.displayName ?? c.author.username)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <span className="font-epilogue font-black text-xs uppercase tracking-tight">
                        {c.author.displayName ?? c.author.username}
                      </span>
                      <span className="font-grotesk text-xs text-outline ml-2">{timeAgo(c.createdAt)}</span>
                      <p className="font-grotesk text-xs mt-0.5 break-words">{c.body}</p>
                    </div>
                    {canDeleteComment && (
                      <button
                        onClick={() => deleteComment(c.id)}
                        className="font-grotesk text-xs text-outline hover:text-error opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
                        aria-label="Delete comment"
                      >✕</button>
                    )}
                  </div>
                )
              })}

              {accountId && (
                <form onSubmit={submitComment} className="flex gap-2 pt-1">
                  <input
                    value={commentBody}
                    onChange={e => setCommentBody(e.target.value)}
                    placeholder="Add a comment…"
                    className="flex-1 border-0 border-b-2 border-secondary-fixed bg-transparent px-0 py-1 font-grotesk text-xs focus:outline-none caret-[#c3f400]"
                    maxLength={500}
                  />
                  <button
                    type="submit"
                    disabled={commentLoading || !commentBody.trim()}
                    className="font-epilogue font-black text-xs uppercase border-2 border-primary px-3 py-1 hover:bg-secondary-fixed hover:border-secondary-fixed hover:text-on-secondary-fixed transition-colors disabled:opacity-40 stamp sketch-box"
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
