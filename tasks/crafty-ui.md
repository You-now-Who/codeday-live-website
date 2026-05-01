# Crafty UI Redesign — Branch: `crafty-ui`

## Design Direction

Transform the existing brutalist/newspaper aesthetic into an **arts & crafts scrapbook** aesthetic while keeping the exact same color palette (black `#000000`, white `#ffffff`, lime `#c3f400`) and overall page structure.

**Crafty feel means:**
- Pages look like a craft notebook / scrapbook / corkboard
- Elements look cut from paper, stuck with tape, pinned with thumbtacks
- Hand-drawn or stamped typography effects
- Graph-paper background instead of dot grid
- Washi tape strips (lime, semi-transparent) holding things together
- Sticky notes, index cards, library cards for content
- Organic/wobbly shapes instead of perfect rectangles
- SVG doodles: scissors, paperclips, push pins, stars, yarn, paint drops
- Soft paper drop-shadows instead of hard offset shadows
- Rubber-stamp feel for labels/badges

**What stays the same:**
- Exact color values (black, white, lime)
- Page layouts and routing
- All fonts (Epilogue + Grotesk)
- Component structure and props
- All existing functionality (auth, forms, data)

---

## Task 1 — `src/app/globals.css` — Crafty Foundation

Replace the dot-grid background and add a full suite of crafty utility classes.

### Background
Replace the dot-grid body background with a **graph paper** look: faint horizontal and vertical lines (like a composition notebook). Use `rgba(0,0,0,0.06)` lines at 24px spacing.

```css
body {
  background-image:
    linear-gradient(rgba(0,0,0,0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0,0,0,0.06) 1px, transparent 1px);
  background-size: 24px 24px;
}
```

### Torn edges
Keep `.torn-edge-bottom` and `.torn-edge-top` exactly as-is — they already feel crafty.

### New: `.tape` — Washi tape strip
Used as a decorative accent on cards. Produces a semi-transparent lime rectangle rotated slightly, simulating tape holding the card to the board.

```css
.tape {
  position: relative;
}
.tape::before {
  content: '';
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%) rotate(-2deg);
  width: 64px;
  height: 18px;
  background: rgba(195, 244, 0, 0.65);
  border-left: 1px solid rgba(0,0,0,0.08);
  border-right: 1px solid rgba(0,0,0,0.08);
  z-index: 1;
}
```

### New: `.tape-h` — horizontal tape variant (wider, flatter)
```css
.tape-h::before {
  width: 90px;
  height: 14px;
  top: -8px;
  transform: translateX(-50%) rotate(1deg);
}
```

### New: `.tape-corner` — tape in top-left corner (diagonal)
```css
.tape-corner::before {
  content: '';
  position: absolute;
  top: 8px;
  left: -12px;
  width: 48px;
  height: 14px;
  background: rgba(195, 244, 0, 0.7);
  transform: rotate(-45deg);
  z-index: 1;
}
```

### New: `.pin` — push-pin decoration (circle with shadow)
```css
.pin::after {
  content: '';
  position: absolute;
  top: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 14px;
  height: 14px;
  background: #000;
  border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
  box-shadow: 0 2px 4px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.3);
  z-index: 2;
}
```

### New: `.sketch-box` — organic/wobbly border using border-radius
Replaces hard rectangular borders with a slightly organic shape that looks hand-cut.
```css
.sketch-box {
  border-radius: 2px 4px 3px 2px / 3px 2px 4px 3px;
}
```

### New: `.sticky-note` — yellow-pad style card background
```css
.sticky-note {
  background: #fffde7;
  box-shadow: 2px 3px 8px rgba(0,0,0,0.12), 1px 1px 0 rgba(0,0,0,0.05);
  border-radius: 1px 3px 2px 1px / 2px 1px 3px 2px;
}
```

