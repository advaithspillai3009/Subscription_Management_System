---
name: Studio Minimalist System
colors:
  surface: '#f8faf9'
  surface-dim: '#d9dad9'
  surface-bright: '#f8faf9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f3'
  surface-container: '#edeeed'
  surface-container-high: '#e7e8e7'
  surface-container-highest: '#e1e3e2'
  on-surface: '#191c1c'
  on-surface-variant: '#434848'
  inverse-surface: '#2e3131'
  inverse-on-surface: '#f0f1f0'
  outline: '#737878'
  outline-variant: '#c3c7c8'
  surface-tint: '#586061'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#161d1e'
  on-primary-container: '#7e8586'
  inverse-primary: '#c1c8c9'
  secondary: '#186a5e'
  on-secondary: '#ffffff'
  secondary-container: '#a6f1e2'
  on-secondary-container: '#217064'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#111e1f'
  on-tertiary-container: '#788687'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dde4e5'
  primary-fixed-dim: '#c1c8c9'
  on-primary-fixed: '#161d1e'
  on-primary-fixed-variant: '#414849'
  secondary-fixed: '#a6f1e2'
  secondary-fixed-dim: '#8ad4c6'
  on-secondary-fixed: '#00201b'
  on-secondary-fixed-variant: '#005047'
  tertiary-fixed: '#d7e5e6'
  tertiary-fixed-dim: '#bbc9ca'
  on-tertiary-fixed: '#111e1f'
  on-tertiary-fixed-variant: '#3c494a'
  background: '#f8faf9'
  on-background: '#191c1c'
  surface-variant: '#e1e3e2'
typography:
  display-hero:
    fontFamily: Space Grotesk
    fontSize: 64px
    fontWeight: '700'
    lineHeight: 72px
    letterSpacing: -0.03em
  display-hero-mobile:
    fontFamily: Space Grotesk
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 46px
    letterSpacing: -0.025em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 44px
    fontWeight: '700'
    lineHeight: 52px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Space Grotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
    letterSpacing: -0.01em
  body-md:
    fontFamily: Space Grotesk
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0em
  body-sm:
    fontFamily: Space Grotesk
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  label-code:
    fontFamily: Space Grotesk
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.12em
  label-nav:
    fontFamily: Space Grotesk
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-btn:
    fontFamily: Space Grotesk
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.02em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 2rem
  margin: 3rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system embodies a Tokyo studio aesthetic: calm, hyper-considered, tactile, and editorial. It merges Japanese minimalist craftsmanship with precise creative engineering.

The brand targets product designers, creative directors, software engineers, and discerning digital audiences who appreciate micro-details, typographic restraint, and organic calmness. The emotional response is intentional serenity—clean, grounded, free from digital noise, and anchored in deliberate analog-digital balance.

Key stylistic pillars:
- **Calm Warm Minimalism:** A tranquil, off-white canvas paired with botanical-mineral undertones rather than clinical, stark gray neutrals.
- **Editorial Precision:** Strict typographic rhythm, wide tracking on micro-labels, and monospaced catalog markers (`OBJECT NO. 001`, geographical coordinates).
- **Subtle Organic Accents:** Deep seafoam sage applied sparingly to vital focal points, status lights, and statement typography.

## Colors

The palette is tuned around studio light warmth and soft forest-mineral hues:

- **Primary Canvas & Backgrounds:**
  - Base canvas: `#fbfcfb` (studio warm paper)
  - Surface muted container: `#f2f5f3` (soft sage-tinted off-white for media cards, inset wells, and image frames)
  - Ghost border / Outline: `#e2e8e5` (whisper-soft structural boundary lines)

- **Ink & Typography:**
  - Primary ink: `#12191a` (deep charcoal near-black, providing warm ink contrast without harsh digital pitch black)
  - Metadata / Secondary text: `#667475` (muted sage-gray for subtitles, metadata labels, and body descriptions)
  - Subtle / Tertiary text: `#8c9a99` (low-emphasis timestamps, coordinates, and subtle footnotes)

- **Accents:**
  - Primary Accent: `#2b786c` (deep seafoam/sage teal for high-emphasis headlines, active indicators, and focal moments)
  - Accent Tint: `#e8f2ef` (subtle interactive hovers and badge backgrounds)
  - Status Indicator: `#327f73` (live availability dot and active nav indicator)

## Typography

