'use client'

import { useCallback } from 'react'
import { usePolling } from '@/lib/hooks/usePolling'
import { ProjectCard } from '@/components/ui/ProjectCard'
import { PageHeader } from '@/components/ui/PageHeader'
import { ScrollReveal } from '@/components/ui/ScrollReveal'

type Project = { id: string; teamName: string; projectName: string; description: string | null; iframeUrl: string }

export function ProjectsClient({ initialProjects }: { initialProjects: Project[] }) {
  const fetcher = useCallback(
    () => fetch('/api/projects').then(r => r.json()).then(d => d.projects),
    []
  )
  const { data } = usePolling<Project[]>(fetcher, 30_000)
  const projects: Project[] = data ?? initialProjects

  return (
    <div>
      <PageHeader title="Projects" />
      <div className="px-6 py-4 max-w-6xl mx-auto">
        {projects.length === 0 && (
          <p className="font-grotesk text-outline">No projects submitted yet.</p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p, i) => (
            <ScrollReveal key={p.id} delay={i * 60}>
              <ProjectCard project={p} />
            </ScrollReveal>
          ))}
        </div>
      </div>
    </div>
  )
}