### New: `.index-card` — ruled-lines card background
Uses a repeating-linear-gradient to simulate lined paper.
```css
.index-card {
  background-image: repeating-linear-gradient(
    transparent,
    transparent 23px,
    rgba(0,0,0,0.07) 23px,
    rgba(0,0,0,0.07) 24px
  );
  background-color: #fafafa;
  border-radius: 1px 4px 2px 3px / 3px 2px 4px 1px;
}
```

### New: `.kraft` — kraft paper background color
```css
.kraft {
  background-color: #f5e6c8;
}
```

### New: `.highlighter` — lime marker highlight behind text
```css
.highlighter {
  background: linear-gradient(transparent 40%, rgba(195, 244, 0, 0.6) 40%);
  padding: 0 2px;
}
```

### New: `.stamp` — rubber stamp label look
High contrast, slight opacity drop, rough feel using filter.
```css
.stamp {
  display: inline-block;
  border: 2px solid currentColor;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  opacity: 0.85;
  transform: rotate(-1.5deg);
  mix-blend-mode: multiply;
}
```

### New: `.paper-clip` — decorative paper-clip pseudo on cards (adds visual clip at top-right)
```css
.paper-clip {
  position: relative;
}
.paper-clip::after {
  content: '';
  position: absolute;
  top: -4px;
  right: 20px;
  width: 6px;
  height: 28px;
  border: 2px solid rgba(0,0,0,0.3);
  border-radius: 3px;
  background: transparent;
  transform: rotate(8deg);
}
```

### Updated: `.btn-press`
Change the hover effect from straight translate to a stamp-like press with slight rotation:
```css
.btn-press {
  transition: transform 0.05s, box-shadow 0.05s;
}
.btn-press:hover {
  transform: translate(3px, 3px) rotate(0.3deg);
  box-shadow: none;
}
```

### Updated: `.card-lift`
Change lift effect to feel like paper peeling off a board:
```css
.card-lift {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.card-lift:hover {
  transform: translate(-3px, -4px) rotate(0.5deg);
  box-shadow: 5px 8px 16px rgba(0,0,0,0.15);
}
```

### Updated: `.offset-*` rotations — increase slightly for more collage feel
```css
.offset-1 { transform: rotate(-2deg) translate(-3px, 1px); }
.offset-2 { transform: rotate(1.5deg) translate(3px, -2px); }
.offset-3 { transform: rotate(-0.8deg) translate(1px, 3px); }
```

### New keyframes
```css
@keyframes stamp-appear {
  0%   { transform: scale(1.4) rotate(-3deg); opacity: 0; }
  60%  { transform: scale(0.95) rotate(-1deg); opacity: 1; }
  100% { transform: scale(1) rotate(-1.5deg); opacity: 0.85; }
}
@keyframes tape-stick {
  0%   { transform: translateX(-50%) rotate(-8deg) scaleY(0.3); opacity: 0; }
  100% { transform: translateX(-50%) rotate(-2deg) scaleY(1); opacity: 1; }
}
@keyframes peel {
  0%, 100% { transform: rotate(-1.5deg) translate(-2px, 1px); }
  50%       { transform: rotate(-1.8deg) translate(-3px, -1px); }
}

.animate-stamp-appear { animation: stamp-appear 0.35s ease both; }
.animate-peel         { animation: peel 3s ease-in-out infinite; }
```

---

## Task 2 — `tailwind.config.ts` — Crafty Extensions

Extend the Tailwind config to support crafty design tokens.

### Colors — add crafty aliases (same palette, new semantic names)
```ts
'kraft':       '#f5e6c8',
'tape-lime':   'rgba(195, 244, 0, 0.65)',
'sticky':      '#fffde7',
'pin-red':     '#e63946',
'paper':       '#fafafa',
```

### Box shadows — replace hard offset with paper/tape shadows
Keep the existing `hard`, `hard-sm`, `hard-lg` for backwards compat, AND add:
```ts
'paper':    '2px 3px 8px rgba(0,0,0,0.12)',
'paper-lg': '4px 6px 16px rgba(0,0,0,0.15)',
'tape':     'inset 0 0 0 1px rgba(0,0,0,0.06)',
'stamp':    '3px 3px 0 rgba(0,0,0,0.8)',
```

