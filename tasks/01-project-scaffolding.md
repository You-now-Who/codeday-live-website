# Task 01 — Project Scaffolding

## Goal
Bootstrap a working Next.js 14 App Router project with TypeScript, Tailwind CSS, and all required configuration files. At the end of this task, `npm run dev` must start without errors and `npm run build` must succeed on an empty app.

## Prerequisites
None. This is the first task.

## Files to Create

### `package.json`
```json
{
  "name": "codeday-live-website",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate deploy",
    "prisma:seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
  },
  "dependencies": {
    "next": "14.2.29",
    "react": "^18",
    "react-dom": "^18",
    "@prisma/client": "^5.22.0",
    "@prisma/adapter-neon": "^5.22.0",
    "@neondatabase/serverless": "^0.10.4"
  },
  "devDependencies": {
    "typescript": "^5",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "@types/node": "^20",
    "tailwindcss": "^3.4.17",
    "postcss": "^8",
    "autoprefixer": "^10",
    "prisma": "^5.22.0",
    "ts-node": "^10.9.2",
    "eslint": "^8",
    "eslint-config-next": "14.2.29"
  },
  "prisma": {
    "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
  }
}
```

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

### `next.config.mjs`
Note: Next.js 14 does not support `next.config.ts`. Use `.mjs` instead.
```js
/** @type {import('next').NextConfig} */
const nextConfig = {}

export default nextConfig
```

### `postcss.config.js`
```js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

### `tailwind.config.ts`
Extend with all design tokens from `architecture/frontend-structure.md`. The config must include:
- Custom colors: `primary`, `on-primary`, `secondary-fixed`, `on-secondary-fixed`, `surface`, `on-surface`, `error`, `outline`
- Custom fontFamily: `epilogue`, `grotesk`
- Custom boxShadow: `hard` (4px 4px 0px 0px rgba(0,0,0,1)), `hard-sm`, `hard-lg`
- borderRadius DEFAULT overridden to `'0px'`
- Content paths covering `./src/**/*.{js,ts,jsx,tsx,mdx}`

Full config:
```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
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
        epilogue: ['var(--font-epilogue)', 'sans-serif'],
        grotesk: ['var(--font-grotesk)', 'sans-serif'],
      },
      boxShadow: {
        'hard': '4px 4px 0px 0px rgba(0,0,0,1)',
        'hard-sm': '2px 2px 0px 0px rgba(0,0,0,1)',
        'hard-lg': '6px 6px 0px 0px rgba(0,0,0,1)',
      },
      borderRadius: {
        DEFAULT: '0px',
        none: '0px',
        sm: '0px',
        md: '0px',
        lg: '0px',
        xl: '0px',
        '2xl': '0px',
        full: '0px',
      },
    },
  },
  plugins: [],
}

export default config
```

### `.gitignore`
```
# dependencies
node_modules/

# next.js
.next/
out/

# env files
.env.local
.env.*.local

# prisma
prisma/migrations/

# misc
.DS_Store
*.pem
```

### `.env.example`
```
# Neon Postgres — get connection strings from the Neon dashboard
DATABASE_URL=postgresql://user:pass@ep-example.eu-west-2.aws.neon.tech/neondb?sslmode=require
DIRECT_DATABASE_URL=postgresql://user:pass@ep-example.eu-west-2.aws.neon.tech/neondb?sslmode=require

# HTTP Basic Auth credentials — set before the event, share with team
ADMIN_USER=your-admin-username
ADMIN_PASS=your-admin-password
MENTOR_USER=your-mentor-username
MENTOR_PASS=your-mentor-password

# API secret — generate with: openssl rand -hex 32
# Both variables must have the SAME value
ADMIN_SECRET=replace-with-32-byte-hex-string
NEXT_PUBLIC_ADMIN_SECRET=replace-with-32-byte-hex-string
```

### `src/app/layout.tsx`
Minimal root layout that loads Epilogue and Space Grotesk via `next/font/google` and applies `paper-grain` class to `<body>`. This is a placeholder — the full design system CSS is added in Task 10.

```typescript
import type { Metadata } from 'next'
import { Epilogue, Space_Grotesk } from 'next/font/google'
import './globals.css'

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

export const metadata: Metadata = {
  title: 'CodeDay London',
  description: 'CodeDay London event dashboard',
}

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

### `src/app/globals.css`
Minimal placeholder — just the Tailwind directives. Full design-system CSS is added in Task 10.
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### `src/app/(public)/page.tsx`
Minimal placeholder home page so the app has a route to render.
```typescript
export default function HomePage() {
  return (
    <main className="p-8">
      <h1 className="font-epilogue font-black text-4xl uppercase">CodeDay London</h1>
    </main>
  )
}
```

---

## Acceptance Criteria

- [ ] All config files exist at their specified paths
- [ ] `npm install` completes without errors
- [ ] `npm run dev` starts the dev server and `http://localhost:3000` returns a page showing "CodeDay London" in Epilogue font
- [ ] `npm run build` completes without TypeScript or lint errors
- [ ] `npm run lint` returns no errors
- [ ] `.env.local` is NOT present in git (confirm `.gitignore` is correct)

## Tests

### Manual Checks
```bash
# 1. Install dependencies
npm install

# 2. Verify dev server starts
npm run dev
# Open http://localhost:3000 — should show "CodeDay London" heading

# 3. Verify build passes
npm run build

# 4. Verify lint passes
npm run lint

# 5. Verify .gitignore works
git status
# .env.local should NOT appear even if it exists
```

### TypeScript Check
```bash
npx tsc --noEmit
# Must return with no errors
```

### Font Check
Open `http://localhost:3000` in browser. Open DevTools > Network tab > filter "font". Verify Epilogue is loaded (either from Google Fonts CDN or as a self-hosted asset from `/_next/static/media/`).
