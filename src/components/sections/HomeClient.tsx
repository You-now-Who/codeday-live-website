'use client'

import { useCallback } from 'react'
import { usePolling } from '@/lib/hooks/usePolling'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { HeroSection } from './HeroSection'
import { HappeningNowSection } from './HappeningNowSection'
import { CompactScheduleSection } from './CompactScheduleSection'
import { SponsorsSection } from './SponsorsSection'
import { LocationSection } from './LocationSection'
import { ContactSection } from './ContactSection'
import { QuickLinksSection } from './QuickLinksSection'
import Link from 'next/link'

type Sponsor = { name: string; url?: string; tier?: string; logoUrl?: string }

type EventConfig = {
  eventName: string
  submissionDeadline: string
  wifiSsid: string | null
  wifiPassword: string | null
  discordUrl: string | null
  importantLinks: Array<{ label: string; url: string }>
  location: string | null
  locationUrl: string | null
  contactEmail: string | null
  contactPhone: string | null
  sponsors: Sponsor[]
}
type ScheduleItem = { id: string; title: string; description: string | null; location: string | null; startsAt: string; endsAt: string | null }

interface HomeClientProps {
  initialConfig: EventConfig
  initialSchedule: ScheduleItem[]
  initialNews: unknown[]
}

function Divider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-4 py-2">
      <div className="flex-1 h-px bg-primary/20" />
      <span className="font-epilogue font-bold text-xs uppercase tracking-widest text-outline rotate-[-0.3deg]">
        {label}
      </span>
      <div className="flex-1 h-px bg-primary/20" />
    </div>
  )
}

export function HomeClient({ initialConfig, initialSchedule }: HomeClientProps) {
  const configFetcher   = useCallback(() => fetch('/api/config').then(r => r.json()).then(d => d.config), [])
  const scheduleFetcher = useCallback(() => fetch('/api/schedule').then(r => r.json()).then(d => d.items), [])

  const { data: config }   = usePolling<EventConfig>(configFetcher, 30_000)
  const { data: schedule } = usePolling<ScheduleItem[]>(scheduleFetcher, 30_000)

  const activeConfig:   EventConfig    = config   ?? initialConfig
  const activeSchedule: ScheduleItem[] = schedule ?? initialSchedule

  const now = new Date()
  const currentItem = activeSchedule.find(
    item => new Date(item.startsAt) <= now && (item.endsAt == null || new Date(item.endsAt) >= now)
  )
  const nextItem = !currentItem
    ? activeSchedule.find(item => new Date(item.startsAt) > now)
    : null

  return (
    <div>
      <HeroSection config={activeConfig} />

      <div className="px-6 py-10 max-w-3xl mx-auto space-y-10">

        {/* — Happening now / up next — */}
        {(currentItem || nextItem) && (
          <ScrollReveal>
            <HappeningNowSection currentItem={currentItem ?? null} nextItem={nextItem ?? null} />
          </ScrollReveal>
        )}

        {/* — Schedule — */}
        <ScrollReveal delay={40}>
          <CompactScheduleSection items={activeSchedule} />
        </ScrollReveal>

        {/* — Submit CTA — */}
        <ScrollReveal delay={40}>
          <Link
            href="/projects"
            className="block relative overflow-hidden border-2 border-primary bg-primary text-on-primary p-7 shadow-hard-lg rotate-[-0.5deg] group"
          >
            <span className="absolute top-3 right-5 font-epilogue font-black text-5xl opacity-10 group-hover:opacity-20 transition-opacity select-none" aria-hidden>✦</span>
            <p className="font-grotesk text-xs uppercase tracking-widest opacity-70 mb-1">Ready to show the world?</p>
            <p className="font-epilogue font-black text-3xl uppercase tracking-tight leading-tight">Submit your project →</p>
          </Link>
        </ScrollReveal>

        <Divider label="Where" />

        {/* — Location — */}
        <ScrollReveal>
          <LocationSection location={activeConfig.location} locationUrl={activeConfig.locationUrl} />
        </ScrollReveal>

        {/* — Get help CTA — */}
        <ScrollReveal delay={40}>
          <Link
            href="/help"
            className="block relative overflow-hidden border-2 border-primary bg-secondary-fixed text-on-secondary-fixed p-6 shadow-hard rotate-[0.5deg] group"
          >
            <svg className="absolute bottom-2 right-4 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none"
              width="64" height="64" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="4" aria-hidden>
              <circle cx="32" cy="32" r="26" />
              <path d="M22 24c0-5.5 4.5-10 10-10s10 4.5 10 10c0 5-4 7.5-9 9v3" />
              <circle cx="32" cy="50" r="2.5" fill="currentColor" />
            </svg>
            <p className="font-grotesk text-xs uppercase tracking-widest opacity-60 mb-1">Hitting a wall?</p>
            <p className="font-epilogue font-black text-2xl uppercase tracking-tight leading-tight">Get a mentor →</p>
          </Link>
        </ScrollReveal>

        <Divider label="Get in touch" />

        {/* — Contact — */}
        <ScrollReveal>
          <ContactSection
            contactEmail={activeConfig.contactEmail}
            contactPhone={activeConfig.contactPhone}
            discordUrl={activeConfig.discordUrl}
          />
        </ScrollReveal>

        <Divider label="WiFi & Links" />

        {/* — WiFi / Links — */}
        <ScrollReveal>
          <QuickLinksSection config={activeConfig} />
        </ScrollReveal>

      </div>

      {/* — Sponsors — full bleed, outside the centered container */}
      <ScrollReveal>
        <SponsorsSection sponsors={activeConfig.sponsors ?? []} />
      </ScrollReveal>

      <div className="h-10" />
    </div>
  )
}