### Border radius — add organic variants
The global `0px` stays as the default (keep brutalist override), but add named organic ones to use explicitly:
```ts
'organic-sm':  '2px 4px 3px 2px / 3px 2px 4px 3px',
'organic':     '4px 8px 6px 4px / 6px 4px 8px 4px',
'organic-lg':  '8px 14px 10px 8px / 10px 8px 14px 10px',
'sticker':     '50% 45% 50% 48% / 48% 50% 45% 50%',
```

---

## Task 3 — `src/components/ui/PublicNav.tsx` — Washi Tape Tab Nav

Transform the sharp brutalist nav strip into a **washi tape tab** navigation.

### Concept
The nav bar looks like a strip of kraft paper with washi tape tabs sticking up/across. Each nav link is a tab that looks torn or cut from paper. The active tab is stuck down with a lime washi tape strip.

### Changes
- Nav container: `bg-[#f5e6c8]` (kraft) with `border-b-2 border-primary` — still sticky
- Logo area: The "CODEDAY" badge becomes a rubber-stamp look — black ink, slight rotation, monospace feel. Use `rotate-[-1deg]` and `mix-blend-mode: multiply`
- Nav links: Each is a small cut tab — use `sketch-box` class + subtle background. Default: `bg-paper border border-primary/20`. Active: `bg-secondary-fixed` with a tape strip pseudo (`tape` class via `before:`).
- Tabs have different slight rotations: alternate `rotate-[-0.5deg]` and `rotate-[0.3deg]` on hover, simulating slightly curled paper
- Add a small scissors SVG icon at the far-left edge of the nav (decorative, like a coupon cut line): `✂ ─ ─ ─` style in small text
- The profile/login button at right becomes a round sticky label — `rounded-sticker` style with lime background

### Implementation note
The slight rotation per tab can be done with CSS `nth-child` or by adding stagger classes. Keep the active highlight lime (`bg-secondary-fixed`). Transitions: `transition-all duration-150`.

---

## Task 4 — `src/components/sections/HeroSection.tsx` — Collage Hero

Total collage makeover of the hero section. This is the most dramatic change.

### Concept
The hero looks like a craft project laid out on a table — overlapping pieces of paper, washi tape, stickers, and hand-drawn doodles. The event name is on a large cut-paper shape stuck to the background with tape. The countdown timer is on a sticky note.

### Background
Keep `bg-secondary-fixed` (lime) with `torn-edge-bottom`. Add a subtle paper grain with `paper-grain` class on body (already in CSS).

### Event Name Block
Wrap `<h1>` in a white paper cut-out:
```tsx
<div className="relative inline-block bg-white border-2 border-primary shadow-paper-lg rotate-[-1.5deg] px-6 py-4 tape">
  <h1 className="font-epilogue font-black text-6xl uppercase tracking-tight leading-none text-primary">
    {config.eventName}
  </h1>
</div>
```
The `.tape` class will render a lime washi tape strip pseudo at the top of this block.

### Deadline Section
Put the countdown on a sticky note card:
```tsx
<div className="relative inline-block sticky-note border border-primary/20 px-5 py-4 mt-8 rotate-[1deg] pin">
  <p className="font-grotesk text-xs uppercase tracking-widest text-on-surface/60 mb-2">
    Submission Deadline
  </p>
  <Countdown targetDate={config.submissionDeadline} />
</div>
```
The `.pin` class renders a push-pin pseudo at the top.

### New SVG Doodles
Replace existing doodles with craft-specific ones:

