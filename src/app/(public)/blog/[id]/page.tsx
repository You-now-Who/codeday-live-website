export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { BlogBody } from '@/components/ui/BlogBody'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default async function BlogPostPage({ params }: { params: { id: string } }) {
  const post = await prisma.blogPost.findUnique({ where: { id: params.id } })
  if (!post || !post.published) notFound()

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      {/* Back link */}
      <Link
        href="/blog"
        className="font-epilogue font-black text-xs uppercase tracking-tight text-outline hover:text-primary transition-colors mb-8 inline-block stamp"
      >
        ← All posts
      </Link>

      {/* Cover image */}
      {post.coverImageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.coverImageUrl}
          alt=""
          className="w-full h-72 object-cover border-2 border-primary mb-8 sketch-box"
          style={{ marginTop: '1.5rem' }}
        />
      )}

      {/* Date */}
      <p className="font-grotesk text-xs text-outline uppercase tracking-widest mb-4">
        {formatDate(post.createdAt.toISOString())}
      </p>

      {/* Title — paper cut-out */}
      <div className="relative inline-block bg-white border-2 border-primary shadow-paper rotate-[-0.5deg] px-5 py-3 tape mb-8">
        <h1 className="font-epilogue font-black text-4xl uppercase tracking-tight leading-tight text-primary">
          {post.title}
        </h1>
      </div>

      {/* Excerpt / pull quote */}
      {post.excerpt && (
        <div className="border-l-4 border-secondary-fixed pl-5 mb-8 mt-2">
          <p className="font-grotesk text-lg text-on-surface/80 leading-relaxed italic">
            {post.excerpt}
          </p>
        </div>
      )}

      {/* Body — markdown */}
      <div className="index-card p-6 shadow-paper sketch-box">
        <BlogBody content={post.body} />
      </div>
    </div>
  )
}
