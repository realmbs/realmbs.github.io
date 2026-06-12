# realmbs.github.io

Personal landing site for Mark Blaha.

## Stack

- Vite + React + TypeScript
- Tailwind CSS v4 (`@tailwindcss/vite`) with a custom token theme
- three.js via `@react-three/fiber`, lazy-loaded so the WebGL chunk stays out of the
  initial bundle
- Self-hosted variable fonts (latin subsets vendored to `public/fonts/`, preloaded;
  Fontsource packages kept as the dev-time source)
- Contact form posts to Formspree (the page's only third-party call)
- Share/identity assets generated in-repo: `og.png`, favicon + touch icon built from
  the real Space Grotesk letterforms

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

- `prefers-reduced-motion` swaps the WebGL hero for a static poster gradient and
  disables every entrance/scroll effect.
- The canvas pauses (`frameloop="never"`) whenever the hero scrolls off screen.
- Semantic landmarks, visible focus states, skip link, keyboard-reachable links.
- A static hero shell in `index.html` paints the headline before React mounts
  (LCP); the intro curtain plays once per session on wide viewports only.
- Lighthouse (devtools throttling): 96 / 100 / 100 / 100. axe-core: 0 violations.
