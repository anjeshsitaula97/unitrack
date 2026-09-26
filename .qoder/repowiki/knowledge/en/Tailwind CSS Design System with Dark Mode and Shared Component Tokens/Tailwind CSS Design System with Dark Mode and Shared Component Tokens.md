---
kind: frontend_style
name: Tailwind CSS Design System with Dark Mode and Shared Component Tokens
category: frontend_style
scope:
    - '**'
source_files:
    - tailwind.config.js
    - src/styles/tailwind.css
    - src/styles/index.css
    - src/lib/theme.tsx
    - src/app/layout.tsx
    - postcss.config.js
---

## Approach

The UniTrack frontend uses **Tailwind CSS v3** (via PostCSS + Autoprefixer) as its styling engine, layered on top of a custom design-token system. There is no component library (no shadcn/ui, MUI, etc.); instead, shared UI primitives are built as small React components in `src/components/ui/` and `src/components/`, styled entirely with Tailwind utility classes and a few global `@layer components` classes.

## Key files and packages

- `tailwind.config.js` — central design token source: custom font families (`label-pill`, `headline-md`, `body-lg`, `display-hero`, …), a full indigo/green palette under `primary`, `secondary`, `tertiary`, plus semantic color keys like `surface`, `background`, `on-*`, `*-container`, `*-fixed`, `*-dim`. Also defines custom `fontSize`, `borderRadius` (`xl`, `2xl`, `3xl`), `boxShadow` tokens (`card`, `card-hover`, `dropdown`), and animation/keyframe definitions (`fade-in`, `slide-up`, `pulse-soft`).
- `src/styles/tailwind.css` — entry stylesheet that imports Tailwind base/components/utilities, declares CSS custom properties for light/dark themes under `:root` and `.dark`, resets scrollbars globally, sets base typography, and defines reusable component-level classes (`sidebar-nav-item`, `btn-primary`, `btn-secondary`, `card`, `badge` variants).
- `src/lib/theme.tsx` — client-side `ThemeProvider` that persists theme in `localStorage` (`unitrack-theme`) and toggles the `dark` class on `<html>`; exposes `useTheme()` hook.
- `src/app/layout.tsx` — root layout that imports `../styles/tailwind.css` and wraps children in `<ThemeProvider>`.
- `postcss.config.js` — enables `tailwindcss` and `autoprefixer` plugins.
- `src/styles/index.css` — re-exports `tailwind.css` via `@import`.

## Architecture and conventions

1. **Design tokens live in two places.** The Tailwind config (`tailwind.config.js`) defines brand tokens (font families, colors, spacing, shadows, animations). The CSS file (`src/styles/tailwind.css`) defines runtime theme tokens as CSS variables (`--background`, `--foreground`, `--primary`, `--muted`, `--radius`, …) scoped to `:root` and overridden under `.dark`. Components consume both: static tokens via Tailwind utilities (e.g. `bg-indigo-600`, `text-body-sm`, `rounded-xl`) and dynamic tokens via CSS variables where needed.

2. **Dark mode is class-based.** Theme state is managed by `ThemeProvider` in `src/lib/theme.tsx`, which reads from `localStorage` and `prefers-color-scheme`, then toggles the `dark` class on `document.documentElement`. All dark-mode styles are defined via the `.dark` selector in `src/styles/tailwind.css` (CSS variable overrides) and via `dark:` utility prefixes in components.

3. **Shared component classes live in `@layer components`.** Reusable visual building blocks — `sidebar-nav-item`, `btn-primary`, `btn-secondary`, `card`, and multiple `badge-*` variants (`badge-active`, `badge-pending`, `badge-suspended`, `badge-draft`, `badge-archived`, `badge-planning`, `badge-inprogress`, `badge-inreview`, `badge-verified`) — are declared once in `src/styles/tailwind.css` so pages can compose them without repeating Tailwind chains.

4. **Typography is tokenized.** Custom font families (`label-pill`, `headline-md`, `headline-sm`, `headline-lg`, `body-sm`, `body-lg`, `metric-display`, `label-btn`, `display-hero-mobile`, `display-hero`, `body-md`, `headline-lg-mobile`) are registered in `tailwind.config.js` and used directly as Tailwind classes (e.g. `font-headline-md`, `text-body-sm`). Base body font falls back to `-apple-system / BlinkMacSystemFont / SF Pro Display / Helvetica Neue / Arial`.

5. **Animations are centralized.** Tailwind config registers `fade-in`, `slide-up`, `pulse-soft` keyframes and corresponding utility classes; the same animations are also exposed as utility classes (`animate-fade-in`, `animate-slide-up`) in `src/styles/tailwind.css` for direct use.

6. **Global reset & scrollbar policy.** A universal reset hides scrollbars across browsers (`::-webkit-scrollbar { display: none }`, `scrollbar-width: none`) and applies `box-sizing: border-box`. A `no-scrollbar` utility class is provided for elements that need it.

7. **Accessibility baseline.** A `@media (prefers-reduced-motion: reduce)` block disables animations and transitions site-wide.

8. **Component composition pattern.** Pages under `src/app/**` are thin page shells that import content components (e.g. `DashboardContent`, `ApplicationsContent`) and style them inline with Tailwind classes; there is no per-page CSS file. Shared chrome (`Sidebar`, `Topbar`, `AppLayout`, `StudentSidebar`, `StudentTopbar`) lives in `src/components/` and is reused across admin and student portal routes.

## Conventions and constraints

- **No CSS modules or SCSS.** Styling is exclusively Tailwind utility classes plus the global `@layer components` classes in `src/styles/tailwind.css`; there are no `.module.css` or `.scss` files in the app.
- **Brand colors are consumed via Tailwind tokens**, not raw hex values in components. The palette is centered around `primary: #4f46e5` (indigo) with extended shades 50–900, plus green-oriented `secondary`/`tertiary` tones.
- **Dark mode is opt-in via the `dark` class on `<html>`**, never via media queries alone. Theme persistence is handled by `ThemeProvider` using `localStorage` key `unitrack-theme`.
- **Reusable UI primitives are kept minimal.** Only five shared classes exist at the component layer (`sidebar-nav-item`, `btn-primary`, `btn-secondary`, `card`, `badge` + badge variants); everything else is composed from Tailwind utilities.
- **Responsive behavior follows Tailwind's mobile-first breakpoints** (e.g. `lg:col-span-5`, `lg:p-8`) rather than custom media queries.
- **PostCSS pipeline is fixed**: only `tailwindcss` and `autoprefixer` are enabled, keeping the build simple and predictable.