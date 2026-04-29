# Frontend Structure

## Technology

- Next.js 14 App Router
- TypeScript
- Tailwind CSS with custom design tokens (see Design System section below)
- Google Fonts: Epilogue + Space Grotesk (loaded via `next/font/google` in root `layout.tsx`)

---

## Route Groups & Directory Layout

```
src/app/
  layout.tsx                      # Root layout: font vars, paper-grain overlay, global CSS
  (public)/
    page.tsx                      # / — Home
    schedule/page.tsx             # /schedule
    resources/page.tsx            # /resources
    news/page.tsx                 # /news
    projects/page.tsx             # /projects
    help/page.tsx                 # /help
  (admin)/
    admin/
      layout.tsx                  # Admin shell layout (nav sidebar)
      page.tsx                    # /admin — Dashboard overview
      schedule/page.tsx           # /admin/schedule
      news/page.tsx               # /admin/news
      resources/page.tsx          # /admin/resources
      projects/page.tsx           # /admin/projects
      config/page.tsx             # /admin/config
  (mentor)/
    mentor/
      layout.tsx                  # Mentor shell layout
      page.tsx                    # /mentor — Help request queue
```

---

## Polling Strategy

Polling is implemented with a custom React hook used inside Client Components.

### Hook: `src/lib/hooks/usePolling.ts`

```typescript
import { useEffect, useState, useCallback } from 'react'

export function usePolling<T>(
  fetcher: () => Promise<T>,
  intervalMs: number = 30_000
): { data: T | null; loading: boolean; error: string | null } {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const result = await fetcher()
      setData(result)
      setError(null)
    } catch (e) {
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [fetcher])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, intervalMs)
    return () => clearInterval(interval)
  }, [fetchData, intervalMs])

  return { data, loading, error }
}
```

Rules:
- Only Client Components (`'use client'`) use this hook.
- Server Components fetch data once via `fetch()` at render time (initial load is SSR).
- The pattern is: Server Component fetches initial data as a prop, passes to Client Component, Client Component then takes over polling to keep data fresh.
- All polling fetchers hit the public GET API routes with no auth headers.
- Polling interval is 30 seconds everywhere.

---

## Page-by-Page Component Breakdown

---

### `/` — Home Page

**File**: `src/app/(public)/page.tsx` (Server Component for initial data)
**Client wrapper**: `src/components/sections/HomeClient.tsx`

**Initial data fetched server-side** (parallel Promise.all):
- `GET /api/config` → `EventConfig`
- `GET /api/schedule` → `ScheduleItem[]`
- `GET /api/news` → `NewsPost[]` (pinned only filtered client-side)

**Sections (top to bottom)**:

1. **HeroSection** — event name (headline-xl) + countdown to `submissionDeadline`
   - Countdown component: `src/components/ui/Countdown.tsx` (Client Component, uses `useEffect` with 1-second interval)
   - Shows days/hours/minutes/seconds in large stamp-style blocks
   - Background: black, text: `secondary-fixed` (yellow-green)

2. **HappeningNowSection** — shows the single schedule item where `now >= startsAt && now <= endsAt` (or the next upcoming item if none current)
   - Card with torn-edge-bottom, `secondary-fixed` background, slight rotation +1deg
   - Label: "HAPPENING NOW" or "UP NEXT" as a rotated stamp

3. **PinnedNewsSection** — shows `NewsPost` where `pinned = true`, max 3 items
   - Masonry-style layout using CSS columns (2 cols on md+)
   - ANNOUNCEMENT type: yellow card background
   - NEWS type: white card background

4. **QuickLinksSection** — renders `importantLinks` from EventConfig + WiFi card
   - WiFi card: shows SSID + password, copy-to-clipboard button
   - Discord link button: heavy border, hard shadow

**Polling**: `HomeClient.tsx` polls `/api/config`, `/api/schedule`, `/api/news` every 30s.

---

### `/schedule` — Full Schedule

**File**: `src/app/(public)/schedule/page.tsx` (Server Component)
**Client wrapper**: `src/components/sections/ScheduleClient.tsx`

**Data**: `GET /api/schedule`

**Layout**:
- Full-width single column
- Each `ScheduleItem` rendered as `ScheduleCard` component
- Current item (where `now` is between `startsAt` and `endsAt`) highlighted: `secondary-fixed` background, "LIVE NOW" stamp
- Past items: reduced opacity (60%), no shadow
- Future items: full opacity, standard card style

