import { prisma } from '@/lib/prisma'
import { ProjectsClient } from '@/components/sections/ProjectsClient'

export default async function ProjectsPage() {
  const raw = await prisma.project.findMany({ orderBy: { createdAt: 'asc' } })
  const projects = JSON.parse(JSON.stringify(raw))
  return <ProjectsClient initialProjects={projects} />
}
