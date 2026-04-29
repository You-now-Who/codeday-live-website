# Task 12 — Public Pages

## Goal
Implement all 6 public-facing pages: Home (`/`), Schedule (`/schedule`), Resources (`/resources`), News (`/news`), Projects (`/projects`), and Help (`/help`). Each page uses a Server Component for initial SSR data fetch and a Client Component wrapper for 30-second polling.

Also implement the public navigation sidebar/topbar and the logout route stubs.

## Prerequisites
- Tasks 01–11 complete (all API routes and UI components built)
- `usePolling` hook available at `src/lib/hooks/usePolling.ts`

---

## Navigation Component

### `src/components/ui/PublicNav.tsx`
Sticky top bar on mobile, fixed left sidebar on md+. Links: HOME / SCHEDULE / RESOURCES / NEWS / PROJECTS / HELP. Active link gets `secondary-fixed` background swatch.

```typescript
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_LINKS = [
  { href: '/', label: 'HOME' },
  { href: '/schedule', label: 'SCHEDULE' },
  { href: '/resources', label: 'RESOURCES' },
  { href: '/news', label: 'NEWS' },
  { href: '/projects', label: 'PROJECTS' },
  { href: '/help', label: 'HELP' },
]

export function PublicNav() {
  const pathname = usePathname()

  return (
    <>
      {/* Mobile: sticky top bar */}
      <nav className="md:hidden sticky top-0 z-40 bg-primary border-b-2 border-secondary-fixed flex overflow-x-auto">
        {NAV_LINKS.map(({ href, label }) => {
          const isActive = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex-shrink-0 px-4 py-3 font-epilogue font-bold text-sm uppercase tracking-tight ${
                isActive
                  ? 'bg-secondary-fixed text-on-secondary-fixed'
                  : 'text-on-primary hover:bg-on-primary/10'
              }`}
            >
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Desktop: fixed left sidebar */}
      <nav className="hidden md:flex fixed left-0 top-0 h-full w-44 bg-primary text-on-primary border-r-4 border-secondary-fixed flex-col z-40">
        <div className="p-4 border-b-2 border-on-primary/20">
          <span className="font-epilogue font-black text-xs uppercase tracking-widest text-secondary-fixed">
            CODEDAY
          </span>
        </div>
        <ul className="flex flex-col flex-1 mt-2">
          {NAV_LINKS.map(({ href, label }) => {
            const isActive = pathname === href
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`block px-4 py-3 font-epilogue font-bold text-sm uppercase tracking-tight border-b border-on-primary/10 ${
                    isActive
                      ? 'bg-secondary-fixed text-on-secondary-fixed'
                      : 'hover:bg-on-primary/10 text-on-primary'
                  }`}
                >
                  {label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </>
  )
}
```

Update `src/app/(public)/layout.tsx` (create this file) to include `PublicNav` and offset the content from the sidebar:

```typescript
import { PublicNav } from '@/components/ui/PublicNav'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <PublicNav />
      <main className="md:ml-44">
        {children}
      </main>
    </div>
  )
}
```

---

## Home Page

### `src/app/(public)/page.tsx`
Server Component. Fetches config, schedule, and pinned news in parallel. Passes initial data to `HomeClient`.

```typescript
import { HomeClient } from '@/components/sections/HomeClient'

async function getInitialData() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
  const [configRes, scheduleRes, newsRes] = await Promise.all([
    fetch(`${baseUrl}/api/config`, { cache: 'no-store' }),
    fetch(`${baseUrl}/api/schedule`, { cache: 'no-store' }),
    fetch(`${baseUrl}/api/news`, { cache: 'no-store' }),
  ])
  const [{ config }, { items }, { posts }] = await Promise.all([
    configRes.json(),
    scheduleRes.json(),
    newsRes.json(),
  ])
  return { config, items, posts }
}

export default async function HomePage() {
  const { config, items, posts } = await getInitialData()
  return <HomeClient initialConfig={config} initialSchedule={items} initialNews={posts} />
}
```

### `src/components/sections/HomeClient.tsx`
Client Component. Polls all three home endpoints every 30 seconds. Composes HeroSection, HappeningNowSection, PinnedNewsSection, and QuickLinksSection.

```typescript
'use client'

