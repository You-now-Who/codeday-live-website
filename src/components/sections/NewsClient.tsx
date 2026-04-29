'use client'

import { useCallback } from 'react'
import { usePolling } from '@/lib/hooks/usePolling'
import { NewsCard } from '@/components/ui/NewsCard'
import { PageHeader } from '@/components/ui/PageHeader'
import { ScrollReveal } from '@/components/ui/ScrollReveal'

type NewsPost = { id: string; headline: string; body: string; imageUrl: string | null; type: 'NEWS' | 'ANNOUNCEMENT'; pinned: boolean; createdAt: string }

export function NewsClient({ initialPosts }: { initialPosts: NewsPost[] }) {
  const fetcher = useCallback(
    () => fetch('/api/news').then(r => r.json()).then(d => d.posts),
    []
  )
  const { data } = usePolling<NewsPost[]>(fetcher, 30_000)
  const posts: NewsPost[] = data ?? initialPosts

  return (
    <div>
      <PageHeader title="News" />
      <div className="px-6 py-4 max-w-5xl mx-auto">
        {posts.length === 0 && (
          <p className="font-grotesk text-outline">No news yet.</p>
        )}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-4">
          {posts.map((post, i) => (
            <ScrollReveal key={post.id} delay={i * 50} className="break-inside-avoid mb-4">
              <NewsCard post={post} />
            </ScrollReveal>
          ))}
        </div>
      </div>
    </div>
  )
}
