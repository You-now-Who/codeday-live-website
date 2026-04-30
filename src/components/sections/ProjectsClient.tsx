'use client'

import { useCallback } from 'react'
import { usePolling } from '@/lib/hooks/usePolling'
import { ProjectCard } from '@/components/ui/ProjectCard'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import Link from 'next/link'

type Project = {
  id: string
  teamName: string
  projectName: string
  description: string | null
  iframeUrl: string
  createdAt: string
}

export function ProjectsClient({ initialProjects }: { initialProjects: Project[] }) {
  const fetcher = useCallback(
    () => fetch('/api/projects').then(r => r.json()).then(d => d.projects),
    []
  )
  const { data } = usePolling<Project[]>(fetcher, 30_000)
  const projects: Project[] = data ?? initialProjects

  return (
    <div>
      {/* Wall header */}
      <div className="border-b-2 border-primary px-6 py-5 flex items-end justify-between">
        <div>
          <h1 className="font-epilogue font-black text-4xl uppercase tracking-tight leading-none">
            Projects
          </h1>
          <p className="font-grotesk text-sm text-outline mt-1">
            {projects.length === 0
              ? 'No projects yet — be the first!'
              : `${projects.length} team${projects.length === 1 ? '' : 's'} building`}
          </p>
        </div>
        <Link
          href="/submit"
          className="font-epilogue font-bold text-xs uppercase tracking-tight border-2 border-primary px-3 py-2 hover:bg-secondary-fixed hover:border-secondary-fixed hover:text-on-secondary-fixed transition-colors flex-shrink-0"
        >
          Post yours →
        </Link>
      </div>

      {/* Feed */}
      <div className="px-6 py-6 max-w-6xl mx-auto">
        {projects.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-epilogue font-black text-6xl opacity-10 mb-4">✦</p>
            <p className="font-epilogue font-bold text-xl uppercase tracking-tight text-outline">
              Projects will appear here
            </p>
            <p className="font-grotesk text-sm text-outline mt-2">
              Teams post their work using their team account.
            </p>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 space-y-5">
            {projects.map((p, i) => (
              <ScrollReveal key={p.id} delay={i * 50}>
                <div className="break-inside-avoid mb-5">
                  <ProjectCard project={p} />
                </div>
              </ScrollReveal>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
