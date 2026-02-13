# Implementation Plan: Cybersecurity Portfolio Site

## Context

The repo (`new-site` branch) is a stock Vite 8 + TypeScript 5.9 scaffold with only boilerplate counter demo code. The README and CLAUDE.md define the full target architecture — a cybersecurity portfolio with hash-based routing, SCSS styling, JSON data, and Markdown lab writeups. Nothing custom has been built yet. This plan implements the site from scratch in 5 phases, each producing a buildable commit.

---

## Phase 1: Foundation (Scaffold + SCSS Pipeline)

**Install dependencies:**
- `sass` (dev) — Vite has built-in SCSS support, just needs the preprocessor
- `gray-matter` + `marked` — for markdown writeup processing

**Delete boilerplate:**
- `src/counter.ts`, `src/typescript.svg`, `src/style.css`, `public/vite.svg`

**Create `vite.config.ts`:**
- `base: '/'` (user site, not project subpath)
- `css.preprocessorOptions.scss.api: 'modern-compiler'`

**Update `index.html`:**
- Add JetBrains Mono font via Google Fonts (`<link>`)
- Add meta description
- Structure `#app` with `<header id="site-header">`, `<main id="page-content">`, `<footer id="site-footer">`

**Create directory structure:**
- `src/components/`, `src/content/writeups/`, `src/data/`, `src/pages/`, `src/styles/`, `src/types/`

**Create SCSS partials:**

| File | Purpose |
|------|---------|
| `_variables.scss` | Colors (`$bg-primary: #0a0a0a`, `$accent: #00d4ff`), fonts, spacing, breakpoints |
| `_reset.scss` | Box-sizing reset, body base styles, heading/link defaults |
| `_layout.scss` | `#app` flexbox column, `#page-content` max-width + centering |
| `_nav.scss` | Fixed top nav bar with blur backdrop, logo + links |
| `_footer.scss` | Border-top footer with centered links |
| `_cards.scss` | Card component + `.card-grid` responsive grid |
| `_pages.scss` | Page header pattern, hero section, skills section, contact, `.btn` styles |
| `main.scss` | Entry point, `@use` all partials |

**Temporary `src/main.ts` stub** that imports `main.scss` and renders "Foundation loaded."

**Update `tsconfig.json`:** Add `"resolveJsonModule": true`

**Verify:** `npm run build` succeeds

---

## Phase 2: Router + Layout Components

**`src/types/index.ts`** — Shared types:
- `RouteHandler`, `Project`, `SkillCategory`, `WriteupMeta`, `Writeup`
- No `enum` (forbidden by `erasableSyntaxOnly`) — use interfaces and type aliases only

**`src/router.ts`** — Hash-based SPA router (~50 lines):
- `addRoute(path, handler)` — supports exact (`/projects`) and parameterized (`/writeups/:slug`) routes
- `startRouter()` — listens to `hashchange` + `load` events
- `navigateTo(path)` — programmatic navigation
- Pattern matching via regex generated from path strings

**`src/components/nav.ts`:**
- `mountNav()` — renders into `#site-header`
- Links: home, projects, skills, writeups, contact
- Active state tracking via hash comparison

**`src/components/footer.ts`:**
- `mountFooter()` — renders into `#site-footer`
- GitHub/LinkedIn links + copyright year

**Stub pages** (`src/pages/home.ts`, `projects.ts`, `skills.ts`, `writeups.ts`, `contact.ts`):
- Each exports `render(container, _params)` — renders placeholder content
- All accept `_params: Record<string, string>` to satisfy `noUnusedParameters`

**`src/main.ts`** — Full wiring:
- Import styles, router, nav, footer, all page modules
- `pageHandler` wrapper: calls render, updates nav active state, scrolls to top
- Register all routes, mount nav/footer, start router

**Verify:** `npm run dev` — navigation between all pages works

---

## Phase 3: Data Layer + Content Pages

**JSON data files** (placeholder content to be replaced later):
- `src/data/projects.json` — Array of `Project` objects (2 sample entries)
- `src/data/skills.json` — Array of `SkillCategory` objects (Pentesting, Programming, Networking, Systems, Certifications)
- `src/data/resume.json` — Name, title, email, github, linkedin, summary

**`src/components/project-card.ts`:**
- `renderProjectCard(project)` → HTML string with title, description, tags, links

**Update content pages:**
- `projects.ts` — imports `projects.json`, renders card grid
- `skills.ts` — imports `skills.json`, renders categorized skill tags
- `contact.ts` — imports `resume.json`, renders contact links + resume download button