import { useCallback } from 'react'
import { usePolling } from '@/lib/hooks/usePolling'
import { HeroSection } from './HeroSection'
import { HappeningNowSection } from './HappeningNowSection'
import { PinnedNewsSection } from './PinnedNewsSection'
import { QuickLinksSection } from './QuickLinksSection'

// Type definitions (match API response shapes)
type EventConfig = {
  eventName: string
  submissionDeadline: string
  wifiSsid: string | null
  wifiPassword: string | null
  discordUrl: string | null
  importantLinks: Array<{ label: string; url: string }>
}
type ScheduleItem = { id: string; title: string; description: string | null; location: string | null; startsAt: string; endsAt: string | null }
type NewsPost = { id: string; headline: string; body: string; imageUrl: string | null; type: 'NEWS' | 'ANNOUNCEMENT'; pinned: boolean; createdAt: string }

interface HomeClientProps {
  initialConfig: EventConfig
  initialSchedule: ScheduleItem[]
  initialNews: NewsPost[]
}

export function HomeClient({ initialConfig, initialSchedule, initialNews }: HomeClientProps) {
  const configFetcher = useCallback(
    () => fetch('/api/config').then(r => r.json()).then(d => d.config),
    []
  )
  const scheduleFetcher = useCallback(
    () => fetch('/api/schedule').then(r => r.json()).then(d => d.items),
    []
  )
  const newsFetcher = useCallback(
    () => fetch('/api/news').then(r => r.json()).then(d => d.posts),
    []
  )

  const { data: config } = usePolling(configFetcher, 30_000)
  const { data: schedule } = usePolling(scheduleFetcher, 30_000)
  const { data: news } = usePolling(newsFetcher, 30_000)

  const activeConfig = config ?? initialConfig
  const activeSchedule = schedule ?? initialSchedule
  const activeNews = news ?? initialNews

  const now = new Date()
  const currentItem = activeSchedule.find(
    item => new Date(item.startsAt) <= now && (item.endsAt == null || new Date(item.endsAt) >= now)
  )
  const nextItem = !currentItem
    ? activeSchedule.find(item => new Date(item.startsAt) > now)
    : null
  const pinnedPosts = activeNews.filter(p => p.pinned).slice(0, 3)

  return (
    <div>
      <HeroSection config={activeConfig} />
      <div className="px-6 py-8 space-y-10">
        <HappeningNowSection currentItem={currentItem ?? null} nextItem={nextItem ?? null} />
        <PinnedNewsSection posts={pinnedPosts} />
        <QuickLinksSection config={activeConfig} />
      </div>
    </div>
  )
}
```

### `src/components/sections/HeroSection.tsx`
Black background, event name in huge Epilogue, countdown timer in yellow.

```typescript
import { Countdown } from '@/components/ui/Countdown'

interface HeroSectionProps {
  config: {
    eventName: string
    submissionDeadline: string
  }
}

export function HeroSection({ config }: HeroSectionProps) {
  return (
    <div className="bg-primary text-on-primary torn-edge-bottom px-8 pt-12 pb-24">
      <h1 className="font-epilogue font-black text-6xl uppercase tracking-tight leading-none mb-8">
        {config.eventName}
      </h1>
      <p className="font-grotesk text-xs uppercase tracking-widest text-on-primary/60 mb-3">
        SUBMISSION DEADLINE
      </p>
      <Countdown targetDate={config.submissionDeadline} />
    </div>
  )
}
```

### `src/components/sections/HappeningNowSection.tsx`
Shows the current or next schedule item. Yellow card with slight rotation and "HAPPENING NOW" / "UP NEXT" stamp.

```typescript
type ScheduleItem = { id: string; title: string; description: string | null; location: string | null; startsAt: string; endsAt: string | null }

interface HappeningNowSectionProps {
  currentItem: ScheduleItem | null
  nextItem: ScheduleItem | null
}