1. **Scissors** (top-left, replacing the cross marks):
```tsx
<svg className="absolute top-4 left-4 opacity-30 pointer-events-none" width="44" height="20" viewBox="0 0 44 20" fill="none" stroke="#161e00" strokeWidth="1.5" aria-hidden>
  {/* Two circles (pivot points) */}
  <circle cx="8" cy="7" r="4" />
  <circle cx="8" cy="13" r="4" />
  {/* Blades */}
  <line x1="11" y1="5" x2="42" y2="2" />
  <line x1="11" y1="15" x2="42" y2="18" />
</svg>
```

2. **Yarn ball** (bottom-right, replacing stacked squares):
```tsx
<svg className="absolute bottom-16 right-8 opacity-20 animate-float-b pointer-events-none" width="52" height="52" viewBox="0 0 52 52" fill="none" stroke="#161e00" strokeWidth="1.5" aria-hidden>
  <circle cx="26" cy="26" r="22" />
  <path d="M8 18 Q26 8 44 18" />
  <path d="M6 26 Q26 36 46 26" />
  <path d="M8 34 Q26 44 44 34" />
  <path d="M16 6 Q8 26 16 46" />
  <path d="M26 4 Q36 26 26 48" />
</svg>
```

3. **Star sticker** (top-right, replacing spinning asterisk):
```tsx
<svg className="absolute top-6 right-12 opacity-25 animate-spin-slow pointer-events-none" width="40" height="40" viewBox="0 0 40 40" fill="#161e00" aria-hidden>
  <polygon points="20,2 24,15 38,15 27,23 31,37 20,29 9,37 13,23 2,15 16,15" />
</svg>
```

4. **Wavy cut line** (left side, decorative):
Keep the existing wavy SVG underline but make it a dotted cut line instead:
```tsx
<svg className="absolute left-8 opacity-15 pointer-events-none" style={{ top: '5rem' }} width="220" height="12" viewBox="0 0 220 12" fill="none" stroke="#161e00" strokeWidth="1.5" strokeDasharray="4 4" aria-hidden>
  <path d="M0 6 L220 6" />
</svg>
```

### Layout
Horizontal flex on md+: left side is the event name block, right side is the sticky note countdown. On mobile they stack.

---

## Task 5 — `src/components/ui/PageHeader.tsx` — Tape Banner Header

Transform the sharp header into a banner that looks like it's stuck on with tape.

### Changes
- Keep `bg-secondary-fixed torn-edge-bottom`
- Title: wrap in the same white cut-paper block from HeroSection — `bg-white border-2 border-primary shadow-paper rotate-[-1deg] px-5 py-3 tape inline-block`
- Subtitle (if present): render on a separate small sticky note below — `sticky-note px-3 py-2 text-xs font-grotesk mt-4 inline-block rotate-[0.5deg]`
- Replace corner marks SVG with a **paperclip** SVG in the top-right:
```tsx
<svg className="absolute top-4 right-6 opacity-30 pointer-events-none" width="16" height="36" viewBox="0 0 16 36" fill="none" stroke="#161e00" strokeWidth="2" strokeLinecap="round" aria-hidden>
  <path d="M8 2 C14 2 14 10 14 10 L14 28 C14 34 2 34 2 28 L2 8 C2 4 6 2 8 2 Z" />
  <line x1="8" y1="10" x2="8" y2="28" />
</svg>
```
- Add a small scissors doodle left side at 25% down (same as HeroSection scissors but smaller, opacity 15%)

---

## Task 6 — `src/components/ui/Button.tsx` — Rubber Stamp Buttons

### Concept
Buttons feel like rubber stamps — slightly rough edges, ink-like appearance.

### Changes
- `default` variant: `bg-white text-primary border-2 border-primary shadow-stamp btn-press sketch-box`
- `primary` variant: `bg-primary text-on-primary border-2 border-primary shadow-stamp btn-press sketch-box stamp`
- `accent` variant: `bg-secondary-fixed text-on-secondary-fixed border-2 border-primary shadow-stamp btn-press sketch-box`
- Add slight hover rotation: in globals.css, update `.btn-press:hover` to include `rotate(0.5deg)` (already specified in Task 1)
- Typography: keep Epilogue bold uppercase, add `tracking-wider` for stamp feel
- Optionally add a decorative border texture on `primary` variant — double border simulation using `outline: 1px solid rgba(0,0,0,0.3); outline-offset: 2px` on hover

