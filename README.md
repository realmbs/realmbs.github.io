# realmbs.github.io

Personal landing site for Mark Blaha.

## Stack

- Vite + React + TypeScript
- Tailwind CSS v4 (`@tailwindcss/vite`) with a custom token theme
- three.js via `@react-three/fiber`, lazy-loaded so the WebGL chunk stays out of the
  initial bundle
- Self-hosted fonts via Fontsource

## Commands

```sh
npm run dev      # dev server
npm run build    # type-check + production build to dist/
npm run preview  # serve the production build locally
```

## Deploy

Pushes to `main` deploy to GitHub Pages via `.github/workflows/deploy.yml`
(repo Pages source must be set to "GitHub Actions").

## Accessibility / performance notes

- `prefers-reduced-motion` swaps the WebGL hero for a static poster gradient.
- The canvas pauses (`frameloop="never"`) whenever the hero scrolls off screen.
- Semantic landmarks, visible focus states, skip link, keyboard-reachable links.
