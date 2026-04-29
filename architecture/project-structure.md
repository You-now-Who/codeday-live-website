# Project Structure

## Root Directory

```
codeday-live-website/
├── architecture/               # Architecture docs (this folder)
├── design/
│   └── DESIGN.md               # Original design system spec
├── prisma/
│   ├── schema.prisma           # Prisma schema (see data-models.md)
│   ├── migrations/             # Auto-generated migration files
│   └── seed.ts                 # Seeds the EventConfig singleton row
├── public/
│   └── fonts/                  # (empty — fonts loaded via next/font/google)
├── src/
│   ├── app/                    # Next.js App Router root
│   ├── components/             # React components
│   └── lib/                    # Shared utilities and singletons
├── .env.local                  # Local dev secrets (never commit)
├── .env.example                # Template with all required env var names
├── .gitignore
├── next.config.ts
├── package.json
├── postcss.config.js
├── tailwind.config.ts
└── tsconfig.json
```

---

## `src/app/` — Next.js App Router

```
src/app/
├── layout.tsx                  # Root layout: fonts, paper-grain, global body styles
├── globals.css                 # Design system CSS: torn-edge, dither, paper-grain, btn-press, offsets
│
├── (public)/                   # Route group: no shared layout file (uses root layout)
│   ├── page.tsx                # GET / — Home page (Server Component, fetches config + schedule + news)
│   ├── schedule/
│   │   └── page.tsx            # GET /schedule (Server Component)
│   ├── resources/
│   │   └── page.tsx            # GET /resources (Server Component)
│   ├── news/
│   │   └── page.tsx            # GET /news (Server Component)
│   ├── projects/
│   │   └── page.tsx            # GET /projects (Server Component)
│   └── help/
│       └── page.tsx            # GET /help (Client Component — form only, no initial data)
│
├── (admin)/                    # Route group: protected by middleware
│   └── admin/
│       ├── layout.tsx          # Admin shell: AdminNav sidebar + main content area
│       ├── page.tsx            # GET /admin — Dashboard overview
│       ├── schedule/
│       │   └── page.tsx        # GET /admin/schedule — CRUD schedule items
│       ├── news/
│       │   └── page.tsx        # GET /admin/news — CRUD news posts
│       ├── resources/
│       │   └── page.tsx        # GET /admin/resources — CRUD resource links
│       ├── projects/
│       │   └── page.tsx        # GET /admin/projects — CRUD projects
│       ├── config/
│       │   └── page.tsx        # GET /admin/config — Edit event config
│       └── logout/
│           └── route.ts        # GET /admin/logout — Returns 401 to clear browser Basic Auth cache
│
├── (mentor)/                   # Route group: protected by middleware
│   └── mentor/
│       ├── layout.tsx          # Mentor shell: minimal header
│       ├── page.tsx            # GET /mentor — Help request queue
│       └── logout/
│           └── route.ts        # GET /mentor/logout — Returns 401
│
└── api/
    ├── schedule/
    │   ├── route.ts            # GET, POST /api/schedule
    │   └── [id]/
    │       └── route.ts        # PATCH, DELETE /api/schedule/[id]
    ├── news/
    │   ├── route.ts            # GET, POST /api/news
    │   └── [id]/
    │       └── route.ts        # PATCH, DELETE /api/news/[id]
    ├── resources/
    │   ├── route.ts            # GET, POST /api/resources
    │   └── [id]/
    │       └── route.ts        # PATCH, DELETE /api/resources/[id]
    ├── projects/
    │   ├── route.ts            # GET, POST /api/projects
    │   └── [id]/
    │       └── route.ts        # PATCH, DELETE /api/projects/[id]
    ├── help-requests/
    │   ├── route.ts            # GET (admin only), POST (public) /api/help-requests
    │   └── [id]/
    │       └── route.ts        # PATCH /api/help-requests/[id]
    └── config/
        └── route.ts            # GET (public), PATCH (admin) /api/config
```

---

## `src/components/` — React Components

