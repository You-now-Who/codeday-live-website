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
      className={`border-2 border-primary shadow-hard p-5 card-lift ${rotation} ${
        isAnnouncement ? 'bg-secondary-fixed' : 'bg-white'
      }`}
    >
      {post.pinned && (
        <div className="mb-2">
          <span className="font-epilogue font-bold text-xs uppercase bg-primary text-on-primary px-2 py-0.5 rotate-[1deg] inline-block">
            PINNED
          </span>
        </div>
      )}
      <Chip label={post.type} className="mb-3" />
      {post.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.imageUrl}
          alt=""
          className="dither w-full mb-3 border-2 border-primary"
        />
      )}
      <h3 className="font-epilogue font-black text-xl uppercase tracking-tight leading-none mb-2">
        {post.headline}
      </h3>
      <p className="font-grotesk text-sm text-on-surface leading-relaxed">{post.body}</p>
      <p className="font-grotesk text-xs text-outline mt-3 uppercase tracking-widest">
        {new Date(post.createdAt).toLocaleDateString()}
      </p>
    </div>
  )
}
