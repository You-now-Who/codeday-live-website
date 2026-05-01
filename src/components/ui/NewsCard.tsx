import { Chip } from './Chip'

interface NewsPost {
  id: string
  headline: string
  body: string
  imageUrl: string | null
  type: 'NEWS' | 'ANNOUNCEMENT'
  pinned: boolean
  createdAt: string
}

interface NewsCardProps {
  post: NewsPost
}

const ROTATIONS = ['rotate-[-1deg]', 'rotate-[0.5deg]', 'rotate-[1.5deg]', 'rotate-[-0.5deg]']

function getRotation(id: string): string {
  const sum = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return ROTATIONS[sum % ROTATIONS.length]
}

export function NewsCard({ post }: NewsCardProps) {
  const isAnnouncement = post.type === 'ANNOUNCEMENT'
  const rotation = getRotation(post.id)

  return (
    <div
      className={`p-5 card-lift ${rotation} tape ${
        isAnnouncement
          ? 'bg-secondary-fixed shadow-paper-lg sketch-box'
          : 'sticky-note'
      }`}
    >
      {post.pinned && (
        <div className="flex items-center gap-1 mb-2">
          <svg width="10" height="14" viewBox="0 0 10 14" fill="currentColor" className="text-primary opacity-70">
            <ellipse cx="5" cy="4" rx="4" ry="4" />
            <rect x="4" y="7" width="2" height="7" rx="1" />
          </svg>
          <span className="font-grotesk text-xs text-primary/60 uppercase tracking-wider">pinned</span>
        </div>
      )}
      <Chip label={post.type} className="mb-3" />
      {post.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.imageUrl}
          alt=""
          className="dither w-full mb-3 border-2 border-primary sketch-box"
        />
      )}
      <h3 className="font-epilogue font-black text-xl uppercase tracking-tight leading-none mb-2">
        {post.headline}
      </h3>
      <p className="font-grotesk text-sm text-on-surface leading-relaxed">{post.body}</p>
      <p className="font-grotesk text-xs text-outline mt-3 uppercase tracking-widest stamp">
        {new Date(post.createdAt).toLocaleDateString()}
      </p>
    </div>
  )
}
