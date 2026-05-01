import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default async function BlogPostPage({ params }: { params: { id: string } }) {
  const post = await prisma.blogPost.findUnique({ where: { id: params.id } })
  if (!post || !post.published) notFound()

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <Link
        href="/blog"
        className="font-epilogue font-black text-xs uppercase tracking-tight text-outline hover:text-primary transition-colors mb-6 inline-block"
      >
        ← All posts
      </Link>

      {post.coverImageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.coverImageUrl}
          alt=""
          className="w-full h-64 object-cover border-2 border-primary mb-6"
        />
      )}

      <p className="font-grotesk text-xs text-outline uppercase tracking-widest mb-3">
        {formatDate(post.createdAt.toISOString())}
      </p>
      <h1 className="font-epilogue font-black text-4xl uppercase tracking-tight leading-tight mb-6">
        {post.title}
      </h1>

      {post.excerpt && (
        <p className="font-grotesk text-lg text-outline leading-relaxed border-l-4 border-primary pl-4 mb-6">
          {post.excerpt}
        </p>
      )}

      <div className="font-grotesk text-base leading-relaxed whitespace-pre-wrap">
        {post.body}
      </div>
    </div>
  )
}
