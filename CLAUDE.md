# CLAUDE.md

Project memory for Mark's personal site. Read this fully before any task.

## What this is

A single-page personal landing site, rebuilt from scratch. Its job is to make a strong, minimal
impression for grad-school admissions readers and professional contacts. Content is deliberately
sparse; the hero is the centerpiece. No blog, no writeups, no CMS, no comments.

## Visual direction

Redesigned June 2026 (supersedes the original Claude Design mockup). The locked direction is a
dark editorial look: near-black ink background, Space Grotesk display type at oversized scale,
JetBrains Mono uppercase labels, a single acid-lime accent (`#d7ff3f`), hairline rules, film-grain
overlay, and scroll reveals. The hero is a full-viewport three.js particle-terrain (custom shader
points, fbm displacement, mouse parallax). The fixed nav uses `mix-blend-difference` for
legibility — do not reintroduce `backdrop-filter` (known GPU compositing bug on this machine).
Do not improvise a different aesthetic; if something is ambiguous, ask before guessing.

## Stack

- Vite + React + TypeScript (the `react-ts` template).
- Tailwind CSS v4 via `@tailwindcss/vite`, with a custom token theme pulled from the mockup —
  define real colors, type scale, and spacing. Do not ship the default palette.
- The hero is a single React component, lazy-loaded. WebGL via `@react-three/fiber` + `three`
  (plus `@react-three/drei` as needed), or `cobe` for the lightweight globe path. Pick per the
  locked concept and keep it in one component.
- This is a client-rendered SPA — React runs the whole page. Keep the dependency surface minimal.
- No analytics, no trackers, no third-party beacons. Self-host fonts (no Google Fonts CDN).

## Structure

```
/
  index.html
  src/
    main.tsx
    App.tsx
    components/
      Hero.tsx          # lazy-loaded WebGL island
      Bio.tsx
      Capstone.tsx
      Contact.tsx
    styles/index.css    # tokens + base styles
    assets/             # self-hosted fonts, hero textures / poster frames
  public/
    resume.pdf          # placeholder filename
  vite.config.ts
  tsconfig.json
  .github/workflows/deploy.yml
```

## Commands

- dev: `npm run dev`
- build: `npm run build` (outputs to `dist/`)
- preview: `npm run preview`

## Content map

1. Hero — full viewport, the visual centerpiece, with name + one-line tagline over it.
2. Bio — 2-4 sentences. "Builder-operator at the business/tech seam": cybersecurity background
   (offensive security, AWS/serverless, Python) plus full-cycle business development.
3. Capstone — brief, one project. Serverless AWS threat-intelligence platform that ingested and
   normalized 32,000+ indicators of compromise while running at roughly $0.82/month. Built for a
   BAT in Cybersecurity at Collin College (NSA CAE-CD program), completed Dec 2025, 4.0 GPA.
   Treat exact wording as placeholder for Mark to confirm.
4. Resume — link to `/resume.pdf` (placeholder filename; Mark supplies the file).
5. Contact — email + GitHub + LinkedIn (placeholders).

## Performance + accessibility budget

- Lighthouse 95+ across performance, accessibility, best-practices, and SEO on the built site.
- This is an SPA, so the React runtime ships for the whole page. The WebGL hero is the one heavy
  dependency: lazy-load it with `React.lazy` + a dynamic `import()` behind `<Suspense>` so `three`/r3f
  is code-split out of the initial bundle. Do not pull the WebGL library into the main chunk.
- Keep the dependency surface small; this is a tiny site.
- `prefers-reduced-motion`: ship a static hero fallback (a rendered poster frame or a CSS gradient).
  Never autoplay heavy motion when reduced motion is requested.
- Real alt text, semantic landmarks, visible focus states, keyboard-reachable links, sufficient contrast.

## Deployment (GitHub Pages, CI/CD)

- GitHub Actions, following Vite's official static-deploy workflow. Single job:
  checkout -> setup-node (lts/*, npm cache) -> `npm ci` -> `npm run build` -> configure-pages ->
  upload-pages-artifact (path `./dist`) -> deploy-pages.
- Set the repo Pages source to "GitHub Actions" (not a branch).
- Permissions block: `contents: read`, `pages: write`, `id-token: write`. Concurrency group `pages`.
- Verify current action major versions at scaffold time — they bump. As of last check:
  `actions/checkout@v6`, `actions/setup-node@v6`, plus current `actions/configure-pages`,
  `actions/upload-pages-artifact`, `actions/deploy-pages`.
- `base` in `vite.config.ts` depends on repo type — confirm before setting:
  - User site (`yourname.github.io`): `base: '/'` (default).
  - Project repo: `base: '/repo-name/'`.
- Single page, no client router, so no 404 fallback is needed. If routing is added later, copy
  `index.html` to `404.html` at build so deep links resolve.
- Official guide: https://vite.dev/guide/static-deploy

## Conventions

- Small, single-purpose components. Lean on the token theme; avoid utility-class soup.
- No dependency unless it earns its place. This is a tiny site.
- Commit at milestones with clear messages. Never commit secrets.
- Ask before adding analytics, external embeds, or any third-party network call. The default is none.

## Out of scope

No blog, CMS, writeups, comments, or dynamic backend. If a task implies any of these, confirm first.