**Home page** — Hero section with `$ whoami` greeting, name, tagline, CTA buttons

**Verify:** `npm run build` succeeds, all pages render data

---

## Phase 4: Writeups System

**`src/content/writeups/example-box.md`** — Sample writeup with frontmatter (title, date, tags, description, difficulty)

**`src/markdown.ts`** — Writeup processing:
- `import.meta.glob('./content/writeups/*.md', { query: '?raw', import: 'default', eager: true })` to load all `.md` at build time
- Parse frontmatter with `gray-matter`, convert body with `marked`
- Export `getWriteups()` (index list) and `getWriteup(slug)` (single writeup)
- **Fallback:** If `gray-matter` has Node.js bundling issues, replace with a minimal 15-line frontmatter parser (split on `---`, parse key-value YAML)

**`src/components/writeup-card.ts`:**
- `renderWriteupCard(meta)` → clickable card with title, description, tags, date

**`src/pages/writeup-detail.ts`:**
- Renders full writeup HTML with back link, title, meta, tags, and `.prose` content
- 404 state if slug not found

**`src/styles/_writeup.scss`:**
- Writeup header/meta styles
- `.prose` class for rendered markdown (headings, code blocks, lists, blockquotes, links)
- `.card--clickable` variant

**Update `main.scss`** to `@use 'writeup'`

**Register `/writeups/:slug` route in `main.ts`**

**Verify:** `npm run dev` — writeup index shows sample, clicking opens detail with rendered markdown

---

## Phase 5: SEO, Deployment, Analytics

**SEO meta tags** — Add Open Graph tags to `index.html` (`og:title`, `og:description`, `og:type`, `og:url`)

**Dynamic page titles** — `setTitle()` helper called on each route change (`"Page | realmbs"` format)

**Favicon** — Create `public/favicon.svg` (simple terminal/lock icon), update `<link>` in `index.html`

**Plausible Analytics** — Add `<script defer data-domain="realmbs.github.io" src="https://plausible.io/js/script.js">` to `<head>`

**Resume PDF** — Place `public/resume.pdf` (placeholder or real)

**GitHub Actions** — `.github/workflows/deploy.yml`:
- Trigger on push to `main`
- `actions/checkout@v4` → `actions/setup-node@v4` (Node 22) → `npm ci` → `npm run build`
- `actions/upload-pages-artifact@v3` (path: `dist`) → `actions/deploy-pages@v4`
- Permissions: `contents: read`, `pages: write`, `id-token: write`

**Verify:** `npm run build` produces clean `dist/`, workflow YAML is valid

---

## Files Summary

| Action | File |
|--------|------|
| DELETE | `src/counter.ts`, `src/typescript.svg`, `src/style.css`, `public/vite.svg` |
| MODIFY | `index.html`, `tsconfig.json`, `package.json` (via npm install) |
| CREATE | `vite.config.ts` |
| CREATE | `src/main.ts`, `src/router.ts`, `src/markdown.ts` |
| CREATE | `src/types/index.ts` |
| CREATE | `src/components/nav.ts`, `footer.ts`, `project-card.ts`, `writeup-card.ts` |
| CREATE | `src/pages/home.ts`, `projects.ts`, `skills.ts`, `writeups.ts`, `writeup-detail.ts`, `contact.ts` |
| CREATE | `src/data/resume.json`, `projects.json`, `skills.json` |
| CREATE | `src/content/writeups/example-box.md` |
| CREATE | `src/styles/main.scss`, `_variables.scss`, `_reset.scss`, `_layout.scss`, `_nav.scss`, `_footer.scss`, `_cards.scss`, `_pages.scss`, `_writeup.scss` |
| CREATE | `.github/workflows/deploy.yml`, `public/favicon.svg` |

## Known Pitfalls

- **`gray-matter` in browser** — uses `Buffer` internally. If Vite build fails, switch to minimal custom frontmatter parser (no dependency needed)
- **`verbatimModuleSyntax`** — all type imports must use `import type { ... }` syntax
- **`noUnusedParameters`** — all page render functions must accept `_params` even if unused
- **SCSS `@use` not `@import`** — `@import` is deprecated; all partials use `@use 'variables' as *`

## Verification

After each phase:
1. `npm run build` — must pass TypeScript check and Vite build with zero errors
2. `npm run dev` — manual check that pages render, navigation works, styles apply
3. Final: `npm run preview` — verify production build serves correctly