**Component**: `src/components/ui/ScheduleCard.tsx`
- Props: `item: ScheduleItem`, `status: 'past' | 'current' | 'upcoming'`
- Renders time (left column) + title/description/location (right column)
- Torn-edge-bottom on each card

**Polling**: every 30s.

---

### `/resources` — Resource Links

**File**: `src/app/(public)/resources/page.tsx` (Server Component)
**Client wrapper**: `src/components/sections/ResourcesClient.tsx`

**Data**: `GET /api/resources`

**Layout**:
- Resources grouped by `category`
- Each category is a section with a headline-lg category label
- Within each category: grid of `ResourceCard` components (2–3 cols on md+)

**Component**: `src/components/ui/ResourceCard.tsx`
- Props: `resource: ResourceLink`
- White background, 2px black border, 4px hard shadow
- Title as bold link, description below, category chip in top-right corner

**Polling**: every 30s.

---

### `/news` — News Feed

**File**: `src/app/(public)/news/page.tsx` (Server Component)
**Client wrapper**: `src/components/sections/NewsClient.tsx`

**Data**: `GET /api/news`

**Layout**:
- CSS columns masonry layout (2 cols on md, 3 on lg)
- Each `NewsPost` rendered as `NewsCard` component
- Pinned posts rendered first with a "PINNED" stamp

**Component**: `src/components/ui/NewsCard.tsx`
- Props: `post: NewsPost`
- ANNOUNCEMENT type: `secondary-fixed` (yellow) background, black text
- NEWS type: white background
- Headline: `font-epilogue font-black text-2xl uppercase tracking-tight`
- Random rotation class applied from set: `rotate-[-1deg]`, `rotate-[0.5deg]`, `rotate-[1.5deg]`, `rotate-[-0.5deg]` — assigned deterministically based on post id to avoid hydration mismatch
- `imageUrl` rendered as `<img>` with `filter: contrast(2) grayscale(1)` (`.dither` class)
- Torn-edge-top on cards
- Hard 4px black shadow

**Polling**: every 30s.

---

### `/projects` — Project Wall

**File**: `src/app/(public)/projects/page.tsx` (Server Component)
**Client wrapper**: `src/components/sections/ProjectsClient.tsx`

**Data**: `GET /api/projects`

**Layout**:
- Responsive grid: 1 col on mobile, 2 on md, 3 on lg
- Each project: `ProjectCard` component

**Component**: `src/components/ui/ProjectCard.tsx`
- Props: `project: Project`
- Top section: teamName (headline-lg) + projectName + description
- Bottom section: `<iframe src={iframeUrl} />` — 16:9 aspect ratio, 2px black border
- iframe has `sandbox="allow-scripts allow-same-origin allow-forms"` attribute
- Card has slight rotation, torn-edge-top, hard shadow

**Polling**: every 30s.

---

### `/help` — Help Request Form

**File**: `src/app/(public)/help/page.tsx`

This page is a pure Client Component — no polling, no SSR data needed.

**Component**: `src/components/sections/HelpForm.tsx`
- State: `teamName: string`, `submitted: boolean`, `error: string | null`, `loading: boolean`
- On submit: `POST /api/help-requests` with `{ teamName }` — no auth header
- Shows a success state after submission: large stamp "HELP IS ON THE WAY" message, styled with the punk design
- Inputs: bottom-border only, label-maker style label
- Submit button: heavy black border, hard shadow, hover shifts position

---

### `/admin` — Dashboard Overview

**File**: `src/app/(admin)/admin/page.tsx` (Server Component)

Fetches counts of all entities and the EventConfig for a summary view.
Uses `x-admin-key` header on all fetches (passed via server-side env var, not exposed to client).

Displays:
- Event name and submission deadline (from config)
- Count cards: # schedule items, # news posts, # resources, # projects, # pending help requests
- Quick-nav links to each admin sub-page

---

### `/admin/schedule`

**File**: `src/app/(admin)/admin/schedule/page.tsx` (Client Component)

- Lists all schedule items in a table
- "Add Item" button opens an inline form (no modal — inline expansion below the table row)
- Each row has Edit and Delete buttons
- Edit opens an inline edit form within the row
- On any mutation: re-fetches the list immediately (no polling — mutations are immediate, not 30s delayed)

---

### `/admin/news`