```
src/components/
├── ui/                         # Design-system primitives (reusable, no page-specific logic)
│   ├── Button.tsx              # Heavy border, hard shadow, press-on-hover button
│   ├── Input.tsx               # Bottom-border-only input + label-maker label
│   ├── Chip.tsx                # Masking-tape category chip/tag
│   ├── StatusBadge.tsx         # Stamp for PENDING / IN_PROGRESS / RESOLVED
│   ├── Countdown.tsx           # Live countdown to DateTime (Client Component)
│   ├── ScheduleCard.tsx        # Single schedule item (past/current/upcoming variants)
│   ├── NewsCard.tsx            # Zine-style news post card (torn edge, rotation)
│   ├── ResourceCard.tsx        # Resource link card with category chip
│   ├── ProjectCard.tsx         # Project card with iframe embed
│   ├── PageHeader.tsx          # Torn-edge-bottom hero banner for public pages
│   ├── AdminNav.tsx            # Fixed left sidebar for admin pages
│   └── MentorNav.tsx           # Minimal header for mentor layout
│
└── sections/                   # Page-level assembled sections (composed from ui/)
    ├── HomeClient.tsx           # Client wrapper for / — handles polling for home data
    ├── HeroSection.tsx          # Event name + Countdown
    ├── HappeningNowSection.tsx  # Current/next schedule item
    ├── PinnedNewsSection.tsx    # Pinned news posts (max 3)
    ├── QuickLinksSection.tsx    # Important links + WiFi card
    ├── ScheduleClient.tsx       # Client wrapper for /schedule — polling
    ├── ResourcesClient.tsx      # Client wrapper for /resources — polling
    ├── NewsClient.tsx           # Client wrapper for /news — polling
    ├── ProjectsClient.tsx       # Client wrapper for /projects — polling
    └── HelpForm.tsx             # Help request submission form (Client Component)
```

---

## `src/lib/` — Shared Utilities

```
src/lib/
├── prisma.ts                   # Prisma client singleton (Neon adapter)
├── auth.ts                     # checkAdminKey() helper for API route handlers
└── hooks/
    └── usePolling.ts           # Generic polling hook (fetcher + intervalMs)
```

---

## Configuration Files

### `next.config.ts`
```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Allow iframes from any origin to be displayed in ProjectCard
  // (iframeUrl is entered by admins, not user-submitted)
  // No additional image domains needed — imageUrl is an external URL in an <img> tag,
  // not processed by next/image.
}

export default nextConfig
```

### `tailwind.config.ts`
Must extend with all design tokens from `design/DESIGN.md`. Full extension spec is in `architecture/frontend-structure.md` under "Tailwind Config Extensions Required".

### `tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### `.env.example`
```
# Neon Postgres
DATABASE_URL=postgresql://user:pass@ep-xxx.eu-west-2.aws.neon.tech/neondb?sslmode=require
DIRECT_DATABASE_URL=postgresql://user:pass@ep-xxx.eu-west-2.aws.neon.tech/neondb?sslmode=require

# HTTP Basic Auth — page-level protection
ADMIN_USER=admin
ADMIN_PASS=changeme
MENTOR_USER=mentor
MENTOR_PASS=changeme

# API key — used by admin/mentor UI to authenticate mutating API calls
ADMIN_SECRET=changeme-long-random-string

# Exposed to browser for admin/mentor UI fetch calls
NEXT_PUBLIC_ADMIN_SECRET=changeme-long-random-string
```

---

## Middleware File Location

```
src/
└── middleware.ts               # MUST be at src/middleware.ts (Next.js convention)
```

The middleware file must NOT be inside `src/app/`. It lives at `src/middleware.ts`.

---

## File Naming Conventions

- Page files: `page.tsx` (Next.js convention)
- Route handler files: `route.ts` (Next.js convention)
- Layout files: `layout.tsx` (Next.js convention)
- Client Components: marked with `'use client'` directive at top of file
- Server Components: no directive (default in App Router)
- All components: PascalCase filename, e.g. `NewsCard.tsx`
- All utilities/hooks: camelCase filename, e.g. `usePolling.ts`
- All Tailwind class strings: written inline in JSX — no CSS modules, no `@apply` directives except in `globals.css` for the design-system utility classes
