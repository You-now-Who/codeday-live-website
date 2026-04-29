# Task 11 — UI Primitive Components

## Goal
Build all 13 reusable design-system components in `src/components/ui/`. These are the building blocks used by every page. They must strictly follow the design rules from `design/DESIGN.md` and `architecture/frontend-structure.md`.

## Prerequisites
- Task 10 complete (design tokens and CSS classes are available)

## Design Rules Enforced in Every Component
- `border-radius`: always `0` — never use `rounded-*`
- Shadows: only `shadow-hard`, `shadow-hard-sm`, or `shadow-hard-lg`
- Buttons: `border-2 border-primary bg-white px-4 py-2 font-epilogue font-bold uppercase shadow-hard btn-press`
- Primary buttons: `bg-primary text-on-primary border-2 border-primary shadow-hard btn-press`
- Accent buttons: `bg-secondary-fixed text-on-secondary-fixed border-2 border-primary shadow-hard btn-press`
- Inputs: `border-0 border-b-2 border-primary bg-transparent outline-none px-0 py-2`
- Labels: `font-grotesk text-xs font-medium uppercase tracking-widest text-on-surface`
- Cards: `bg-white border-2 border-primary shadow-hard`
- Headlines: `font-epilogue font-black uppercase tracking-tight leading-none`

---

## Files to Create

### `src/components/ui/Button.tsx`
Reusable button with three variants: `default` (white bg), `primary` (black bg, white text), `accent` (yellow bg). Includes the `btn-press` effect. All variants have 0 border-radius and hard shadows.

```typescript
import { ButtonHTMLAttributes } from 'react'

type ButtonVariant = 'default' | 'primary' | 'accent'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
}

const variantClasses: Record<ButtonVariant, string> = {
  default: 'bg-white text-primary border-2 border-primary shadow-hard btn-press',
  primary: 'bg-primary text-on-primary border-2 border-primary shadow-hard btn-press',
  accent: 'bg-secondary-fixed text-on-secondary-fixed border-2 border-primary shadow-hard btn-press',
}

export function Button({ variant = 'default', className = '', children, ...props }: ButtonProps) {
  return (
    <button
      className={`px-4 py-2 font-epilogue font-bold uppercase text-sm ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
```

### `src/components/ui/Input.tsx`
Bottom-border-only input with a label-maker style label above it. No border-radius, no full border box.

```typescript
import { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
}

export function Input({ label, id, className = '', ...props }: InputProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={inputId}
        className="font-grotesk text-xs font-medium uppercase tracking-widest text-on-surface"
      >
        {label}
      </label>
      <input
        id={inputId}
        className={`border-0 border-b-2 border-primary bg-transparent outline-none focus:border-primary px-0 py-2 font-grotesk text-base text-on-surface ${className}`}
        {...props}
      />
    </div>
  )
}
```

### `src/components/ui/Chip.tsx`
Category tag that looks like masking tape — slight rotation, background color, thick font. Used for resource categories and news post types.

```typescript
interface ChipProps {
  label: string
  className?: string
}

export function Chip({ label, className = '' }: ChipProps) {
  return (
    <span
      className={`inline-block bg-secondary-fixed text-on-secondary-fixed font-grotesk text-xs font-medium uppercase tracking-widest px-2 py-0.5 border border-primary rotate-[-1deg] ${className}`}
    >
      {label}
    </span>
  )
}
```

### `src/components/ui/StatusBadge.tsx`
Stamp-style badge for help request statuses. PENDING = white, IN_PROGRESS = yellow, RESOLVED = black/white.

```typescript
type Status = 'PENDING' | 'IN_PROGRESS' | 'RESOLVED'

const statusConfig: Record<Status, { label: string; classes: string }> = {
  PENDING: {
    label: 'PENDING',
    classes: 'bg-white text-primary border-2 border-primary',
  },
  IN_PROGRESS: {
    label: 'IN PROGRESS',
    classes: 'bg-secondary-fixed text-on-secondary-fixed border-2 border-primary',
  },
  RESOLVED: {
    label: 'RESOLVED',
    classes: 'bg-primary text-on-primary border-2 border-primary',
  },
}

