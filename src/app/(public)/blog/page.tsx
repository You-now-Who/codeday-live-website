export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { PageHeader } from '@/components/ui/PageHeader'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default async function BlogPage() {
  const posts = await prisma.blogPost.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
    select: { id: true, title: true, excerpt: true, coverImageUrl: true, createdAt: true },
  })

  return (
    <div>
      <PageHeader title="Blog" />
      <div className="px-6 py-8 max-w-2xl mx-auto">
        {posts.length === 0 && (
          <p className="font-grotesk text-outline">No posts yet.</p>
        )}
        <div className="space-y-10">
          {posts.map((post, i) => (
            <Link key={post.id} href={`/blog/${post.id}`} className="block group">
              <article className={`relative ${i % 2 === 0 ? 'rotate-[-0.3deg]' : 'rotate-[0.2deg]'} sticky-note p-0 overflow-hidden tape`}>
                {post.coverImageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={post.coverImageUrl}
                    alt=""
                    className="w-full h-52 object-cover"
                    style={{ borderBottom: '2px solid #000' }}
                  />
                )}
                <div className="p-6">
                  <p className="font-grotesk text-xs text-outline uppercase tracking-widest mb-2">
                    {formatDate(post.createdAt.toISOString())}
                  </p>
                  <h2 className="font-epilogue font-black text-3xl uppercase tracking-tight leading-tight group-hover:underline decoration-2 mb-3">
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p className="font-grotesk text-sm text-on-surface/70 leading-relaxed line-clamp-3">
                      {post.excerpt}
                    </p>
                  )}
                  <span className="inline-block mt-4 font-epilogue font-black text-xs uppercase tracking-tight stamp border-primary">
                    Read →
                  </span>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
