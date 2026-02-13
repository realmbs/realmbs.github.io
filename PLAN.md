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

---

## Phase 6: Content Personalization (Manual Review Required)

All placeholder/sample content that needs to be replaced with real information before deploying the site. Organized by priority.

### 6.1 — Identity & Branding (HIGH — appears on every page)

These values propagate across the entire site. Update these first.

| File | Line(s) | Current Value | What to Update |
|------|---------|---------------|----------------|
| `src/data/resume.json` | 2 | `"realmbs"` | Your real name or handle |
| `src/data/resume.json` | 3 | `"Cybersecurity Professional"` | Your actual job title |
| `src/data/resume.json` | 4 | `"contact@realmbs.dev"` | Your real contact email |
| `src/data/resume.json` | 5 | `"https://github.com/realmbs"` | Your GitHub profile URL |
| `src/data/resume.json` | 6 | `"https://linkedin.com/in/realmbs"` | Your LinkedIn profile URL |
| `src/data/resume.json` | 7 | `"Cybersecurity enthusiast focused on..."` | Your professional summary/bio |
| `src/components/nav.ts` | 27 | `"realmbs"` | Logo/brand text in top nav |
| `src/components/footer.ts` | 10 | `"https://github.com/realmbs"` | GitHub link in footer |
| `src/components/footer.ts` | 11 | `"https://linkedin.com/in/"` | **BUG — missing username!** LinkedIn link in footer |
| `src/components/footer.ts` | 13 | `"realmbs"` | Copyright name in footer |

### 6.2 — SEO & Meta Tags (HIGH — affects search/social sharing)

| File | Line(s) | Current Value | What to Update |
|------|---------|---------------|----------------|
| `index.html` | 6 | `"realmbs — Cybersecurity Portfolio"` | `<title>` — browser tab & search results |
| `index.html` | 7 | `"Cybersecurity portfolio, projects, and OSCP lab writeups."` | Meta description for SEO |
| `index.html` | 8 | `"realmbs — Cybersecurity Portfolio"` | `og:title` — social sharing title |
| `index.html` | 9 | `"Cybersecurity portfolio, projects, and OSCP lab writeups."` | `og:description` — social sharing description |
| `index.html` | 11 | `"https://realmbs.github.io/"` | `og:url` — canonical URL |
| `index.html` | 16 | `"realmbs.github.io"` | Plausible analytics domain (or remove if not using Plausible) |
| `src/main.ts` | 17 | `'realmbs — Cybersecurity Portfolio'` | Default page title (home route) |
| `src/main.ts` | 17 | `'realmbs'` | Name suffix in dynamic page titles (`Page \| realmbs`) |

### 6.3 — Home Page (HIGH — first thing visitors see)

| File | Line(s) | Current Value | What to Update |
|------|---------|---------------|----------------|
| `src/pages/home.ts` | 5 | `"realmbs"` | Hero section name |
| `src/pages/home.ts` | 7 | `"Cybersecurity enthusiast. Penetration tester. Building tools and breaking things."` | Hero tagline — your personal elevator pitch |

### 6.4 — Projects Data (HIGH — replace with real projects)

The entire file contains sample projects. Replace with your actual projects or remove entries that don't exist.

| File | Line(s) | Current Value | What to Update |
|------|---------|---------------|----------------|
| `src/data/projects.json` | 3–7 | Network Scanner project | Title, description, tags, GitHub URL (or remove) |
| `src/data/projects.json` | 10–14 | Vulnerability Dashboard project | Title, description, tags, GitHub URL (or remove) |

> **Note:** The GitHub repo URLs (`realmbs/network-scanner`, `realmbs/vuln-dashboard`) likely don't exist. Either create those repos, point to real ones, or remove the `github` field.

### 6.5 — Skills & Certifications (MEDIUM — review for accuracy)

All entries in this file should reflect your actual skill set.

| File | Line(s) | Current Value | What to Update |
|------|---------|---------------|----------------|
| `src/data/skills.json` | 3–4 | Penetration Testing tools list | Add/remove tools you actually use |
| `src/data/skills.json` | 7–8 | Programming languages list | Add/remove languages you know |
| `src/data/skills.json` | 11–12 | Networking technologies list | Add/remove as needed |
| `src/data/skills.json` | 15–16 | Systems/tools list | Add/remove as needed |
| `src/data/skills.json` | 19–20 | `"OSCP (In Progress)", "CompTIA Security+", "CompTIA Network+"` | Your actual certifications and their status |

### 6.6 — Example Writeup (HIGH — replace or remove)

The entire file is a fabricated sample writeup for demonstration purposes.

| File | What to Do |
|------|------------|
| `src/content/writeups/example-box.md` | Replace with a real writeup **or** delete it. If deleted, the writeups page will show the "No writeups yet" fallback message. |

### 6.7 — Resume PDF (MEDIUM — missing file)

| File | What to Do |
|------|------------|
| `public/resume.pdf` | **Does not exist yet.** The contact page links to `/resume.pdf`. Either add your real resume PDF here, or remove the download button from `src/pages/contact.ts:15`. |

### 6.8 — Page Subtitles (LOW — optional personalization)

These are generic but functional. Update if you want more personality.

| File | Line | Current Value |
|------|------|---------------|
| `src/pages/projects.ts` | 11 | `"Security tools and projects I've built."` |
| `src/pages/skills.ts` | 17 | `"Technical skills and certifications."` |
| `src/pages/writeups.ts` | 11 | `"OSCP lab writeups and CTF solutions."` |
| `src/pages/contact.ts` | 7 | `"Get in touch."` |

### 6.9 — Known Bug

| File | Line | Issue |
|------|------|-------|
| `src/components/footer.ts` | 11 | LinkedIn URL is `"https://linkedin.com/in/"` — missing the profile slug. The `resume.json` version (`linkedin.com/in/realmbs`) is correct, but the footer hardcodes its own incomplete copy instead of reading from `resume.json`. |

---

### Phase 6 Summary

**Total items requiring review:** 35+ across 10 files

**Quick-start order:**
1. Update `src/data/resume.json` — single source of truth for identity
2. Fix footer LinkedIn bug (`src/components/footer.ts:11`)
3. Update `index.html` meta tags
4. Update `src/main.ts` title strings
5. Update `src/pages/home.ts` hero content
6. Replace or remove `src/data/projects.json` sample projects
7. Review `src/data/skills.json` for accuracy
8. Replace or delete `src/content/writeups/example-box.md`
9. Add `public/resume.pdf` or remove the download button
10. Optionally tweak page subtitles

---

## Verification

After each phase:
1. `npm run build` — must pass TypeScript check and Vite build with zero errors
2. `npm run dev` — manual check that pages render, navigation works, styles apply
3. Final: `npm run preview` — verify production build serves correctly