---

## Task 7 — `src/components/ui/Chip.tsx` — Sticker Labels

### Concept
Chips look like hand-cut sticker labels — organic border radius, limey background, slight rotation.

### Changes
- Add `sketch-box` class (organic border radius)
- Remove the current `rotate-[-1deg]` from the class string — make it variable using a hash of the label text to alternate between `rotate-[-1.5deg]` and `rotate-[1deg]`
- Add `shadow-paper` instead of the implicit no-shadow
- Keep lime background (`bg-secondary-fixed text-on-secondary-fixed`)
- Border: keep `border border-primary` but reduce to 1px

### Implementation
Since Chip is a simple component, add a `getLabelRotation(label: string)` helper that returns one of `['rotate-[-1.5deg]', 'rotate-[1deg]', 'rotate-[-0.5deg]', 'rotate-[0.8deg]']` based on a hash.

---

## Task 8 — `src/components/ui/Input.tsx` — Handwritten Form Fields

### Concept
Form fields look like blank lines on a piece of lined craft paper — underline only, warm background.

### Changes
- Wrapper: add `relative` and a horizontal ruled line using `before:` pseudo as a bottom border decoration
- Label: `font-grotesk text-xs font-medium uppercase tracking-widest` — unchanged, but add `text-primary/70`
- Input: keep `border-0 border-b-2 border-primary` approach, but change focus style:
  - `focus:border-secondary-fixed` (lime underline on focus, like a highlighter mark)
  - Add `bg-transparent` explicitly
  - `caret-color: #c3f400` (lime cursor)
- Optionally add a small pencil icon at the right of the input on focus (CSS only via `after:` on wrapper with a ✏ character)

---

## Task 9 — `src/components/ui/NewsCard.tsx` — Sticky Note Cards

### Concept
News cards look like sticky notes pinned to a corkboard. Announcements are on lime sticky notes. Regular news is on off-white/paper sticky notes.

### Changes
- Remove `border-2 border-primary shadow-hard` from the card wrapper
- Add `tape` class (tape strip pseudo holding it to the board)
- For regular news: add `sticky-note` class (off-white, subtle drop shadow)
- For announcements: keep `bg-secondary-fixed`, add `shadow-paper-lg`, `sketch-box`
- PINNED badge: Transform into a thumbtack doodle — replace the black badge with a pin SVG inline:
  ```tsx
  <div className="flex items-center gap-1 mb-2">
    <svg width="10" height="14" viewBox="0 0 10 14" fill="currentColor" className="text-primary opacity-70">
      <ellipse cx="5" cy="4" rx="4" ry="4" />
      <rect x="4" y="7" width="2" height="7" rx="1" />
    </svg>
    <span className="font-grotesk text-xs text-primary/60 uppercase tracking-wider">pinned</span>
  </div>
  ```
- Card rotation: keep random rotation via `getRotation(id)`
- Card hover: replace `card-lift` effect — paper peeling from board: `translate(-2px, -5px) rotate(1deg)` with `shadow-paper-lg`
- Image: keep `dither` class, round the image corners slightly: add `sketch-box`
- Date: style as a small stamp at bottom of card: `stamp text-xs opacity-60`

---

## Task 10 — `src/components/ui/ProjectCard.tsx` — Index Cards

### Concept
Project cards look like library catalog / index cards with ruled lines, a hand-stamped team badge, and a corner dog-ear fold.