interface StatusBadgeProps {
  status: Status
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const { label, classes } = statusConfig[status]
  return (
    <span className={`inline-block font-epilogue font-bold text-xs uppercase px-2 py-1 ${classes}`}>
      {label}
    </span>
  )
}
```

### `src/components/ui/Countdown.tsx`
Live countdown to a target datetime. Updates every second via `setInterval`. Shows days, hours, minutes, seconds as stamp-style blocks. Client Component.

```typescript
'use client'

import { useEffect, useState } from 'react'

interface CountdownProps {
  targetDate: string
}

function getTimeLeft(target: Date) {
  const diff = target.getTime() - Date.now()
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true }
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)
  return { days, hours, minutes, seconds, expired: false }
}

function pad(n: number) {
  return String(n).padStart(2, '0')
}

export function Countdown({ targetDate }: CountdownProps) {
  const target = new Date(targetDate)
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(target))

  useEffect(() => {
    const interval = setInterval(() => setTimeLeft(getTimeLeft(target)), 1000)
    return () => clearInterval(interval)
  }, [target])

  if (timeLeft.expired) {
    return (
      <div className="font-epilogue font-black text-2xl uppercase tracking-tight text-secondary-fixed">
        SUBMISSIONS CLOSED
      </div>
    )
  }

  const units = [
    { label: 'DAYS', value: timeLeft.days },
    { label: 'HRS', value: timeLeft.hours },
    { label: 'MIN', value: timeLeft.minutes },
    { label: 'SEC', value: timeLeft.seconds },
  ]

  return (
    <div className="flex gap-4">
      {units.map(({ label, value }) => (
        <div key={label} className="flex flex-col items-center">
          <span className="font-epilogue font-black text-5xl leading-none text-secondary-fixed tabular-nums">
            {pad(value)}
          </span>
          <span className="font-grotesk text-xs font-medium uppercase tracking-widest text-secondary-fixed opacity-70">
            {label}
          </span>
        </div>
      ))}
    </div>
  )
}
```

### `src/components/ui/ScheduleCard.tsx`
Single schedule item. Three visual variants: `past` (dimmed), `current` (yellow, LIVE NOW stamp), `upcoming` (normal).

```typescript
interface ScheduleItem {
  id: string
  title: string
  description: string | null
  location: string | null
  startsAt: string
  endsAt: string | null
}

type ScheduleStatus = 'past' | 'current' | 'upcoming'

