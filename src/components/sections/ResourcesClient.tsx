'use client'

import { useCallback } from 'react'
import { usePolling } from '@/lib/hooks/usePolling'
import { ResourceCard } from '@/components/ui/ResourceCard'
import { PageHeader } from '@/components/ui/PageHeader'
import { ScrollReveal } from '@/components/ui/ScrollReveal'

type ResourceLink = { id: string; title: string; url: string; description: string | null; category: string }

export function ResourcesClient({ initialResources }: { initialResources: ResourceLink[] }) {
  const fetcher = useCallback(
    () => fetch('/api/resources').then(r => r.json()).then(d => d.resources),
    []
  )
  const { data } = usePolling<ResourceLink[]>(fetcher, 30_000)
  const resources: ResourceLink[] = data ?? initialResources

  const grouped = resources.reduce<Record<string, ResourceLink[]>>((acc, r) => {
    if (!acc[r.category]) acc[r.category] = []
    acc[r.category].push(r)
    return acc
  }, {})

  return (
    <div>
      <PageHeader title="Resources" />
      <div className="px-6 py-4 space-y-10 max-w-5xl mx-auto">
        {Object.keys(grouped).length === 0 && (
          <p className="font-grotesk text-outline">No resources yet.</p>
        )}
        {Object.entries(grouped).map(([category, items]) => (
          <ScrollReveal key={category}>
            <section>
              <h2 className="font-epilogue font-black text-2xl uppercase tracking-tight leading-none mb-4 border-b-2 border-primary pb-2">
                {category}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((r, i) => (
                  <ScrollReveal key={r.id} delay={i * 50}>
                    <ResourceCard resource={r} />
                  </ScrollReveal>
                ))}
              </div>
            </section>
          </ScrollReveal>
        ))}
      </div>
    </div>
  )
}
