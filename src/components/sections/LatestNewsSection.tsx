import Link from 'next/link'
import { NewsCard } from '@/components/ui/NewsCard'

type NewsPost = {
  id: string
  headline: string
  body: string
  imageUrl: string | null
  type: 'NEWS' | 'ANNOUNCEMENT'
  pinned: boolean
  createdAt: string
}

interface LatestNewsSectionProps {
  posts: NewsPost[]
  pinnedIds: string[]
}

export function LatestNewsSection({ posts, pinnedIds }: LatestNewsSectionProps) {
  const latest = posts
    .filter(p => !pinnedIds.includes(p.id))
    .slice(0, 3)

  if (latest.length === 0) return null

  return (
    <section>
      <div className="flex items-baseline justify-between mb-5">
        <h2 className="font-epilogue font-black text-xl uppercase tracking-tight leading-none">
          Latest
        </h2>
        <Link
          href="/news"
          className="font-grotesk text-xs uppercase tracking-widest text-outline hover:text-primary transition-colors"
        >
          All news →
        </Link>
      </div>
      <div className="space-y-4">
        {latest.map(post => (
          <NewsCard key={post.id} post={post} />
        ))}
      </div>
    </section>
  )
}