interface ScheduleCardProps {
  item: ScheduleItem
  status: ScheduleStatus
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export function ScheduleCard({ item, status }: ScheduleCardProps) {
  const isPast = status === 'past'
  const isCurrent = status === 'current'

  return (
    <div
      className={`border-2 border-primary p-4 torn-edge-bottom ${
        isCurrent
          ? 'bg-secondary-fixed shadow-hard-lg'
          : 'bg-white shadow-hard'
      } ${isPast ? 'opacity-60' : ''}`}
    >
      <div className="flex gap-6">
        <div className="flex-shrink-0 font-grotesk text-sm font-medium tabular-nums w-16">
          <div>{formatTime(item.startsAt)}</div>
          {item.endsAt && (
            <div className="text-outline">— {formatTime(item.endsAt)}</div>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-start gap-3">
            <h3 className="font-epilogue font-black text-lg uppercase tracking-tight leading-none">
              {item.title}
            </h3>
            {isCurrent && (
              <span className="flex-shrink-0 bg-primary text-on-primary font-epilogue font-bold text-xs uppercase px-2 py-0.5 rotate-[-2deg] inline-block">
                LIVE NOW
              </span>
            )}
          </div>
          {item.description && (
            <p className="font-grotesk text-sm mt-1 text-on-surface">{item.description}</p>
          )}
          {item.location && (
            <p className="font-grotesk text-xs uppercase tracking-widest mt-1 text-outline">
              {item.location}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
```

### `src/components/ui/NewsCard.tsx`
Zine-style news card. ANNOUNCEMENT type gets yellow background, NEWS type gets white. Slight rotation applied deterministically from post id to avoid hydration mismatch. Torn-top edge, hard shadow.

```typescript
import { Chip } from './Chip'

interface NewsPost {
  id: string
  headline: string
  body: string
  imageUrl: string | null
  type: 'NEWS' | 'ANNOUNCEMENT'
  pinned: boolean
  createdAt: string
}

interface NewsCardProps {
  post: NewsPost
}

const ROTATIONS = ['rotate-[-1deg]', 'rotate-[0.5deg]', 'rotate-[1.5deg]', 'rotate-[-0.5deg]']

function getRotation(id: string): string {
  const sum = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return ROTATIONS[sum % ROTATIONS.length]
}

export function NewsCard({ post }: NewsCardProps) {
  const isAnnouncement = post.type === 'ANNOUNCEMENT'
  const rotation = getRotation(post.id)

  return (
    <div
      className={`border-2 border-primary shadow-hard torn-edge-top p-5 ${rotation} ${
        isAnnouncement ? 'bg-secondary-fixed' : 'bg-white'
      }`}
    >
      {post.pinned && (
        <div className="mb-2">
          <span className="font-epilogue font-bold text-xs uppercase bg-primary text-on-primary px-2 py-0.5 rotate-[1deg] inline-block">
            PINNED
          </span>
        </div>
      )}
      <Chip label={post.type} className="mb-3" />
      {post.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.imageUrl}
          alt=""
          className="dither w-full mb-3 border-2 border-primary"
        />
      )}
      <h3 className="font-epilogue font-black text-xl uppercase tracking-tight leading-none mb-2">
        {post.headline}
      </h3>
      <p className="font-grotesk text-sm text-on-surface leading-relaxed">{post.body}</p>
      <p className="font-grotesk text-xs text-outline mt-3 uppercase tracking-widest">
        {new Date(post.createdAt).toLocaleDateString()}
      </p>
    </div>
  )
}
```

### `src/components/ui/ResourceCard.tsx`
Resource link card. White background, 2px black border, hard shadow. Category chip in top-right corner.

```typescript
import { Chip } from './Chip'

interface ResourceLink {
  id: string
  title: string
  url: string
  description: string | null
  category: string
}

interface ResourceCardProps {
  resource: ResourceLink
}

export function ResourceCard({ resource }: ResourceCardProps) {
  return (
    <div className="bg-white border-2 border-primary shadow-hard p-4 relative">
      <div className="absolute top-3 right-3">
        <Chip label={resource.category} />
      </div>
      <a
        href={resource.url}
        target="_blank"
        rel="noopener noreferrer"
        className="font-epilogue font-bold text-base uppercase tracking-tight underline decoration-2 decoration-primary hover:bg-secondary-fixed transition-colors pr-16"
      >
        {resource.title}
      </a>
      {resource.description && (
        <p className="font-grotesk text-sm text-on-surface mt-2">{resource.description}</p>
      )}
    </div>
  )
}
```

### `src/components/ui/ProjectCard.tsx`
Project card with iframe embed. Slight rotation, torn-top edge, hard shadow. iframe has sandbox attribute.

```typescript
interface Project {
  id: string
  teamName: string
  projectName: string
  description: string | null
  iframeUrl: string
}

interface ProjectCardProps {
  project: Project
}

const ROTATIONS = ['rotate-[-0.5deg]', 'rotate-[0.5deg]', 'rotate-[-1deg]', 'rotate-[1deg]']

function getRotation(id: string): string {
  const sum = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return ROTATIONS[sum % ROTATIONS.length]
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <div className={`border-2 border-primary shadow-hard torn-edge-top bg-white ${getRotation(project.id)}`}>
      <div className="p-4">
        <h3 className="font-epilogue font-black text-xl uppercase tracking-tight leading-none">
          {project.teamName}
        </h3>
        <p className="font-grotesk text-sm font-medium mt-1">{project.projectName}</p>
        {project.description && (
          <p className="font-grotesk text-sm text-outline mt-1">{project.description}</p>
        )}
      </div>
      <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
        <iframe
          src={project.iframeUrl}
          className="absolute inset-0 w-full h-full border-t-2 border-primary"
          sandbox="allow-scripts allow-same-origin allow-forms"
          referrerPolicy="no-referrer"
          title={`${project.teamName} — ${project.projectName}`}
        />
      </div>
    </div>
  )
}
```

### `src/components/ui/PageHeader.tsx`
Torn-edge-bottom hero banner used at the top of each public page. Black background, white/yellow title text.

```typescript
interface PageHeaderProps {
  title: string
  subtitle?: string
}

export function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <div className="bg-primary text-on-primary torn-edge-bottom px-8 pt-12 pb-20 mb-8">
      <h1 className="font-epilogue font-black text-5xl uppercase tracking-tight leading-none">
        {title}
      </h1>
      {subtitle && (
        <p className="font-grotesk text-base mt-3 text-on-primary opacity-70">{subtitle}</p>
      )}
    </div>
  )
}
```

### `src/components/ui/AdminNav.tsx`
Fixed left sidebar for admin pages. Links to all admin sub-pages. "ADMIN" stamp label at top.

```typescript
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_LINKS = [
  { href: '/admin', label: 'OVERVIEW' },
  { href: '/admin/schedule', label: 'SCHEDULE' },
  { href: '/admin/news', label: 'NEWS' },
  { href: '/admin/resources', label: 'RESOURCES' },
  { href: '/admin/projects', label: 'PROJECTS' },
  { href: '/admin/config', label: 'CONFIG' },
]

export function AdminNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed left-0 top-0 h-full w-48 bg-primary text-on-primary border-r-2 border-primary flex flex-col z-40">
      <div className="p-4 border-b-2 border-on-primary/20">
        <span className="font-epilogue font-black text-xs uppercase tracking-widest bg-secondary-fixed text-on-secondary-fixed px-2 py-1 rotate-[-1deg] inline-block">
          ADMIN
        </span>
      </div>
      <ul className="flex flex-col gap-0 mt-4 flex-1">
        {NAV_LINKS.map(({ href, label }) => {
          const isActive = pathname === href
          return (
            <li key={href}>
              <Link
                href={href}
                className={`block px-4 py-3 font-epilogue font-bold text-sm uppercase tracking-tight border-b border-on-primary/10 transition-colors ${
                  isActive
                    ? 'bg-secondary-fixed text-on-secondary-fixed'
                    : 'hover:bg-on-primary/10'
                }`}
              >
                {label}
              </Link>
            </li>
          )
        })}
      </ul>
      <div className="p-4 border-t-2 border-on-primary/20">
        <a
          href="/admin/logout"
          className="font-grotesk text-xs uppercase tracking-widest text-on-primary/50 hover:text-on-primary"
        >
          Logout
        </a>
      </div>
    </nav>
  )
}
```

### `src/components/ui/MentorNav.tsx`
Minimal header for mentor layout.

```typescript
export function MentorNav() {
  return (
    <header className="bg-primary text-on-primary px-8 py-4 flex items-center justify-between border-b-4 border-secondary-fixed">
      <span className="font-epilogue font-black text-lg uppercase tracking-tight">
        MENTOR PORTAL
      </span>
      <a
        href="/mentor/logout"
        className="font-grotesk text-xs uppercase tracking-widest text-on-primary/60 hover:text-on-primary"
      >
        Logout
      </a>
    </header>
  )
}
```

---

## Acceptance Criteria

- [ ] All 12 component files exist in `src/components/ui/`
- [ ] `npx tsc --noEmit` passes with no errors
- [ ] No component uses `rounded-*` Tailwind classes
- [ ] No component uses `shadow-md`, `shadow-lg`, `shadow-xl`, etc. (only `shadow-hard*`)
- [ ] `Button` renders three variants correctly with the correct bg/text/border colors
- [ ] `Countdown` ticks down in real time and shows "SUBMISSIONS CLOSED" when expired
- [ ] `NewsCard` rotation is deterministic (same post ID always gets the same rotation)
- [ ] `ProjectCard` iframe has `sandbox` and `referrerPolicy` attributes
- [ ] `AdminNav` highlights the active link based on current pathname

---

## Tests

### TypeScript Compilation
```bash
npx tsc --noEmit
# Must return 0 errors
```

### Visual Test — Create a Storybook-style test page
Create `src/app/test-components/page.tsx` (delete after testing):

```typescript
import { Button } from '@/components/ui/Button'
import { Chip } from '@/components/ui/Chip'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Countdown } from '@/components/ui/Countdown'
import { ScheduleCard } from '@/components/ui/ScheduleCard'
import { NewsCard } from '@/components/ui/NewsCard'
import { ResourceCard } from '@/components/ui/ResourceCard'
import { ProjectCard } from '@/components/ui/ProjectCard'
import { PageHeader } from '@/components/ui/PageHeader'

