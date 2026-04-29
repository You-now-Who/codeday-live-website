# Tech Stack

| Layer | Technology | Version | Rationale |
|---|---|---|---|
| Framework | Next.js App Router | 14.x | Single deployment unit for both frontend pages and backend API route handlers. App Router enables per-route streaming and Server Components, reducing client JS bundle. |
| Language | TypeScript | 5.x | End-to-end type safety from Prisma-generated types through API response shapes to component props. Catches model mismatches at build time. |
| Styling | Tailwind CSS | 3.x | Utility classes map directly to the design token set (colors, typography, shadows). No CSS-in-JS runtime cost. Custom config encodes all design system values once. |
| ORM | Prisma | 5.x | Type-safe database client with auto-generated types that match the schema exactly. Migration system is simple for a solo-developer-style project. |
| Database | Neon Postgres (serverless) | latest | Serverless HTTP transport (`@neondatabase/serverless`) avoids the TCP connection pool exhaustion that standard Postgres drivers cause on Vercel's ephemeral functions. Free tier is sufficient for event scale. |
| Prisma DB Adapter | `@prisma/adapter-neon` | 5.x | Required to connect Prisma to Neon's HTTP driver. Enables Prisma queries inside Vercel Edge and Serverless Functions without connection pool issues. |
| Auth | Next.js Middleware (HTTP Basic Auth) | built-in | Zero-dependency auth for a two-role internal tool. No user table, no session store, no JWT library needed. Browser handles credential caching natively. |
| Deployment | Vercel | — | Zero-config Next.js hosting. Serverless functions, edge network, environment variables, preview deployments, and real-time logs all included. |
| Fonts | Google Fonts via `next/font/google` | built-in | `Epilogue` (headlines) and `Space Grotesk` (body). `next/font` self-hosts fonts at build time — no third-party font request at runtime, no layout shift. |
| Package Manager | npm | 10.x | Default; no workspace complexity needed for a single-package project. |

## Dependencies (production)

| Package | Purpose |
|---|---|
| `next` | Framework |
| `react`, `react-dom` | UI runtime |
| `typescript` | Type checking |
| `tailwindcss`, `postcss`, `autoprefixer` | Styling |
| `@prisma/client` | Database ORM client |
| `@prisma/adapter-neon` | Neon connection adapter for Prisma |
| `@neondatabase/serverless` | Neon HTTP transport driver |

## Dev Dependencies

| Package | Purpose |
|---|---|
| `prisma` | CLI for migrations and code generation |
| `ts-node` | Run `prisma/seed.ts` directly |
| `@types/react`, `@types/node` | TypeScript type definitions |
| `eslint`, `eslint-config-next` | Linting |

## Intentionally Excluded

| Excluded | Reason |
|---|---|
| React Query / SWR | Overkill for simple 30-second polling with `setInterval`. Adds bundle weight and API surface complexity. |
| NextAuth.js / Lucia | No user table, no OAuth needed. HTTP Basic Auth is sufficient for this internal tool. |
| Zustand / Redux | No global shared state beyond what polling hooks provide locally. |
| Shadcn/ui or Radix UI | The design system is heavily custom (punk zine aesthetic). Unstyled components would still require full re-theming. Build from scratch with Tailwind. |
| Docker | Target is Vercel serverless deployment. Local dev uses `next dev` + `.env.local`. Docker adds no value here. |
| WebSockets / SSE | 50–100 users, 30-second polling cadence. WebSocket infrastructure (Pusher, Ably, Supabase Realtime) would add cost and complexity with negligible UX improvement. |
