# Design & UX Notes

Collaborative notes between Rob (design) and Mike (engineering). Last updated: 2026-05-18.

---

## Current Stack (as of May 2026)

- **Frontend:** React 18 + Create React App + Bootstrap 5.3.2 + React Bootstrap
- **Styling:** Custom SCSS entry point at `packages/client/src/styles/custom.scss`. Bootstrap utility classes used throughout components — no changes needed there.
- **Design tokens:** Partially defined. Core palette, typography, and radii are set. Status colors and several component-level variables are still using Bootstrap defaults (see `/design` page).
- **Theming:** Light/dark toggle is supported via `data-bs-theme` on `<html>`. Dark is the current default.

---

## SCSS Architecture

The styling pipeline is `_variables.scss → Bootstrap SCSS → _themes.scss → _typography.scss → _buttons.scss → _components.scss`. Import order is load-bearing.

### Why two layers?

Bootstrap 5.3 has two separate theming mechanisms that serve different roles:

| Layer | Where | When it runs | Used for |
|---|---|---|---|
| SCSS variables (`$primary`, `$h1-font-size`, etc.) | `_variables.scss` | Compile time | Fonts, heading scale, spacing, radii, `$primary`/`$secondary` |
| CSS custom properties (`--bs-body-bg`, etc.) | `_themes.scss` | Runtime | Surface colors, link colors, per-theme surface tiers |

Setting `$body-bg` in SCSS alone won't work when `data-bs-theme="dark"` is active — Bootstrap's dark theme reasserts `--bs-body-bg` at runtime. So background and surface colors live in `_themes.scss`, not `_variables.scss`.

### File breakdown

- **`_variables.scss`** — All SCSS compile-time overrides. Custom palette vars use a `$jrc-` prefix to distinguish them from Bootstrap's semantic names (`$primary`, `$secondary`, etc.). Edit this file first.
- **`_themes.scss`** — CSS custom property overrides keyed to `[data-bs-theme="dark"]` and `[data-bs-theme="light"]`. This is where background colors, surface tiers, and link colors live. Adding a light/dark toggle is just one JS attribute flip on `<html>`.
- **`_typography.scss`** — Per-heading font-weight overrides. Bootstrap only exposes one `$headings-font-weight` global, so individual weights are set here as element rules.
- **`_buttons.scss`** — Structural button overrides that can't be expressed as variables.
- **`_components.scss`** — Component-level CSS rules (e.g. creator badge styling).

### Tokens set so far

| Token | Value | Where |
|---|---|---|
| Background (dark) | `#1E1E1E` | `_themes.scss` |
| Surface subtle | `#2A2A2A` | `_themes.scss` |
| Surface muted | `#333333` | `_themes.scss` |
| Accent | `#E6BABA` | `$jrc-accent` |
| Primary | `#FF4B01` | `$jrc-primary` → `$primary` |
| Secondary | `#515151` | `$jrc-secondary` → `$secondary` |
| Font | Jura | `$font-family-sans-serif` |
| H1 | 2.375rem / 400 | `$h1-font-size` + `_typography.scss` |
| H2 | 1.5rem / 600 | `$h2-font-size` + `_typography.scss` |
| H3 | 1rem / 700 | `$h3-font-size` + `_typography.scss` |
| Border radius (normal) | 6px | `$border-radius` |
| Border radius (tight) | 2px | `$border-radius-sm` |
| Border radius (soft) | 12px | `$border-radius-lg` |

### Tokens not yet defined (Bootstrap defaults active)

These are visible on the `/design` page with a "BS default" indicator. Decide and uncomment in `_variables.scss` when ready:

| Variable | Bootstrap default |
|---|---|
| `$success` | `#198754` |
| `$info` | `#0dcaf0` |
| `$warning` | `#ffc107` |
| `$danger` | `#dc3545` |
| `$link-decoration` | `underline` |
| `$navbar-padding-y` | `0.5rem` |
| `$card-border-radius` | `0.75rem` |

---

## `/design` — Live Token Editor

Route: `http://localhost:3000/design` (internal tooling, not for public use).

A split-pane design token editor. Left pane shows a live series-page mockup, type scale, and color/radius swatches. Right sidebar has editable controls for all defined tokens plus a read-only "Not yet set" panel showing the Bootstrap defaults above.

**Copy SCSS** exports a ready-to-paste block for `_variables.scss` and `_themes.scss`, with pending vars output as commented stubs. **Copy JSON** exports the full token set including Bootstrap defaults for status colors.

---

## Design Recommendations

### 1. Color palette — mostly done, a few decisions pending

Core palette is set (see table above). Still needed:
- Decide on `$success`/`$warning`/`$danger` — the Bootstrap greens/yellows/reds may be fine, or they may clash with the warm accent palette. Check on both light and dark themes.
- Decide on `$link-decoration` — `none` is likely right for this site.

### 2. Typography — done

Jura is loaded and applied via `$font-family-sans-serif`. Heading scale and per-heading weights are set. The brand wordmark (`just read comics`) uses 1.625rem / 700.

### 3. ResultCard — the primary UI unit

`ResultCard.tsx` is the most-seen component. Current issues:
- Image container height is hardcoded via inline style (`minHeight: 420, maxHeight: 420`) — inconsistent with different cover art ratios
- The "View" button (`btn-sm btn-outline-secondary`) is visually weak — consider `btn-primary`

Suggested: move image height to `_components.scss` as a named class.

### 4. Services section (SeriesDetail page)

The subscription/free/purchase breakdown is functional but dense:
- Consistent icon sizing baseline (`ServiceImage` size prop: `xs`, `sm`, `md`)
- Clearer visual grouping between tiers — the current `border-top` divider is subtle
- A hover state on the service links

### 5. Header / navigation

`Logo.tsx` renders `<h2>just read comics</h2>` — semantically odd in a nav header. Should be a `<span>` or `<a>` with a `.site-name` class. `$navbar-padding-y` not yet set.

### 6. Spacing consistency

Several pages mix `pt-4 pb-4`, `py-5`, `p-3`, and inline pixel values. Once the rhythm feels right, worth auditing `PageTemplate.tsx`, `SeriesDetail.tsx`, and `Home.tsx`.

---

## Technical Notes for Mike

- **SCSS scaffold is in place.** `packages/client/src/index.tsx` imports `styles/custom.scss` instead of `bootstrap.css` directly. No component files need to change to pick up token overrides — edit `_variables.scss` and `_themes.scss` only.
- **Two-layer theming.** See "SCSS Architecture" above. The short version: SCSS variables = compile-time (fonts, sizes); CSS custom properties in `_themes.scss` = runtime (colors, surfaces). Don't set `$body-bg` expecting it to win against `data-bs-theme`.
- **Light/dark toggle.** Flip `document.documentElement.setAttribute('data-bs-theme', 'light' | 'dark')`. Both theme blocks are stubbed in `_themes.scss`.
- **Bootstrap SCSS deprecation warnings** in the build console are from Bootstrap 5's own Sass color functions. Harmless — go away with Bootstrap 6.
- **CRA is deprecated.** Not urgent, but migrating to Vite would speed up dev/build. Worth doing as a separate task.

---

## Open Questions

- [ ] Sign off on status colors (`$success`, `$warning`, `$danger`, `$info`) — keep Bootstrap defaults or customise?
- [ ] `$link-decoration`: keep `underline` or set to `none`?
- [ ] Light mode: stub is in `_themes.scss`, but what should the light surface palette look like?
- [ ] Is there a logo / wordmark in the works, or will the text treatment stay?
- [ ] Should the admin interface follow the same design system, or stay functionally minimal?
