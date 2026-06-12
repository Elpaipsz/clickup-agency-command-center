---
name: "glassmorphism-design-system"
description: "Glassmorphism Design System design system for AI coding agents."
metadata:
  author: typeui.sh
  source: workspace-importer
  projectName: "Glassmorphism"
  projectLogoUrl: ""
  importSource: "Manual TypeUI setup"
  primaryColorReference: "#18181b"
  surfaceColorReference: "#ffffff"
  textColorReference: "#09090b"
  typographyScale: "Inter-style sans serif, 12/14/16/20/24/32 scale, medium labels, semibold headings."
  spacingScale: "4px base grid with 8px, 12px, 16px, 24px, and 32px layout steps."
  radiusScale: "6px controls, 8px cards, 12px overlays, nested radii reduced by inner padding."
---

# Design System — Agent Instructions

**Style: Glassmorphism** — a refined, translucent aesthetic inspired by frosted glass surfaces layered over rich, dark atmospheric backgrounds. Surfaces use semi-transparent fills with `backdrop-filter: blur(20px)`, subtle inset edge highlights, and translucent rgba borders to create depth and luminosity. The brand color #8AFFC4 (mint green) provides vibrant accents against deep navy-black backgrounds. Typography uses Google Sans for a clean, modern feel. The result is a premium, ethereal design where glass-like layers float over immersive backgrounds with soft light refractions along edges.

This skill describes the visual design language for all UI output. Every component, layout, and page should follow the design specs in the module files below. These describe *what the design looks like* — you choose how to implement the styles.

## Before Writing Any Code

1. **Read every module that applies.** For a landing page, read at minimum: `layout.md`, `typography.md`, `colors.md`, `buttons.md`, `cards.md`, `shadows.md`, `radius.md`, `borders.md`. Do NOT write JSX until you have loaded all relevant modules.

## Critical Rules

- **Tokens are AGNOSTIC, NOT Tailwind classes:** The tokens defined in the `.md` files (like `neutral-primary-soft`, `heading`, `border-default`) are agnostic design system tokens, NOT literal Tailwind classes. Do not blindly use classes like `bg-neutral-primary-soft` unless you have explicitly mapped them in the CSS/Tailwind configuration. You must implement the mapping yourself.

- **Cross-reference modules.** A card containing buttons must satisfy both `cards.md` AND `buttons.md`.
- **Dark mode is automatic.** The CSS custom properties resolve differently in light/dark via `@media (prefers-color-scheme: dark)`. Never manually swap colors.
- **Every interactive element needs hover, focus, and disabled states** — defined in the relevant module.
- **Use semantic HTML:** proper heading hierarchy (`h1`→`h6`), `<button>` for actions, `<a>` for navigation, ARIA attributes where needed.
- **Glassmorphism surfaces** (cards, modals, sidebars, navbars, accordion, dropdowns) must use glass-bg, glass-blur, glass-border, and glass-shadow tokens from `colors.md`, with edge highlight pseudo-elements from `borders.md`. Note: Always apply `backdrop-filter: blur(20px) !important;` and `-webkit-backdrop-filter: blur(20px) !important;` to ensure the blur isn't overridden by Tailwind defaults.

## Module Index

### Foundation (read first for any UI work)
- [components/borders.md](components/borders.md) - Borders
- [components/brand.md](components/brand.md) - Brand
- [components/layout.md](components/layout.md) - Layout
- [components/radius.md](components/radius.md) - Radius
- [components/typography.md](components/typography.md) - Typography

### Components
- [components/accordion.md](components/accordion.md) - Accordion
- [components/alerts.md](components/alerts.md) - Alerts
- [components/avatars.md](components/avatars.md) - Avatars
- [components/badges.md](components/badges.md) - Badges
- [components/button-group.md](components/button-group.md) - Button Group
- [components/buttons.md](components/buttons.md) - Buttons
- [components/cards.md](components/cards.md) - Cards
- [components/colors.md](components/colors.md) - Colors
- [components/content.md](components/content.md) - Content
- [components/dropdown.md](components/dropdown.md) - Dropdown
- [components/icon-shapes.md](components/icon-shapes.md) - Icon Shapes
- [components/inputs.md](components/inputs.md) - Inputs
- [components/lists.md](components/lists.md) - Lists
- [components/modals.md](components/modals.md) - Modals
- [components/pagination.md](components/pagination.md) - Pagination
- [components/radios-checkboxes-toggle.md](components/radios-checkboxes-toggle.md) - Radios Checkboxes Toggle
- [components/shadows.md](components/shadows.md) - Shadows
- [components/sidebars.md](components/sidebars.md) - Sidebars
- [components/tables.md](components/tables.md) - Tables
- [components/tabs.md](components/tabs.md) - Tabs
- [components/tooltips-popovers.md](components/tooltips-popovers.md) - Tooltips Popovers