export default function ComponentTestPage() {
  const futureDate = new Date(Date.now() + 1000 * 60 * 60 * 3).toISOString()

  return (
    <div className="p-8 space-y-12 max-w-2xl">
      <PageHeader title="Components" subtitle="Design system test page" />

      <section>
        <h2 className="font-epilogue font-black text-2xl uppercase mb-4">Buttons</h2>
        <div className="flex gap-4 flex-wrap">
          <Button>Default</Button>
          <Button variant="primary">Primary</Button>
          <Button variant="accent">Accent</Button>
          <Button disabled>Disabled</Button>
        </div>
      </section>

      <section>
        <h2 className="font-epilogue font-black text-2xl uppercase mb-4">Chips & Badges</h2>
        <div className="flex gap-4 flex-wrap items-center">
          <Chip label="TOOLS" />
          <Chip label="DOCS" />
          <StatusBadge status="PENDING" />
          <StatusBadge status="IN_PROGRESS" />
          <StatusBadge status="RESOLVED" />
        </div>
      </section>

      <section>
        <h2 className="font-epilogue font-black text-2xl uppercase mb-4">Countdown</h2>
        <div className="bg-primary p-6">
          <Countdown targetDate={futureDate} />
        </div>
      </section>

      <section>
        <h2 className="font-epilogue font-black text-2xl uppercase mb-4">Schedule Cards</h2>
        <div className="space-y-4">
          <ScheduleCard
            item={{ id: '1', title: 'Opening Ceremony', description: 'Welcome!', location: 'Main Hall', startsAt: new Date(Date.now() - 60000).toISOString(), endsAt: new Date(Date.now() + 60000).toISOString() }}
            status="current"
          />
          <ScheduleCard
            item={{ id: '2', title: 'Hacking Time', description: null, location: null, startsAt: new Date(Date.now() + 3600000).toISOString(), endsAt: null }}
            status="upcoming"
          />
          <ScheduleCard
            item={{ id: '3', title: 'Past Event', description: 'Already done', location: 'Room A', startsAt: new Date(Date.now() - 7200000).toISOString(), endsAt: new Date(Date.now() - 3600000).toISOString() }}
            status="past"
          />
        </div>
      </section>

      <section>
        <h2 className="font-epilogue font-black text-2xl uppercase mb-4">News Cards</h2>
        <div className="columns-2 gap-4">
          <div className="break-inside-avoid mb-4">
            <NewsCard post={{ id: 'abc123', headline: 'Workshop at 3PM', body: 'Join us in room 3 for a workshop on machine learning.', imageUrl: null, type: 'NEWS', pinned: false, createdAt: new Date().toISOString() }} />
          </div>
          <div className="break-inside-avoid mb-4">
            <NewsCard post={{ id: 'def456', headline: 'WiFi Password Changed', body: 'The new WiFi password is hackathon2025. Please reconnect.', imageUrl: null, type: 'ANNOUNCEMENT', pinned: true, createdAt: new Date().toISOString() }} />
          </div>
        </div>
      </section>

      <section>
        <h2 className="font-epilogue font-black text-2xl uppercase mb-4">Resource Card</h2>
        <ResourceCard resource={{ id: '1', title: 'Figma', url: 'https://figma.com', description: 'Design tool for collaborative work', category: 'TOOLS' }} />
      </section>

      <section>
        <h2 className="font-epilogue font-black text-2xl uppercase mb-4">Project Card</h2>
        <ProjectCard project={{ id: 'proj1', teamName: 'Team Alpha', projectName: 'Awesome App', description: 'An app that does stuff', iframeUrl: 'https://example.com' }} />
      </section>
    </div>
  )
}
```

Open `http://localhost:3000/test-components` and verify each component matches the design spec.

### Countdown Timer Functional Test
- Open the countdown component with a future target date
- Watch it for 5 seconds — seconds digit should decrement
- Set target date to 1 second in the future — verify "SUBMISSIONS CLOSED" appears

### AdminNav Active State Test
- Navigate to `/admin` — "OVERVIEW" link should have yellow background
- Navigate to `/admin/schedule` — "SCHEDULE" link should have yellow background
- Navigate to `/admin/news` — "NEWS" link should have yellow background
