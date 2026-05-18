# Design & UX Notes

Collaborative notes between Rob (design) and Mike (engineering). Last updated: 2026-05-18.

---

## Current Stack (as of May 2026)

- **Frontend:** React 18 + Create React App + Bootstrap 5.3.2 + React Bootstrap
- **Styling:** Bootstrap utility classes throughout, dark mode via `data-bs-theme="dark"` on `<html>`
- **Design tokens:** None yet — all Bootstrap defaults. A SCSS theme scaffold has been added at `packages/client/src/styles/` to accept overrides.

---

## Design Recommendations

### 1. Establish a color palette — top priority

The site currently uses Bootstrap's stock dark theme. The "boilerplate" feeling comes almost entirely from this. Setting a custom primary color and adjusting the surface/border colors in `_variables.scss` will immediately differentiate the site.

Things to decide:
- Brand accent color (used for primary buttons, active states, links)
- Whether to stay full dark, go light, or support both via a toggle
- Background surface layering — Bootstrap dark uses 3 surface tiers (`--bs-body-bg`, `--bs-secondary-bg`, `--bs-tertiary-bg`); all three should feel intentional

### 2. Typography — pick one font and set the scale

Currently: system font stack, no custom typeface, no size/weight decisions.

Recommendations:
- One sans-serif for the whole site is enough given the utilitarian scope
- The `<h1>` on the home page (`just read comics`) uses `fw-light` — that's a deliberate feel worth keeping or consciously changing
- Set `$headings-font-weight` and `$headings-line-height` in `_variables.scss` to establish hierarchy across all pages
- Consider whether the site name should be a wordmark/logotype or stay as a heading element

### 3. ResultCard — the primary UI unit

`ResultCard.tsx` is the most-seen component. Current issues:
- Image container height is hardcoded via inline style (`minHeight: 420, maxHeight: 420`) — inconsistent with different cover art ratios
- Card body has no minimum spacing contract; text truncation on series names needs review
- The "View" button (`btn-sm btn-outline-secondary`) is visually weak — consider `btn-primary` or a cleaner treatment

Suggested improvement: move the image height to `_components.scss` as a named class, and review whether 420px is the right number at each breakpoint.

### 4. Services section (SeriesDetail page)

The subscription/free/purchase breakdown is functional but dense. The icon grid could benefit from:
- Consistent icon sizing with a visual baseline (currently handled by `ServiceImage` size prop: `xs`, `sm`, `md`)
- Clearer visual grouping between tiers — the current `border-top` divider is subtle
- A hover state on the service links

### 5. Header / navigation

`Header.tsx` uses raw Bootstrap utilities (`p-3 mb-3 border-bottom`). No issues, but worth reviewing:
- Logo treatment (`Logo.tsx` renders `<h2>just read comics</h2>`) — an `<h2>` in a nav header is semantically odd; should be a `<span>` or `<a>` with a `.site-name` class
- Search input in the header could use a more distinct visual container rather than a bare dropdown

### 6. Spacing consistency

Several pages mix `pt-4 pb-4`, `py-5`, `p-3`, and inline pixel values with no clear rhythm. Once `$spacer` is set in `_variables.scss`, it's worth auditing the page templates (`PageTemplate.tsx`, `SeriesDetail.tsx`, `Home.tsx`) for consistent section spacing.

---

## Technical Notes for Mike

- **CRA is deprecated.** Not urgent, but migrating to Vite would speed up the dev/build cycle. Worth doing as a separate task — not blocking design work.
- **SCSS scaffold is in place.** `packages/client/src/index.tsx` now imports `styles/custom.scss` instead of `bootstrap.css` directly. Bootstrap SCSS variables can be overridden in `_variables.scss` without touching any component files. Sass is already a devDependency.
- **Bootstrap SCSS deprecation warnings** will appear in the console when compiling — these come from Bootstrap 5's own internals using older Sass color functions. They're harmless and go away when Bootstrap 6 (or a Sass upgrade) lands.
- **Dark mode approach:** `data-bs-theme="dark"` on `<html>` in `public/index.html` is the right call for a whole-site dark theme — it uses Bootstrap's CSS custom property overrides. If a light/dark toggle is ever added, that attribute just needs to be toggled in JS.

---

## Open Questions

- [ ] Does the site need a light mode, or is full dark the permanent decision?
- [ ] Is there a logo / wordmark in the works, or will the text treatment stay?
- [ ] Should the admin interface follow the same design system, or stay functionally minimal?
- [ ] Are there any brand guidelines or color references to work from?
