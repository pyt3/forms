---
name: QualityLabHub
description: A calm, reliable register for daily laboratory quality work and monthly reporting.
colors:
  primary: "#2563eb"
  primary-strong: "#1d4ed8"
  primary-soft: "#dbeafe"
  neutral-bg: "#f8fafc"
  surface: "#ffffff"
  surface-muted: "#eef2f7"
  border: "#d7deea"
  border-strong: "#cbd5e1"
  text: "#0f172a"
  text-muted: "#64748b"
  text-supporting: "#475569"
  print-ink: "#000000"
  success: "#0f9f75"
  success-soft: "#d1fae5"
  warning: "#d97706"
  warning-soft: "#fef3c7"
  danger: "#dc2626"
  danger-soft: "#fee2e2"
  info: "#0284c7"
  info-soft: "#e0f2fe"
  focus: "#0f766e"
  signature-ink: "#1e3a8a"
typography:
  headline:
    fontFamily: "Noto Sans Thai, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.35
  title:
    fontFamily: "Noto Sans Thai, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.4
  body:
    fontFamily: "Noto Sans Thai, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Noto Sans Thai, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.45
  supporting:
    fontFamily: "Noto Sans Thai, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 500
    lineHeight: 1.45
  caption:
    fontFamily: "Noto Sans Thai, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.4
  micro:
    fontFamily: "Noto Sans Thai, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 500
    lineHeight: 1.35
  signature:
    fontFamily: "Sarabun, Noto Sans Thai, sans-serif"
    fontSize: "2rem"
    fontWeight: 600
    lineHeight: 1.2
rounded:
  control: "8px"
  action: "12px"
  print-control: "10px"
  surface: "16px"
  pill: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    typography: "{typography.label}"
    rounded: "{rounded.action}"
    padding: "8px 32px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.primary-strong}"
    textColor: "{colors.surface}"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "8px 16px"
    height: "44px"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.surface}"
    padding: "24px"
---

# Design System: QualityLabHub

## Overview

**Creative North Star: "The Calm Lab Register"**

QualityLabHub should feel like the best maintained instrument on the laboratory bench: precise, calm, and immediately understandable. Visual design serves rapid daily entry and trustworthy review; it never competes with the controlled information users must record.

The system uses familiar product patterns, restrained blue emphasis, quiet neutral layers, and compact Thai typography. It explicitly rejects a plain internal form that feels bare, hard to scan, or unfinished, while also rejecting decorative complexity that slows routine work.

**Key Characteristics:**

- Task-first hierarchy with one obvious primary action.
- Restrained color reserved for interaction, record type, and status.
- Structural responsive behavior: tables become cards and navigation adapts by breakpoint.
- Forgiving validation, accessible focus, and explicit loading or error feedback.

**The Current Task Rule.** Show only the information required for the current task; progressive disclosure carries the rest.

## Colors

The palette is a clinical cool-neutral field with confident blue interaction and explicit semantic states.

### Primary

- **Instrument Blue:** The primary action, current navigation state, and high-confidence interactive emphasis.
- **Deep Instrument Blue:** Hover and active treatment for primary actions.
- **Washed Instrument Blue:** Low-emphasis selected or informational surfaces.

### Secondary

- **Verified Green:** Successful results and IQC identity where category distinction matters.
- **Measured Amber:** Pending work and edit affordances.
- **Corrective Red:** Validation, failed quality checks, and destructive actions.
- **Report Cyan:** Informational and export-related states.

### Neutral

- **Bench White:** Main working surfaces and controls.
- **Cool Worktop:** Application background and secondary panels.
- **Graphite Ink:** Primary content and headings.
- **Slate Annotation:** Supporting labels and metadata; never use it below AA contrast.
- **Instrument Line:** Default borders and dividers.

**The Ten Percent Rule.** Saturated accent color must occupy no more than roughly ten percent of a normal task screen.

**The Semantic Color Rule.** Blue means interaction, green means verified or IQC, amber means pending or editable, and red means invalid, failed, or destructive. Never swap these roles for decoration.

