# Task 10 — globals.css + Tailwind Config

## Goal
Implement the full design system: all custom CSS classes in `globals.css` and all custom tokens in `tailwind.config.ts`. After this task, all design system utility classes (`torn-edge-top`, `torn-edge-bottom`, `dither`, `paper-grain`, `btn-press`, `offset-1/2/3`, `hand-draw-circle`, `shadow-hard`, etc.) work correctly in the browser.

## Prerequisites
- Task 01 complete (Tailwind installed, `globals.css` exists as placeholder)

---

## Files to Modify

### `tailwind.config.ts`
Replace the placeholder from Task 01 with the full config (already specified in Task 01 — verify it's correct):

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

### `src/app/globals.css`
Replace the placeholder with the full design system CSS:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* ─── Torn paper edges ─────────────────────────────────────────────────────── */

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

/* ─── High-contrast dither effect ──────────────────────────────────────────── */

.dither {
  filter: contrast(1.8) grayscale(1) brightness(1.1);
}

/* ─── Paper grain overlay (applied to <body>) ───────────────────────────────── */

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

/* ─── Button press effect ───────────────────────────────────────────────────── */

.btn-press {
  transition: transform 0.05s, box-shadow 0.05s;
}

.btn-press:hover {
  transform: translate(4px, 4px);
  box-shadow: none;
}

/* ─── Collage offset rotations ──────────────────────────────────────────────── */

.offset-1 { transform: rotate(-1.5deg) translate(-2px, 1px); }
.offset-2 { transform: rotate(1deg) translate(2px, -1px); }
.offset-3 { transform: rotate(-0.5deg) translate(1px, 2px); }

/* ─── Hand-drawn circle for icon buttons ────────────────────────────────────── */

.hand-draw-circle {
  border-radius: 50% 45% 48% 50% / 50% 48% 45% 50%;
  border: 2px solid black;
}
```

---

## Acceptance Criteria

- [ ] `tailwind.config.ts` has all custom colors: `primary`, `on-primary`, `secondary-fixed`, `on-secondary-fixed`, `surface`, `on-surface`, `error`, `outline`
- [ ] `tailwind.config.ts` has custom fonts: `font-epilogue` and `font-grotesk` map to CSS variables
- [ ] `tailwind.config.ts` has custom shadows: `shadow-hard`, `shadow-hard-sm`, `shadow-hard-lg`
- [ ] `tailwind.config.ts` overrides all `borderRadius` to `0px`
- [ ] `globals.css` contains `.torn-edge-bottom` and `.torn-edge-top` clip-path rules
- [ ] `globals.css` contains `.dither` filter rule
- [ ] `globals.css` contains `.paper-grain::after` SVG noise overlay
- [ ] `globals.css` contains `.btn-press` and `.btn-press:hover` transition rules
- [ ] `globals.css` contains `.offset-1`, `.offset-2`, `.offset-3` rotation transforms
- [ ] `globals.css` contains `.hand-draw-circle` irregular border-radius rule

---

## Tests

### Visual Tests — open the browser dev server

```bash
npm run dev
```

Create a temporary test page at `src/app/test-design/page.tsx` to visually verify each class (delete after testing):

```typescript
export default function DesignTestPage() {
  return (
    <div className="p-8 space-y-8 bg-surface">

      {/* Typography */}
      <h1 className="font-epilogue font-black text-4xl uppercase tracking-tight leading-none">
        Epilogue Black
      </h1>
      <p className="font-grotesk text-base">Space Grotesk body text</p>

      {/* Colors */}
      <div className="flex gap-4">
        <div className="w-16 h-16 bg-primary border-2 border-primary" />
        <div className="w-16 h-16 bg-secondary-fixed border-2 border-primary" />
        <div className="w-16 h-16 bg-surface border-2 border-primary" />
        <div className="w-16 h-16 bg-error border-2 border-primary" />
      </div>

      {/* Shadows */}
      <div className="flex gap-8">
        <div className="w-24 h-24 bg-white border-2 border-primary shadow-hard" />
        <div className="w-24 h-24 bg-white border-2 border-primary shadow-hard-sm" />
        <div className="w-24 h-24 bg-white border-2 border-primary shadow-hard-lg" />
      </div>

      {/* Border radius — should be 0 (square corners) */}
      <div className="w-24 h-24 bg-secondary-fixed border-2 border-primary rounded-xl shadow-hard">
        No rounding
      </div>

      {/* Torn edges */}
      <div className="bg-primary text-on-primary p-8 pb-16 torn-edge-bottom">
        Torn bottom edge
      </div>
      <div className="bg-secondary-fixed text-on-secondary-fixed p-8 pt-16 torn-edge-top mt-8">
        Torn top edge
      </div>

      {/* Button press */}
      <button className="border-2 border-primary bg-white px-6 py-3 font-epilogue font-bold uppercase shadow-hard btn-press">
        Press Me
      </button>

      {/* Offset rotations */}
      <div className="flex gap-8">
        <div className="w-24 h-24 bg-white border-2 border-primary shadow-hard offset-1 p-2 text-xs">offset-1</div>
        <div className="w-24 h-24 bg-white border-2 border-primary shadow-hard offset-2 p-2 text-xs">offset-2</div>
        <div className="w-24 h-24 bg-white border-2 border-primary shadow-hard offset-3 p-2 text-xs">offset-3</div>
      </div>

      {/* Dither filter */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="https://picsum.photos/300/200"
        alt="dither test"
        className="dither w-72"
      />
    </div>
  )
}
```

Open `http://localhost:3000/test-design` and verify:
- [ ] "Epilogue Black" text uses Epilogue font, heavy weight, uppercase
- [ ] "Space Grotesk body text" uses Space Grotesk font
- [ ] Four color swatches: black, yellow-green (#c3f400), light grey (#f9f9f9), red (#ba1a1a)
- [ ] Three shadow boxes: hard 4px, 2px, 6px — all opaque black, no blur
- [ ] "No rounding" div has perfectly square corners even with `rounded-xl` class
- [ ] Torn-bottom div has jagged/torn lower edge
- [ ] Torn-top div has jagged/torn upper edge
- [ ] "Press Me" button shifts 4px right+down on hover (no shadow when hovered)
- [ ] Offset divs have slight rotations
- [ ] Image appears high-contrast black-and-white

### CSS Build Check
```bash
npm run build
# Must succeed with no CSS errors
npx tsc --noEmit
# Must succeed with no type errors
```
