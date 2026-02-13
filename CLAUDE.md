# CLAUDE.md

Project context and conventions for AI-assisted development.

## Project Overview

Cybersecurity portfolio and OSCP lab writeup site. Vanilla TypeScript + SCSS + Vite 8, deployed to GitHub Pages via GitHub Actions. No framework — all DOM manipulation is manual.

## Commands

- `npm run dev` — Start Vite dev server
- `npm run build` — TypeScript check + Vite production build
- `npm run preview` — Preview production build locally

## Architecture

- **Routing:** Hash-based (`#/`, `#/projects`, `#/writeups/:slug`, etc.) — no server config needed for GitHub Pages
- **Pages:** Each page is a TS module in `src/pages/` that exports a render function mounting into `#app`
- **Components:** Reusable UI pieces in `src/components/` (nav, footer, cards)
- **Data:** JSON files in `src/data/` (resume, projects, skills) with TypeScript types in `src/types/`
- **Content:** Lab writeups as Markdown with frontmatter in `src/content/writeups/`
- **Styles:** SCSS partials in `src/styles/`, imported via `main.scss`
- **Entry point:** `src/main.ts` → initializes router, mounts nav/footer

## Code Conventions

- Strict TypeScript — `strict: true`, no unused locals/params, no fallthrough switch cases
- ES modules only (`"type": "module"`, `verbatimModuleSyntax`)
- Target ES2022, bundler module resolution
- No classes for components — use plain functions returning HTML strings or DOM elements
- Keep components small and focused; one export per file
- SCSS variables for all colors, fonts, and spacing — never hardcode values in component styles
- Use `_` prefix for SCSS partials (e.g., `_variables.scss`)

## Design System

- **Background:** `#0a0a0a` (near-black)
- **Accent:** `#00d4ff` (cyan/teal) with supporting shades
- **Font (headings/code):** JetBrains Mono
- **Font (body):** System sans-serif stack
- **Style:** Professional dark theme with subtle terminal cues — not overdone

## File Organization

```
src/
├── components/    # Reusable UI (nav, footer, cards)
├── content/       # Markdown writeups
├── data/          # JSON data files
├── pages/         # Page render functions
├── styles/        # SCSS partials + main.scss
├── types/         # TypeScript type definitions
├── router.ts      # Hash router
├── markdown.ts    # Markdown utilities
└── main.ts        # Entry point
```

## Important Notes

- GitHub Pages deployment — all routes must work with hash-based navigation
- Build output goes to `dist/` (gitignored)
- Static assets in `public/` are copied as-is to build output
- `resume.pdf` is served from `public/resume.pdf`
- Do not add runtime dependencies unless absolutely necessary — keep the bundle minimal
- When adding a new page: create the page module in `src/pages/`, register the route in `router.ts`, add a nav link in `src/components/nav.ts`, and create a corresponding SCSS partial