### Changes
- Remove `shadow-hard`, replace with `shadow-paper`
- Add `index-card` class to the article element (ruled lines background)
- Remove existing `ACCENT_CLASSES` (colored top/left borders) — replace with a washi tape strip at top: the lime tape now serves as the accent, always. Add `tape-h` to the article.
- Team badge (initials): make circular with `rounded-sticker` (`border-radius: 50% 45% 48% 50% / 50% 48% 45% 50%`) and `border-2 border-primary`
- Header divider: replace `border-b border-primary/10` with a dashed line: `border-b border-dashed border-primary/20`
- "Your project" banner: change from solid lime to lime washi tape look: remove separate div, use the `.tape` pseudo on the card itself
- Project name typography: keep Epilogue black but add `highlighter` class to make it feel hand-highlighted
- VIEW link: make it look like a rubber stamp button: add `sketch-box stamp` classes, hover lime bg (keep existing behavior)
- Corner dog-ear: CSS only — add to `.index-card::before`:
  ```css
  .index-card::before {
    content: '';
    position: absolute;
    bottom: 0;
    right: 0;
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 0 0 20px 20px;
    border-color: transparent transparent rgba(0,0,0,0.08) transparent;
  }
  ```
  Add this to globals.css.

---

## Task 11 — `src/components/ui/ResourceCard.tsx` — Library Pocket Cards

### Concept
Resource cards look like the paper pocket inside a library book — slightly textured, stamped category, pull-tab feel.

### Changes
- Replace `border-2 border-primary shadow-hard` with `border border-primary/30 shadow-paper index-card sketch-box`
- Category chip: move from top-right corner to a rubber-stamp position at top-left (before the title), styled with `stamp` class
- Title link: underline changes from `decoration-primary` to lime on hover: `hover:decoration-secondary-fixed hover:bg-transparent`
- Add a small **library card pocket** visual: a thin `border-b-2 border-primary/10 pb-2 mb-2` divider between category and title
- Description text: `font-grotesk text-sm text-on-surface` — unchanged, but add `mt-2 leading-relaxed`
- Overall: cards can be `tape-corner` variant (tape in corner instead of top-center)

---

## Task 12 — `src/components/ui/ScheduleCard.tsx` — Spiral Notebook Entries

### Concept
Schedule items look like entries torn from a spiral notebook — lined paper, time written in margin, title in main area.

### Changes
- Replace `border-2 border-primary` with a left-margin rule: `border-l-4 border-primary border border-primary/10`
- Current item (live): keep `bg-secondary-fixed` but add `tape` class (lime tape at top)
- Past items: keep `opacity-50`, change to `index-card`
- Upcoming items: `bg-paper border border-primary/10 shadow-paper`
- Time display: style the time as a margin notation — move it visually left with negative margin or padding trick, styled in `font-grotesk text-xs opacity-50 uppercase`
- LIVE NOW badge: transform into a rubber-stamp look: `stamp animate-stamp-appear border-2 border-primary bg-primary text-on-primary`
- Live dot: keep `animate-live-dot` — it's already crafty
- Location: add a small 📍 or custom SVG pin before the location text

---

## Task 13 — `src/components/ui/PostCard.tsx` — Torn Paper Post Cards

### Concept
Wall posts look like notes torn from a notebook and stuck to the wall.

### Changes
- Article wrapper: `bg-white shadow-paper sketch-box` — remove `border-2 border-primary shadow-hard`
- Add subtle torn-edge pseudo at bottom using a mini clip-path (3-4 tears, not full torn-edge-bottom):
  ```css
  /* Add to globals.css */
  .torn-bottom-sm {
    clip-path: polygon(
      0% 0%, 100% 0%, 100% 94%,
      95% 97%, 90% 93%, 85% 98%, 80% 94%,
      75% 99%, 70% 95%, 65% 100%, 60% 96%,
      55% 100%, 50% 95%, 45% 99%, 40% 94%,
      35% 98%, 30% 93%, 25% 97%, 20% 93%,
      15% 97%, 10% 93%, 5% 97%, 0% 94%
    );
  }
  ```
  Apply `torn-bottom-sm` to the article.