export function HappeningNowSection({ currentItem, nextItem }: HappeningNowSectionProps) {
  const item = currentItem ?? nextItem
  const label = currentItem ? 'HAPPENING NOW' : 'UP NEXT'

  if (!item) return null

  return (
    <div className="bg-secondary-fixed border-2 border-primary shadow-hard torn-edge-bottom p-5 rotate-[0.5deg]">
      <div className="mb-3">
        <span className="font-epilogue font-bold text-xs uppercase bg-primary text-on-primary px-2 py-0.5 rotate-[-2deg] inline-block">
          {label}
        </span>
      </div>
      <h2 className="font-epilogue font-black text-2xl uppercase tracking-tight leading-none">
        {item.title}
      </h2>
      {item.description && (
        <p className="font-grotesk text-sm mt-2">{item.description}</p>
      )}
      {item.location && (
        <p className="font-grotesk text-xs uppercase tracking-widest mt-2 opacity-70">
          {item.location}
        </p>
      )}
      <p className="font-grotesk text-xs mt-2 opacity-70">
        {new Date(item.startsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        {item.endsAt && ` — ${new Date(item.endsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
      </p>
    </div>
  )
}
```

### `src/components/sections/PinnedNewsSection.tsx`
Masonry-style 2-column layout of pinned posts. Max 3.

```typescript
import { NewsCard } from '@/components/ui/NewsCard'

type NewsPost = { id: string; headline: string; body: string; imageUrl: string | null; type: 'NEWS' | 'ANNOUNCEMENT'; pinned: boolean; createdAt: string }

interface PinnedNewsSectionProps {
  posts: NewsPost[]
}

export function PinnedNewsSection({ posts }: PinnedNewsSectionProps) {
  if (posts.length === 0) return null

  return (
    <section>
      <h2 className="font-epilogue font-black text-xl uppercase tracking-tight leading-none mb-4">
        Pinned
      </h2>
      <div className="columns-1 md:columns-2 gap-4">
        {posts.map(post => (
          <div key={post.id} className="break-inside-avoid mb-4">
            <NewsCard post={post} />
          </div>
        ))}
      </div>
    </section>
  )
}
```

### `src/components/sections/QuickLinksSection.tsx`
Important links + WiFi card. Each link is a bordered button-style anchor. WiFi card shows SSID and password with a copy-to-clipboard button.

```typescript
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'

interface QuickLinksSectionProps {
  config: {
    wifiSsid: string | null
    wifiPassword: string | null
    discordUrl: string | null
    importantLinks: Array<{ label: string; url: string }>
  }
}

export function QuickLinksSection({ config }: QuickLinksSectionProps) {
  const [copied, setCopied] = useState(false)

  const copyPassword = async () => {
    if (config.wifiPassword) {
      await navigator.clipboard.writeText(config.wifiPassword)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <section className="space-y-6">
      {(config.wifiSsid || config.wifiPassword) && (
        <div className="bg-white border-2 border-primary shadow-hard p-4">
          <h3 className="font-epilogue font-black text-lg uppercase tracking-tight leading-none mb-3">
            WiFi
          </h3>
          {config.wifiSsid && (
            <p className="font-grotesk text-sm">
              <span className="font-medium uppercase tracking-widest text-xs text-outline">SSID </span>
              {config.wifiSsid}
            </p>
          )}
          {config.wifiPassword && (
            <div className="flex items-center gap-3 mt-2">
              <p className="font-grotesk text-sm">
                <span className="font-medium uppercase tracking-widest text-xs text-outline">PASS </span>
                {config.wifiPassword}
              </p>
              <Button onClick={copyPassword} className="text-xs py-1 px-2">
                {copied ? 'COPIED!' : 'COPY'}
              </Button>
            </div>
          )}
        </div>
      )}

      {config.discordUrl && (
        <a
          href={config.discordUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block border-2 border-primary bg-secondary-fixed text-on-secondary-fixed px-4 py-3 font-epilogue font-bold uppercase shadow-hard btn-press text-center"
        >
          JOIN DISCORD
        </a>
      )}

      {config.importantLinks.length > 0 && (
        <div>
          <h3 className="font-epilogue font-black text-lg uppercase tracking-tight leading-none mb-3">
            Links
          </h3>
          <div className="space-y-2">
            {config.importantLinks.map((link, i) => (
              <a
                key={i}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block border-2 border-primary bg-white px-4 py-2 font-epilogue font-bold uppercase text-sm shadow-hard-sm btn-press"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
```

---

## Schedule Page

### `src/app/(public)/schedule/page.tsx`
```typescript
import { ScheduleClient } from '@/components/sections/ScheduleClient'

async function getSchedule() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
  const res = await fetch(`${baseUrl}/api/schedule`, { cache: 'no-store' })
  const { items } = await res.json()
  return items
}

export default async function SchedulePage() {
  const items = await getSchedule()
  return <ScheduleClient initialItems={items} />
}
```

### `src/components/sections/ScheduleClient.tsx`
Polls `/api/schedule` every 30s. Computes status for each item (past/current/upcoming) based on `Date.now()`. Renders `ScheduleCard` for each.

```typescript
'use client'

import { useCallback } from 'react'
import { usePolling } from '@/lib/hooks/usePolling'
import { ScheduleCard } from '@/components/ui/ScheduleCard'
import { PageHeader } from '@/components/ui/PageHeader'

type ScheduleItem = { id: string; title: string; description: string | null; location: string | null; startsAt: string; endsAt: string | null }

type Status = 'past' | 'current' | 'upcoming'

function getStatus(item: ScheduleItem): Status {
  const now = new Date()
  const start = new Date(item.startsAt)
  const end = item.endsAt ? new Date(item.endsAt) : null
  if (end && now > end) return 'past'
  if (now >= start && (end == null || now <= end)) return 'current'
  return 'upcoming'
}

export function ScheduleClient({ initialItems }: { initialItems: ScheduleItem[] }) {
  const fetcher = useCallback(
    () => fetch('/api/schedule').then(r => r.json()).then(d => d.items),
    []
  )
  const { data } = usePolling(fetcher, 30_000)
  const items = data ?? initialItems

  return (
    <div>
      <PageHeader title="Schedule" />
      <div className="px-6 py-4 space-y-4 max-w-2xl">
        {items.length === 0 && (
          <p className="font-grotesk text-outline">No schedule items yet.</p>
        )}
        {items.map(item => (
          <ScheduleCard key={item.id} item={item} status={getStatus(item)} />
        ))}
      </div>
    </div>
  )
}
```

---

## Resources Page

### `src/app/(public)/resources/page.tsx`
```typescript
import { ResourcesClient } from '@/components/sections/ResourcesClient'

async function getResources() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
  const res = await fetch(`${baseUrl}/api/resources`, { cache: 'no-store' })
  const { resources } = await res.json()
  return resources
}

export default async function ResourcesPage() {
  const resources = await getResources()
  return <ResourcesClient initialResources={resources} />
}
```

### `src/components/sections/ResourcesClient.tsx`
Groups resources by `category`. Renders each group with a category headline. Polls every 30s.

```typescript
'use client'

import { useCallback } from 'react'
import { usePolling } from '@/lib/hooks/usePolling'
import { ResourceCard } from '@/components/ui/ResourceCard'
import { PageHeader } from '@/components/ui/PageHeader'

type ResourceLink = { id: string; title: string; url: string; description: string | null; category: string }

export function ResourcesClient({ initialResources }: { initialResources: ResourceLink[] }) {
  const fetcher = useCallback(
    () => fetch('/api/resources').then(r => r.json()).then(d => d.resources),
    []
  )
  const { data } = usePolling(fetcher, 30_000)
  const resources = data ?? initialResources

  const grouped = resources.reduce<Record<string, ResourceLink[]>>((acc, r) => {
    if (!acc[r.category]) acc[r.category] = []
    acc[r.category].push(r)
    return acc
  }, {})

  return (
    <div>
      <PageHeader title="Resources" />
      <div className="px-6 py-4 space-y-10">
        {Object.keys(grouped).length === 0 && (
          <p className="font-grotesk text-outline">No resources yet.</p>
        )}
        {Object.entries(grouped).map(([category, items]) => (
          <section key={category}>
            <h2 className="font-epilogue font-black text-2xl uppercase tracking-tight leading-none mb-4 border-b-2 border-primary pb-2">
              {category}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map(r => (
                <ResourceCard key={r.id} resource={r} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
```

---

## News Page

### `src/app/(public)/news/page.tsx`
```typescript
import { NewsClient } from '@/components/sections/NewsClient'

async function getNews() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
  const res = await fetch(`${baseUrl}/api/news`, { cache: 'no-store' })
  const { posts } = await res.json()
  return posts
}

export default async function NewsPage() {
  const posts = await getNews()
  return <NewsClient initialPosts={posts} />
}
```

### `src/components/sections/NewsClient.tsx`
Masonry CSS columns layout. Pinned posts rendered first. Polls every 30s.

```typescript
'use client'

import { useCallback } from 'react'
import { usePolling } from '@/lib/hooks/usePolling'
import { NewsCard } from '@/components/ui/NewsCard'
import { PageHeader } from '@/components/ui/PageHeader'

type NewsPost = { id: string; headline: string; body: string; imageUrl: string | null; type: 'NEWS' | 'ANNOUNCEMENT'; pinned: boolean; createdAt: string }

export function NewsClient({ initialPosts }: { initialPosts: NewsPost[] }) {
  const fetcher = useCallback(
    () => fetch('/api/news').then(r => r.json()).then(d => d.posts),
    []
  )
  const { data } = usePolling(fetcher, 30_000)
  const posts = data ?? initialPosts

  return (
    <div>
      <PageHeader title="News" />
      <div className="px-6 py-4">
        {posts.length === 0 && (
          <p className="font-grotesk text-outline">No news yet.</p>
        )}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-4">
          {posts.map(post => (
            <div key={post.id} className="break-inside-avoid mb-4">
              <NewsCard post={post} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
```

---

## Projects Page

### `src/app/(public)/projects/page.tsx`
```typescript
import { ProjectsClient } from '@/components/sections/ProjectsClient'

async function getProjects() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
  const res = await fetch(`${baseUrl}/api/projects`, { cache: 'no-store' })
  const { projects } = await res.json()
  return projects
}

export default async function ProjectsPage() {
  const projects = await getProjects()
  return <ProjectsClient initialProjects={projects} />
}
```

### `src/components/sections/ProjectsClient.tsx`
Responsive grid 1/2/3 cols. Polls every 30s.

```typescript
'use client'

import { useCallback } from 'react'
import { usePolling } from '@/lib/hooks/usePolling'
import { ProjectCard } from '@/components/ui/ProjectCard'
import { PageHeader } from '@/components/ui/PageHeader'

type Project = { id: string; teamName: string; projectName: string; description: string | null; iframeUrl: string }

export function ProjectsClient({ initialProjects }: { initialProjects: Project[] }) {
  const fetcher = useCallback(
    () => fetch('/api/projects').then(r => r.json()).then(d => d.projects),
    []
  )
  const { data } = usePolling(fetcher, 30_000)
  const projects = data ?? initialProjects

  return (
    <div>
      <PageHeader title="Projects" />
      <div className="px-6 py-4">
        {projects.length === 0 && (
          <p className="font-grotesk text-outline">No projects submitted yet.</p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(p => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      </div>
    </div>
  )
}
```

---

## Help Page

### `src/app/(public)/help/page.tsx`
Pure Client Component — no SSR data needed.

```typescript
import { HelpForm } from '@/components/sections/HelpForm'

export default function HelpPage() {
  return <HelpForm />
}
```

### `src/components/sections/HelpForm.tsx`
```typescript
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { PageHeader } from '@/components/ui/PageHeader'

export function HelpForm() {
  const [teamName, setTeamName] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!teamName.trim()) {
      setError('Please enter your team name')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/help-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamName: teamName.trim() }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Something went wrong')
        return
      }
      setSubmitted(true)
    } catch {
      setError('Network error — please try again')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div>
        <PageHeader title="Help" />
        <div className="px-6 py-12 text-center">
          <div className="border-4 border-primary bg-secondary-fixed shadow-hard-lg p-10 max-w-md mx-auto rotate-[-1deg]">
            <h2 className="font-epilogue font-black text-4xl uppercase tracking-tight leading-none">
              HELP IS ON THE WAY
            </h2>
            <p className="font-grotesk text-base mt-4">
              A mentor will come find team <strong>{teamName}</strong> soon.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Get Help" subtitle="A mentor will come find you." />
      <div className="px-6 py-8 max-w-md">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Team Name"
            value={teamName}
            onChange={e => setTeamName(e.target.value)}
            placeholder="Team Alpha"
            required
          />
          {error && (
            <p className="font-grotesk text-sm text-error">{error}</p>
          )}
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            className="w-full py-3"
          >
            {loading ? 'SENDING...' : 'REQUEST HELP'}
          </Button>
        </form>
      </div>
    </div>
  )
}
```

---

## Acceptance Criteria

- [ ] `GET /` renders "CodeDay London" event name and a live countdown in the browser
- [ ] `GET /schedule` renders all schedule items with correct past/current/upcoming styling
- [ ] `GET /resources` renders resources grouped by category
- [ ] `GET /news` renders news in masonry columns with pinned posts first
- [ ] `GET /projects` renders the project wall (empty state visible if no projects)
- [ ] `GET /help` shows the help form; submitting with a team name shows the success state
- [ ] Public nav is visible on all pages; active page link is highlighted
- [ ] All pages poll their respective API endpoints every 30 seconds (verify in Network tab)
- [ ] `npx tsc --noEmit` passes

---

## Tests

### Navigation Test
1. Open `http://localhost:3000` — HOME link highlighted in nav
2. Click SCHEDULE — navigates to `/schedule`, SCHEDULE link highlighted
3. Click RESOURCES — navigates to `/resources`, RESOURCES link highlighted
4. Continue for NEWS, PROJECTS, HELP

### Polling Test (Network Tab)
1. Open `http://localhost:3000/schedule` in Chrome
2. Open DevTools > Network tab
3. Filter by "api/schedule"
4. Wait 35 seconds — should see a new request appear every ~30 seconds

### Schedule Status Test
Using admin API, create schedule items:
```bash
export ADMIN_SECRET="YOUR_ADMIN_SECRET"
# Past item
curl -s -X POST http://localhost:3000/api/schedule \
  -H "Content-Type: application/json" -H "x-admin-key: $ADMIN_SECRET" \
  -d "{\"title\":\"Past Event\",\"startsAt\":\"$(date -u -d '2 hours ago' +%Y-%m-%dT%H:%M:%SZ)\",\"endsAt\":\"$(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%SZ)\"}"
# Current item
curl -s -X POST http://localhost:3000/api/schedule \
  -H "Content-Type: application/json" -H "x-admin-key: $ADMIN_SECRET" \
  -d "{\"title\":\"Current Event\",\"startsAt\":\"$(date -u -d '30 minutes ago' +%Y-%m-%dT%H:%M:%SZ)\",\"endsAt\":\"$(date -u -d '30 minutes' +%Y-%m-%dT%H:%M:%SZ)\"}"
# Future item
curl -s -X POST http://localhost:3000/api/schedule \
  -H "Content-Type: application/json" -H "x-admin-key: $ADMIN_SECRET" \
  -d "{\"title\":\"Future Event\",\"startsAt\":\"$(date -u -d '2 hours' +%Y-%m-%dT%H:%M:%SZ)\"}"
```
Then verify on `/schedule`:
- "Past Event" appears dimmed (opacity 60%)
- "Current Event" has yellow background and "LIVE NOW" stamp
- "Future Event" appears normal

### Help Form Test
1. Open `http://localhost:3000/help`
2. Submit without a team name — should show "Please enter your team name"
3. Enter "Team Alpha" and submit — should show "HELP IS ON THE WAY" success state
4. Verify in admin API:
```bash
curl -s http://localhost:3000/api/help-requests \
  -H "x-admin-key: $ADMIN_SECRET" | jq '.requests[].teamName'
# Expected: "Team Alpha"
```

### Home Countdown Test
1. Using admin API, set `submissionDeadline` to 10 seconds from now:
```bash
DEADLINE=$(date -u -d '10 seconds' +%Y-%m-%dT%H:%M:%SZ)
curl -s -X PATCH http://localhost:3000/api/config \
  -H "Content-Type: application/json" -H "x-admin-key: $ADMIN_SECRET" \
  -d "{\"submissionDeadline\":\"$DEADLINE\"}"
```
2. Reload `http://localhost:3000` — countdown should show ~00:00:10 and count down to "SUBMISSIONS CLOSED"
