import { NewsCard } from '@/components/ui/NewsCard'

type NewsPost = { id: string; headline: string; body: string; imageUrl: string | null; type: 'NEWS' | 'ANNOUNCEMENT'; pinned: boolean; createdAt: string }

interface PinnedNewsSectionProps {
  posts: NewsPost[]
}

export function PinnedNewsSection({ posts }: PinnedNewsSectionProps) {
  if (posts.length === 0) return null

  return (
    <section>
      <h2 className="font-epilogue font-black text-xl uppercase tracking-tight leading-none mb-4">
        Pinned
      </h2>
      <div className="columns-1 md:columns-2 gap-4">
        {posts.map(post => (
          <div key={post.id} className="break-inside-avoid mb-4">
            <NewsCard post={post} />
          </div>
        ))}
      </div>
    </section>
  )
}
