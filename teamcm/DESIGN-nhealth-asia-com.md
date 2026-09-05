# Design System Inspired by N Health เอ็นเฮลท์

> Auto-extracted from `https://nhealth-asia.com/` on 2026-09-05

## 1. Visual Theme & Atmosphere

Friendly, approachable design with rounded shapes and generous whitespace.

**Key Characteristics:**
- Inter as the heading font
- db_helvethaica as the body font for all running text
- Light/white background (#ffffff) as the primary canvas
- Primary accent `#3d98f3` used for CTAs and brand highlights
- 3 shadow level(s) detected — tinted shadows
- Rounded corners (12px+) creating a friendly, approachable feel
- Tags: light, rounded, accented, compact, sans-serif

## 2. Color Palette & Roles

### Primary
- **Primary Accent** (`#3d98f3`) · `--color-primary`: Brand color, CTA backgrounds, link text, interactive highlights.
- **Secondary Accent** (`#00338d`) · `--color-secondary`: Secondary brand, hover states, complementary highlights.
- **Background** (`#ffffff`) · `--color-bg`: Page background, primary canvas.
- **Background Secondary** (`#e6ebf4`) · `--color-bg-secondary`: Cards, surfaces, alternating sections.

### Text
- **Text Primary** (`#000000`) · `--color-text`: Headings and body text.
- **Text Secondary** (`#666666`) · `--color-text-secondary`: Muted text, captions, placeholders.

### Borders & Surfaces
- **Border** (`#e6ebf4`) · `--color-border`: Dividers, outlines, input borders.

### Full Extracted Palette

| # | Hex | CSS Variable | Role | Area | Contrast |
|---|---|---|---|---|---|
| 1 | `#ffffff` | `--palette-1` | block | large | text-dark |
| 2 | `#e6ebf4` | `--palette-2` | block | large | text-dark |
| 3 | `#ffe8fd` | `--palette-3` | block | large | text-dark |
| 4 | `#eaf2eb` | `--palette-4` | block | large | text-dark |
| 5 | `#fdeaeb` | `--palette-5` | block | medium | text-dark |
| 6 | `#f6f6f6` | `--palette-6` | block | medium | text-dark |
| 7 | `#00338d` | `--palette-7` | button | medium | text-light |
| 8 | `#3d98f3` | `--palette-8` | text-accent | small | text-dark |

## 3. Typography Rules

- **Heading Font:** `Inter`, sans-serif
- **Body Font:** `db_helvethaica` (web font)

### Type Hierarchy

| Role | Font | Size | Weight | Line Height | Letter Spacing |
|---|---|---|---|---|---|
| Small | db_helvethaica | 21px | 600 | 30px | normal |

### Type Scale

| Token | Size | Suggested Usage |
|---|---|---|
| Display | `55.92px` | headings |
| H1 | `36px` | headings |
| H2 | `28.08px` | headings |
| H3 | `27.84px` | headings |
| H4 | `24px` | headings |
| Body L | `21px` | body / supporting text |
| Body | `16px` | body / supporting text |
| Small | `12px` | body / supporting text |

## 4. Component Stylings

### Primary Button

```css
.btn-primary {
  background: transparent;
  color: #000000;
  border-radius: 12px;
  padding: 0px 12px;
  font-size: 24px;
  font-weight: 400;
  border: none;
  cursor: pointer;
}
```

### Filled Button

```css
.btn-filled {
  background: #00338d;
  color: #ffffff;
  border-radius: 36px;
  padding: 0px 18px;
  font-size: 24px;
  font-weight: 700;
  border: none;
  cursor: pointer;
}
```

### Filled Button 2

```css
.btn-filled-2 {
  background: #ffffff;
  color: #000000;
  border-radius: 36px;
  padding: 0px 18px;
  font-size: 24px;
  font-weight: 700;
  border: 1px solid rgb(230, 235, 244);
  cursor: pointer;
}
```

### Ghost Button

```css
.btn-ghost {
  background: transparent;
  color: #3d98f3;
  border-radius: 0px;
  padding: 0px 0px;
  font-size: 16px;
  font-weight: 400;
  border: none;
  cursor: pointer;
}
```

### Filled Button 3

```css
.btn-filled-3 {
  background: #3d98f3;
  color: #ffffff;
  border-radius: 6px;
  padding: 0px 16px;
  font-size: 16px;
  font-weight: 600;
  border: 1px solid rgba(0, 0, 0, 0);
  cursor: pointer;
}
```

## 5. Layout Principles

- **Base spacing unit:** `6px` — use multiples (12px, 18px, 24px, etc.)

### Spacing Scale (extracted from real elements)

| Token | Value | Role |
|---|---|---|
| spacing-1 | `6px` | element |
| spacing-2 | `12px` | element |
| spacing-3 | `24px` | card |
| spacing-4 | `36px` | card |
| spacing-5 | `48px` | card |
| spacing-6 | `60px` | section |
| spacing-7 | `8px` | element |
| spacing-8 | `16px` | element |

### Border Radius Scale

| Token | Value | Element |
|---|---|---|
| radius-button | `12px` | button |
| radius-card | `24px` | card |
| radius-card | `36px` | card |
| radius-button | `6px` | button |
| radius-button | `9px` | button |
| radius-card | `18px` | card |

## 6. Depth & Elevation

| Level | Shadow | Usage |
|---|---|---|
| Low | `rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0...` | Cards, subtle elevation |
| Low | `rgba(97, 99, 102, 0.06) 0px 2px 4px -2px, rgba(97, 99, 102, 0.1) 0px 4px 8px -2p...` | Cards, subtle elevation |
| Mid | `rgba(0, 0, 0, 0.05) 0px 2px 8px 0px` | Dropdowns, popovers |

> **Note:** This site uses chromatic (color-tinted) shadows rather than pure black — this is a deliberate brand choice that adds warmth to elevation.

## 7. Do's and Don'ts

### Do
- Use `#ffffff` as the primary background color
- Use `Inter` for all headings and `db_helvethaica` for body text
- Use `#3d98f3` as the single dominant accent/CTA color
- Maintain `6px` as the base spacing unit — all gaps should be multiples
- Use rounded corners (`12px`+) consistently for all interactive elements
- Apply the shadow system for elevation — use the extracted shadow values

### Don't
- Don't use colors outside the extracted palette without justification
- Don't substitute Inter/db_helvethaica with generic alternatives
- Don't use irregular spacing — stick to 6px grid
- Don't use dark/black backgrounds — this is a light-themed design
- Don't use sharp corners — they feel hostile in this rounded design language
- Don't use oversized hero text — this brand uses restrained type
- Don't use pure black (#000000) for text — use `#000000` instead
- Don't add decorative elements not present in the original design — no badges, ribbons, banners, or ornaments unless the source site uses them
- Don't invent UI patterns the source site doesn't have — if the original has no NEW badge, don't add one just because a red is in the palette

## 8. Responsive Behavior

| Breakpoint | Width | Notes |
|---|---|---|
| Mobile | < 640px | Single column, stack sections, reduce font sizes ~80% |
| Tablet | 640–1024px | 2-column where appropriate, maintain spacing ratios |
| Desktop | 1024–1440px | Full layout as designed |
| Wide | > 1440px | Max-width container, center content |

- Touch targets: minimum 44×44px on mobile
- Maintain 6px base unit across breakpoints — only scale multipliers

## 9. Agent Prompt Guide

### Quick Color Reference

```
Background:  #ffffff
Text:        #000000
Accent:      #3d98f3
Secondary:   #00338d
Border:      #e6ebf4
```

### Example Prompts

1. "Build a hero section with a `#ffffff` background, `Inter` heading in `#000000`, and a `#3d98f3` CTA button with 36px radius."
2. "Create a pricing card using background `#e6ebf4`, border `#e6ebf4`, `db_helvethaica` for text, and 18px padding."
3. "Design a navigation bar — `#ffffff` background, `#000000` links, `#3d98f3` for active state."
4. "Build a feature grid with 3 columns, 18px gap, each card using the card component style."
5. "Create a footer with `#000000` background, `#ffffff` text, and 12px padding."

### Iteration Guide

1. Start with layout structure (sections, grid, spacing)
2. Apply colors from the palette — background first, then text, then accents
3. Set typography — font families, sizes from the type scale, weights
4. Add components — buttons, cards, inputs using the specs above
5. Apply border-radius consistently across all elements
6. Add shadows for depth — use the extracted shadow values, not defaults
7. Check responsive behavior — test mobile and tablet layouts
8. Final pass — verify all colors match, spacing is consistent, fonts are correct

## 10. CSS Custom Properties

> 20 custom properties extracted from `:root` / `html` stylesheets.

### Color Variables

| Variable | Value |
|---|---|
| `--color_dim_blue` | `#def3ff` |
| `--color_bg_secondary` | `#f7f9fc` |
| `--Colors-Border-border-primary` | `#e6ebf4` |
| `--swiper-theme-color` | `#007aff` |
| `--ck-color-image-caption-background` | `#f7f7f7` |
| `--ck-color-image-caption-text` | `#333` |
| `--ck-color-image-caption-highligted-background` | `#fd0` |
| `--ck-color-image-upload-icon` | `#fff` |
| `--ck-color-image-upload-icon-background` | `#008a00` |
| `--ck-color-upload-placeholder-loader` | `#b3b3b3` |

### Spacing Variables

| Variable | Value |
|---|---|
| `--nav_bar_height` | `5.5rem` |
| `--nav_bar_offset_height` | `-5.5rem` |
| `--ck-image-upload-icon-size` | `20` |
| `--ck-image-upload-icon-width` | `2px` |
| `--ck-upload-placeholder-loader-size` | `32px` |
| `--ck-upload-placeholder-image-aspect-ratio` | `2.8` |
| `--ck-image-style-spacing` | `1.5em` |
| `--swiper-navigation-size` | `44px` |

### Other Variables

| Variable | Value |
|---|---|
| `--ck-image-upload-icon-is-visible` | `clamp(0px, 100% - 50px, 1px)` |
| `--ck-inline-image-style-spacing` | `calc(var(--ck-image-style-spacing)/2)` |
