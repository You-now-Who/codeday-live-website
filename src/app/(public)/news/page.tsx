import { prisma } from '@/lib/prisma'
import { NewsClient } from '@/components/sections/NewsClient'

export default async function NewsPage() {
  const raw = await prisma.newsPost.findMany({ orderBy: { createdAt: 'desc' } })
  const posts = JSON.parse(JSON.stringify(raw))
  return <NewsClient initialPosts={posts} />
}