## Typography

**Display Font:** Noto Sans Thai with sans-serif fallback  
**Body Font:** Noto Sans Thai with sans-serif fallback  
**Signature/Print Font:** Sarabun with Noto Sans Thai fallback

**Character:** One highly legible Thai sans carries the application. Sarabun is restricted to signatures and controlled print output; it is not a competing interface voice.

### Hierarchy

- **Headline** (600, 1.5rem, 1.35): Page and form titles.
- **Title** (600, 1.125rem, 1.4): Major sections and report groups.
- **Body** (400, 1rem, 1.5): Instructions and entered information; prose should remain within 65–75 characters where applicable.
- **Label** (600, 0.875rem, 1.45): Field labels, buttons, and compact navigation.

**The One Voice Rule.** Use Noto Sans Thai throughout operational UI. Never introduce a display face, decorative font, or fluid hero scale.

## Elevation

The system is flat by default. Depth comes from neutral surface changes, borders, and spacing; the single ambient shadow is reserved for overlays or truly elevated temporary UI.

### Shadow Vocabulary

- **Overlay Ambient** (`0 8px 24px rgba(15, 23, 42, 0.1)`): Dialogs and temporary elevated surfaces only.

**The Flat Worktop Rule.** Forms, tables, and dashboard sections use borders or tonal layers, never decorative border-plus-wide-shadow cards.

## Components

### Buttons

- **Shape:** Gently curved action corners (12px) and a minimum 44px target.
- **Primary:** Instrument Blue with white semibold text; green is allowed only for IQC save actions.
- **Hover / Focus:** Darken one step on hover; use a 2px Focus Teal outline with a 2px offset.
- **Secondary:** White or transparent surface with a quiet border and Graphite or Slate text.
- **Disabled / Loading:** Preserve the label, set `aria-busy` when appropriate, disable repeat activation, and reduce opacity without removing contrast entirely.

### Chips

- **Style:** Full-pill shape for record type and status only; use semantic soft background with a darker same-hue label.
- **State:** Chips communicate metadata and are not decorative substitutes for headings.

### Cards / Containers

- **Corner Style:** 16px maximum for working surfaces.
- **Background:** Bench White over Cool Worktop.
- **Shadow Strategy:** Flat at rest; borders and tonal layers create grouping.
- **Border:** One-pixel Instrument Line.
- **Internal Padding:** 16px on mobile and 24px on larger screens.

### Inputs / Fields

- **Style:** White background, one-pixel border, 8px corners, and at least 44px height.
- **Focus:** Visible two-pixel ring and border shift; never rely on color alone.
- **Error / Disabled:** Corrective Red border, inline Thai explanation connected with `aria-describedby`, and preserved user input.

### Navigation

- Desktop uses a compact horizontal navigation bar. Mobile and tablet retain the same information architecture in a touch-sized horizontal navigation row. Current location uses Instrument Blue plus `aria-current`; keyboard tabs use managed focus.

### Signature Capture

- Always offer both drawn and typed-name confirmation. Render both through the same preview and print pipeline. A pointer-only signature flow is prohibited.

## Do's and Don'ts

### Do:

- **Do** keep the daily submission path short, obvious, and forgiving.
- **Do** use 44px minimum targets and visible keyboard focus for every action.
- **Do** preserve the controlled report structure users already trust.
- **Do** use stable skeletons for data loading and clear Thai recovery instructions for failures.
- **Do** transform dense tables into labeled cards below the tablet breakpoint.

### Don't:

- **Don't** create a plain internal form that feels bare, hard to scan, or unfinished.
- **Don't** add decorative complexity, gradients, glass effects, or ornamental motion.
- **Don't** nest cards when spacing, headings, or a divider can express the hierarchy.
- **Don't** use border-left or border-right accents thicker than 1px.
- **Don't** pair a 1px decorative border with a soft shadow wider than 8px.
- **Don't** use card radii above 16px or uppercase tracked labels as repeated section scaffolding.
- **Don't** use modal dialogs for routine success, loading, or recoverable status feedback.