**File**: `src/app/(admin)/admin/news/page.tsx` (Client Component)

Same CRUD pattern as `/admin/schedule`.
Additional controls per post: toggle `pinned`, change `type`.

---

### `/admin/resources`

**File**: `src/app/(admin)/admin/resources/page.tsx` (Client Component)

Same CRUD pattern. Additional field: `category` (text input with suggested values shown as chips below the field).

---

### `/admin/projects`

**File**: `src/app/(admin)/admin/projects/page.tsx` (Client Component)

Same CRUD pattern. `iframeUrl` input with a live preview iframe rendered below the field in the form.

---

### `/admin/config`

**File**: `src/app/(admin)/admin/config/page.tsx` (Client Component)

- Fetches `GET /api/config` on mount
- Single form with all EventConfig fields
- `importantLinks`: dynamic array field — "Add Link" button appends a `{label, url}` pair; each pair has a delete button
- `submissionDeadline`: `<input type="datetime-local">` — convert to/from ISO string
- Save button calls `PATCH /api/config`
- No table — it is a settings page, not a list

---

### `/mentor`

**File**: `src/app/(mentor)/mentor/page.tsx` (Client Component)

- Polls `GET /api/help-requests` every 15 seconds (shorter interval — mentors need faster feedback)
- Displays requests in three columns: PENDING | IN_PROGRESS | RESOLVED
- Each card has team name, creation time, claimedBy (if set)
- PENDING card: "Claim" button — opens small inline input to enter mentor name, then calls `PATCH /api/help-requests/[id]` with `{ status: "IN_PROGRESS", claimedBy: name }`
- IN_PROGRESS card: "Resolve" button — calls `PATCH` with `{ status: "RESOLVED" }`
- All mentor API calls include `x-admin-key` header; the key is sourced from `NEXT_PUBLIC_ADMIN_SECRET`

---

## Shared UI Components (`src/components/ui/`)

| Component | Purpose |
|---|---|
| `Countdown.tsx` | Live countdown to a DateTime; client-only |
| `ScheduleCard.tsx` | Single schedule item display |
| `NewsCard.tsx` | Single news post in zine style |
| `ResourceCard.tsx` | Single resource link card |
| `ProjectCard.tsx` | Project card with iframe embed |
| `HelpForm.tsx` | Help request submission form |
| `Button.tsx` | Design-system button: heavy border, hard shadow, press-on-hover |
| `Input.tsx` | Bottom-border-only input with label-maker label |
| `Chip.tsx` | Masking-tape style tag/category chip |
| `StatusBadge.tsx` | Coloured stamp for PENDING / IN_PROGRESS / RESOLVED |
| `AdminNav.tsx` | Vertical sidebar nav for admin pages |
| `MentorNav.tsx` | Simplified nav for mentor layout |
| `PageHeader.tsx` | Torn-edge-bottom hero banner used on public pages |

---

## Design System Usage Rules

Agents implementing components MUST follow these rules exactly. They derive from `design/DESIGN.md`.

### Tailwind Config Extensions Required in `tailwind.config.ts`

```typescript
// Required custom values
colors: {
  'primary': '#000000',
  'on-primary': '#ffffff',
  'secondary-fixed': '#c3f400',
  'on-secondary-fixed': '#161e00',
  'surface': '#f9f9f9',
  'on-surface': '#1b1b1b',
  'error': '#ba1a1a',
  'outline': '#7e7576',
},
fontFamily: {
  epilogue: ['Epilogue', 'sans-serif'],
  grotesk: ['Space Grotesk', 'sans-serif'],
},
boxShadow: {
  'hard': '4px 4px 0px 0px rgba(0,0,0,1)',
  'hard-sm': '2px 2px 0px 0px rgba(0,0,0,1)',
  'hard-lg': '6px 6px 0px 0px rgba(0,0,0,1)',
},
borderRadius: {
  DEFAULT: '0px',
  none: '0px',
},
```

### CSS Classes Required in `src/app/globals.css`

