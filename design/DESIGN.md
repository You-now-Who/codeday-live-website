---
name: High-Contrast DIY
colors:
  surface: '#f9f9f9'
  surface-dim: '#dadada'
  surface-bright: '#f9f9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f3'
  surface-container: '#eeeeee'
  surface-container-high: '#e8e8e8'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1b1b1b'
  on-surface-variant: '#4c4546'
  inverse-surface: '#303030'
  inverse-on-surface: '#f1f1f1'
  outline: '#7e7576'
  outline-variant: '#cfc4c5'
  surface-tint: '#5e5e5e'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#1b1b1b'
  on-primary-container: '#848484'
  inverse-primary: '#c6c6c6'
  secondary: '#506600'
  on-secondary: '#ffffff'
  secondary-container: '#c1f100'
  on-secondary-container: '#546b00'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#1a1c1c'
  on-tertiary-container: '#838484'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2e2e2'
  primary-fixed-dim: '#c6c6c6'
  on-primary-fixed: '#1b1b1b'
  on-primary-fixed-variant: '#474747'
  secondary-fixed: '#c3f400'
  secondary-fixed-dim: '#abd600'
  on-secondary-fixed: '#161e00'
  on-secondary-fixed-variant: '#3c4d00'
  tertiary-fixed: '#e2e2e2'
  tertiary-fixed-dim: '#c6c6c7'
  on-tertiary-fixed: '#1a1c1c'
  on-tertiary-fixed-variant: '#454747'
  background: '#f9f9f9'
  on-background: '#1b1b1b'
  surface-variant: '#e2e2e2'
typography:
  headline-xl:
    fontFamily: Epilogue
    fontSize: 4.5rem
    fontWeight: '900'
    lineHeight: '0.9'
    letterSpacing: -0.05em
  headline-lg:
    fontFamily: Epilogue
    fontSize: 2.5rem
    fontWeight: '800'
    lineHeight: '1.0'
    letterSpacing: -0.02em
  body-md:
    fontFamily: Space Grotesk
    fontSize: 1rem
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: -0.01em
  mono-sm:
    fontFamily: Space Grotesk
    fontSize: 0.875rem
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: 0.05em
  stamp-lg:
    fontFamily: Epilogue
    fontSize: 1.25rem
    fontWeight: '700'
    lineHeight: '1'
spacing:
  unit: 4px
  gutter: 1.5rem
  margin-edge: 2rem
  offset-shift: 8px
---

## Brand & Style
This design system captures the raw, analog energy of underground press and DIY punk culture. It prioritizes a "cut-and-paste" aesthetic over digital perfection, targeting a rebellious, creative audience that values authenticity over corporate polish. 

The visual style is a hybrid of **Brutalism** and **Tactile** design. It utilizes high-contrast dithered imagery, simulated photocopy artifacts, and intentional imperfections to evoke the tactile sensation of a physical zine. The emotional response is one of urgency, grassroots activism, and unfiltered expression—feeling less like a software interface and more like a flyer stapled to a brick wall.

## Colors
The palette is restricted to a high-contrast, three-color economy. 
- **Primary:** Pure black (#000000) for all heavy ink effects, borders, and primary text.
- **Secondary:** Highlighter Yellow (#ccff00) used sparingly for emphasis, call-to-action backgrounds, and "marker" highlights over text.
- **Neutral:** Pure white (#ffffff) serves as the "paper" base, though it should often be treated with a subtle grain or "dirty photocopy" texture in large surface areas.

Avoid gradients or soft transitions. Color application should feel binary—either ink is there, or it isn't.

## Typography
The typography strategy mimics the eclectic mix of a manual typewriter and bold newspaper clippings. 

- **Headlines:** Use **Epilogue** in its heaviest weights. Tighten letter spacing and line height until characters nearly touch. Headlines should be set in all-caps for maximum impact.
- **Body:** Use **Space Grotesk** for its technical, slightly "off-beat" geometric qualities. It provides readability while maintaining a monospaced-adjacent aesthetic.
- **Speciality Styles:** Apply "handwritten" or "stamped" effects to labels by rotating text blocks between -2 and 2 degrees. Use an irregular strike-through or underline using the secondary accent color to mimic marker highlights.

## Layout & Spacing
This design system rejects the standard 12-column symmetry in favor of an **Asymmetric, Contextual Grid**. 

- **The Offset:** Elements should rarely align perfectly. Use the `offset-shift` variable to push containers slightly out of their expected alignment. 
- **Layering:** Content blocks should overlap. A text container might partially obscure the corner of a dithered image, held in place by a "tape" graphic.
- **Rhythm:** Use a baseline unit of 4px, but vary padding within components to create a "hand-cut" feel. For example, a card might have 20px padding on the left and 28px on the right.

## Elevation & Depth
Depth is conveyed through **Physical Layering** rather than lighting and shadows.
- **Stacking:** Use heavy, 100% opaque black drop shadows (offset 4px to 8px) to make elements pop. Do not use blurs.
- **Torn Edges:** Instead of standard containers, use masks that simulate torn paper edges on the top or bottom of surfaces.
- **Visual Noise:** Use dithered gradients and bitmap textures to create "dirt" on the background layers, separating the foreground "clippings" from the base "lamppost" surface.

## Shapes
The shape language is strictly **Sharp and Irregular**. 
- **Corners:** Use 0px roundedness for all containers. 
- **Hand-drawn Elements:** UI controls like radio buttons or checkboxes should use SVG paths that look like hand-drawn circles or "X" marks. 
- **Borders:** Borders should be thick (2px - 4px) and occasionally use a "distressed" stroke or a "scanned-in" texture rather than a clean vector line.

## Components
- **Buttons:** Rectangular with a heavy 4px black border and a 4px hard shadow. On hover, the shadow disappears and the button shifts position to "press" down. Use a "hand-drawn circle" around icon buttons.
- **Cards:** Use a "torn paper" CSS mask on at least one edge. The background is white with black text; an "important" card may use the highlighter yellow background with black text.
- **Inputs:** Simple black bottom-border only. Labels are set in small-caps mono-font, looking like a label-maker strip.
- **Chips/Tags:** Look like pieces of masking tape. Use a slight rotation and a "jagged" edge on the left and right sides.
- **Images:** All images must be processed through a high-contrast 1-bit dither filter (black and white pixels only, no grays).
- **Navigation:** Vertical, "stapled" to the left edge of the screen, using bold headlines and occasional "stamped" icons.