- Author badge: circular with `rounded-sticker` (organic border-radius)
- Reaction buttons: round and sticker-like: `sketch-box` on each reaction button
- Add reaction button hover: `hover:bg-secondary-fixed hover:text-on-secondary-fixed hover:border-secondary-fixed`
- Comment input: look like a torn notepad input — `border-0 border-b-2 border-secondary-fixed bg-transparent focus:outline-none`
- Post comment button: `stamp sketch-box` styling

---

## Task 14 — `src/components/sections/Footer.tsx` — Craft Bunting Footer

### Concept
Footer looks like a craft project sign-off — kraft paper background with a decorative bunting/banner at the top.

### Changes
- Footer background: `bg-primary` → `bg-[#f5e6c8]` (kraft) with `text-primary border-t-4 border-primary`
- Add a bunting banner SVG at the very top of the footer (decorative triangular flags):
  ```tsx
  <div className="w-full overflow-hidden h-6 flex items-end gap-0" aria-hidden>
    {Array.from({ length: 20 }).map((_, i) => (
      <div
        key={i}
        className="flex-1 h-5"
        style={{
          background: i % 3 === 0 ? '#000' : i % 3 === 1 ? '#c3f400' : '#fff',
          clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
          border: '1px solid rgba(0,0,0,0.15)'
        }}
      />
    ))}
  </div>
  ```
- Branding: "CODEDAY" badge — keep lime stamp look, add `stamp animate-peel`
- "London 2026" subtitle: kraft color `text-primary/50`
- Contact links: style as hand-written-feel text: `font-grotesk text-sm text-primary/60 hover:text-primary underline decoration-dotted decoration-primary/30 hover:decoration-primary`
- All link icons (✉ ◎ ⊛ ↗): replace with small inline SVG craft icons:
  - ✉ → envelope SVG (hand-drawn style)
  - ◎ → phone SVG
  - ⊛ → Discord bubble SVG
  - ↗ → arrow SVG

---

## Task 15 — `src/components/ui/PublicShell.tsx` — Corkboard Background

If `PublicShell` wraps the main content area, add a subtle warm tint to the content wrapper to simulate a corkboard / craft table surface. Check the file first — only change the `main` or content wrapper class, not the nav/footer wrappers.

Add `bg-[#fdfcf9]` (very slight warm white) to the content area to differentiate it from the pure white graph paper body.

---

## Implementation Order

Work through tasks in this order (each can be started once the previous is done):

1. Task 1 (globals.css) — all new classes available for everything else
2. Task 2 (tailwind.config.ts) — new tokens available
3. Task 6 (Button) — simple, no deps
4. Task 7 (Chip) — simple, no deps
5. Task 8 (Input) — simple, no deps
6. Task 3 (PublicNav) — uses button styles
7. Task 4 (HeroSection) — uses tape/pin classes
8. Task 5 (PageHeader) — shares pattern with HeroSection
9. Task 9 (NewsCard) — uses Chip, tape, pin
10. Task 10 (ProjectCard) — uses index-card, tape
11. Task 11 (ResourceCard) — uses Chip, sketch-box
12. Task 12 (ScheduleCard) — uses stamp, tape
13. Task 13 (PostCard) — uses torn-bottom-sm, sketch-box
14. Task 14 (Footer) — standalone
15. Task 15 (PublicShell) — standalone, minimal

---

## Acceptance Criteria

- All colors remain exactly: black `#000000`, white `#ffffff`, lime `#c3f400`
- No new npm packages needed — pure CSS/Tailwind/inline SVG
- All existing props, types, and API calls unchanged
- Dev server (`npm run dev`) starts with no TypeScript errors
- Pages that look obviously crafty: home hero, schedule, news, wall, projects, resources
- The admin panel (`/admin/*`) is **not in scope** — skip any admin components
- The mentor panel (`/mentor/*`) is **not in scope** — skip mentor components