```css
/* Torn paper clip-path effects */
.torn-edge-bottom {
  clip-path: polygon(
    0% 0%, 100% 0%, 100% 88%,
    97% 92%, 94% 88%, 91% 93%, 88% 89%, 85% 94%,
    82% 90%, 79% 95%, 76% 91%, 73% 96%, 70% 92%,
    67% 97%, 64% 93%, 61% 98%, 58% 94%, 55% 99%,
    52% 95%, 49% 100%, 46% 96%, 43% 100%, 40% 95%,
    37% 99%, 34% 94%, 31% 98%, 28% 93%, 25% 97%,
    22% 92%, 19% 96%, 16% 91%, 13% 95%, 10% 90%,
    7% 94%, 4% 89%, 0% 93%
  );
}

.torn-edge-top {
  clip-path: polygon(
    0% 7%, 3% 11%, 6% 7%, 9% 12%, 12% 8%,
    15% 13%, 18% 9%, 21% 14%, 24% 10%,
    27% 15%, 30% 11%, 33% 16%, 36% 12%,
    39% 7%, 42% 11%, 45% 6%, 48% 10%,
    51% 5%, 54% 9%, 57% 4%, 60% 8%,
    63% 3%, 66% 7%, 69% 2%, 72% 6%,
    75% 1%, 78% 5%, 81% 0%, 84% 4%,
    87% 0%, 90% 5%, 93% 1%, 96% 6%, 100% 2%,
    100% 100%, 0% 100%
  );
}

/* High-contrast dither filter */
.dither {
  filter: contrast(1.8) grayscale(1) brightness(1.1);
}

/* SVG noise overlay */
.paper-grain::after {
  content: '';
  position: fixed;
  inset: 0;
  z-index: 50;
  pointer-events: none;
  opacity: 0.04;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  background-repeat: repeat;
  background-size: 128px 128px;
}

/* Hard shadow button press effect */
.btn-press {
  transition: transform 0.05s, box-shadow 0.05s;
}
.btn-press:hover {
  transform: translate(4px, 4px);
  box-shadow: none;
}

/* Offset rotations for collage effect */
.offset-1 { transform: rotate(-1.5deg) translate(-2px, 1px); }
.offset-2 { transform: rotate(1deg) translate(2px, -1px); }
.offset-3 { transform: rotate(-0.5deg) translate(1px, 2px); }

/* Hand-draw circle around icon buttons */
.hand-draw-circle {
  border-radius: 50% 45% 48% 50% / 50% 48% 45% 50%;
  border: 2px solid black;
}
```

### Component Style Rules (enforce in all components)

- **border-radius**: always `0` — never use `rounded-*` classes.
- **shadows**: use `shadow-hard`, `shadow-hard-sm`, or `shadow-hard-lg` only — never `shadow-md`, `shadow-lg`, etc.
- **buttons**: `border-2 border-primary bg-white px-4 py-2 font-epilogue font-bold uppercase shadow-hard btn-press`
- **primary buttons**: `bg-primary text-on-primary border-2 border-primary shadow-hard btn-press`
- **accent buttons**: `bg-secondary-fixed text-on-secondary-fixed border-2 border-primary shadow-hard btn-press`
- **inputs**: `border-0 border-b-2 border-primary bg-transparent outline-none focus:border-primary px-0 py-2`
- **labels**: `font-grotesk text-xs font-medium uppercase tracking-widest text-on-surface`
- **cards**: `bg-white border-2 border-primary shadow-hard` (or `bg-secondary-fixed` for accent cards)
- **headlines**: `font-epilogue font-black uppercase tracking-tight leading-none`

---

## Navigation Structure

### Public Pages
- Navigation is a sticky top bar (mobile) or left sidebar (md+)
- Links: HOME / SCHEDULE / RESOURCES / NEWS / PROJECTS / HELP
- Active link: `secondary-fixed` background swatch behind the text
- No nested dropdowns

### Admin Pages
- `AdminNav.tsx` renders a fixed left sidebar
- Links: OVERVIEW / SCHEDULE / NEWS / RESOURCES / PROJECTS / CONFIG
- Sidebar has a "ADMIN" stamp label at top

### Mentor Pages
- Minimal header with "MENTOR PORTAL" title and logout link only

---

## Root Layout (`src/app/layout.tsx`)

```typescript
import { Epilogue, Space_Grotesk } from 'next/font/google'

const epilogue = Epilogue({
  subsets: ['latin'],
  weight: ['400', '700', '800', '900'],
  variable: '--font-epilogue',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-grotesk',
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${epilogue.variable} ${spaceGrotesk.variable}`}>
      <body className="bg-surface text-on-surface paper-grain min-h-screen">
        {children}
      </body>
    </html>
  )
}
```