Typography is set exclusively in **Space Grotesk** across headlines, running text, and utilitarian tracking labels. This creates a technical yet human studio presence.

- **Tracking Rules:**
  - Micro-metadata (`label-code`) uses uppercase styling with expanded letter spacing (`+0.12em`) to mimic architectural blueprint notes and archival indexing.
  - Large display headings enforce tightened tracking (`-0.02em` to `-0.03em`) for a confident, compact visual lockup.
- **Accents:** Key phrases within display headings (e.g., "feel right.") switch to the primary accent color (`#2b786c`) without altering weight or font family.

## Layout & Spacing

The layout is built around a wide, breathable studio split grid:

- **Grid Architecture:** 12-column layout on desktop with a maximum canvas width of `1440px`. Two primary operational columns split the viewport evenly:
  - Left column: Editorial hero messaging, introduction text, action triggers, and live status.
  - Right column: Showcase showcase container (`#f2f5f3`) featuring analog/digital artifacts framed with precise metadata headers.
- **Responsive Adaptations:**
  - Desktop (>1024px): 2-column split with `3rem` canvas margins and generous `2.5rem` section spacing.
  - Tablet (768px - 1023px): Stacked flow with `2rem` margins, showcase card occupying full width below header intro.
  - Mobile (<768px): Single column, `1.25rem` horizontal margins, streamlined display scaling (`display-hero-mobile`), and simplified horizontal navigation.

## Elevation & Depth

This system avoids layered shadows, floating elevations, and heavy blur filters. Depth is established through flat surface color shifts and crisp boundaries:

- **Surface Nesting:** Base `#fbfcfb` layered with inset containers (`#f2f5f3`) provides grounding without shadow blur.
- **Low-Contrast Outlines:** Inset panels and interactive pills use hairline borders (`1px solid #e2e8e5`) that define boundaries subtly without visual heaviness.
- **Object Grounding:** Interactive product mockups within containers utilize ultra-soft, diffused ambient contact drop-shadows (`0 20px 40px -15px rgba(18, 25, 26, 0.12)`) to give the physical impression of resting upon a photographer's light table.

## Shapes

The design uses a restrained, soft geometric radius language (`roundedness: 1`):

- **Interactive Primary Elements:** Buttons and active cards use small, disciplined `4px` to `6px` (`rounded-sm`) corner rounding.
- **Showcase Containers:** Display frames feature `8px` (`rounded-md`) rounding to maintain an architectural frame aesthetic.
- **Micro Elements:** Status dots, cassette reel cutouts, and active tab indicator dots retain strict full circular rounding (`rounded-full`).

## Components

### Buttons
- **Primary Action Button:**
  - Background: Solid near-black `#12191a`
  - Text: `#ffffff` in `label-btn`
  - Icon: Inline diagonal arrow (`↗`) or link glyph
  - Padding: `12px 22px`
  - Border-radius: `6px`
  - Hover state: Background subtly shifts to `#232f30` with slight translate-up transition.
- **Secondary / Link Action:**
  - Background: Transparent
  - Text: `#12191a` with paired inline arrow icon (`→`)
  - Hover state: Text transitions to `#2b786c` with icon nudging `3px` horizontally.

### Status Indicators
- **Studio Availability Dot:**
  - Outer: `6px` solid circle with background `#327f73`
  - Text: `body-sm` in `#667475` ("Available for select collaborations")
  - Alignment: Inline flex with `8px` gap.

### Navigation Header
- **Top Navigation Bar:**
  - Transparent or semi-translucent background (`rgba(251, 252, 251, 0.9)` with backdrop-filter `blur(8px)`).
  - Brand Mark: `Space Grotesk` medium (`haru / studio`) with registered symbol.
  - Links: Muted slate `#667475`, transitioning to `#12191a` on hover.
  - Active Link: `#12191a` with a small `3px` teal dot (`#2b786c`) centered beneath the item.
  - Mode Switcher: Miniature rounded pill containing analog icon and mode label.

### Showcase Card
- **Frame:**
  - Background: `#f2f5f3`
  - Border: `1px solid #dfe5e2`
  - Padding: `24px` to `32px`
  - Header & Footer Metadata: `Space Grotesk` uppercase (`label-code`) in `#667475` providing catalog numbers (`OBJECT NO. 001`), coordinates (`35°40' N 139°45' E`), and interactive hints (`HOVER TO EXPLORE`).