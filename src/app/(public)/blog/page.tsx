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
      <div className="px-6 py-6 max-w-3xl mx-auto">
        {posts.length === 0 && (
          <p className="font-grotesk text-outline">No posts yet.</p>
        )}
        <div className="space-y-6">
          {posts.map(post => (
            <Link key={post.id} href={`/blog/${post.id}`} className="block group">
              <article className="bg-white border-2 border-primary shadow-hard hover:shadow-none transition-shadow">
                {post.coverImageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={post.coverImageUrl} alt="" className="w-full h-48 object-cover border-b-2 border-primary" />
                )}
                <div className="p-5">
                  <p className="font-grotesk text-xs text-outline uppercase tracking-widest mb-2">
                    {formatDate(post.createdAt.toISOString())}
                  </p>
                  <h2 className="font-epilogue font-black text-2xl uppercase tracking-tight leading-tight group-hover:underline">
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p className="font-grotesk text-sm text-outline mt-2 leading-relaxed">{post.excerpt}</p>
                  )}
                  <p className="font-epilogue font-black text-xs uppercase tracking-tight mt-4 text-primary">
                    Read more →
                  </p>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
