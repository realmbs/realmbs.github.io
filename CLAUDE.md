# realmbs.github.io
a lightweight, responsive, and modern personal website created using vanilla TS and scss

# REPO STRUCTURE (MUST REFERENCE)
```
realmbs.github.io/
├── public/                         # Static assets (served at root)
│   └── vite.svg                    # Favicon/logo
│
├── src/                            # Source code
│   ├── assets/                     # Bundled assets
│   │   ├── images/                 # Image files
│   │   └── videos/                 # Video files
│   │
│   ├── data/
│   │   └── resume.json             # Resume data (renders dynamically)
│   │
│   ├── scripts/                    # TypeScript modules
│   │   ├── main.ts                 # Main script coordinator
│   │   ├── form-handler.ts         # Contact form logic
│   │   ├── resume-renderer.ts      # Renders resume from JSON
│   │   └── theme-toggle.ts         # Light/dark mode switching
│   │
│   ├── styles/                     # SCSS (SMACSS architecture)
│   │   ├── abstracts/              # Non-output utilities
│   │   │   ├── _variables.scss     # Colors, spacing, breakpoints, z-index
│   │   │   ├── _mixins.scss        # Reusable patterns (flex, grid, responsive)
│   │   │   └── _functions.scss     # Calculations, rem conversion, color utils
│   │   │
│   │   ├── base/                   # Element defaults
│   │   │   ├── _reset.scss         # CSS reset/normalize
│   │   │   ├── _typography.scss    # Fonts, headings, text styles
│   │   │   └── _utilities.scss     # Helper classes (.sr-only, .flex, etc)
│   │   │
│   │   ├── layout/                 # Page structure
│   │   │   ├── _header.scss        # Nav, logo positioning
│   │   │   ├── _footer.scss        # Footer styling
│   │   │   ├── _grid.scss          # Grid system/utilities
│   │   │   └── _section.scss       # Section spacing, max-width
│   │   │
│   │   ├── components/             # UI elements
│   │   │   ├── _button.scss        # Button variants
│   │   │   ├── _card.scss          # Card component
│   │   │   ├── _skill-badge.scss   # Skill badges/tags
│   │   │   └── _theme-toggle.scss  # Theme toggle button
│   │   │
│   │   ├── themes/                 # Color schemes
│   │   │   ├── _light.scss         # Light mode overrides
│   │   │   └── _dark.scss          # Dark mode overrides
│   │   │
│   │   └── main.scss               # Entry point (imports all partials)
│   │
│   ├── types/
│   │   └── resume.d.ts             # TypeScript types for resume data
│   │
│   ├── main.ts                     # App entry point
│   ├── counter.ts                  # Demo component (remove later)
│   ├── style.css                   # Vite template CSS (replace with main.scss)
│   └── typescript.svg              # Demo asset (remove later)
│
├── index.html                      # HTML entry point (<div id="app">)
├── package.json                    # Dependencies & scripts
├── tsconfig.json                   # TypeScript config (strict mode)
├── CLAUDE.md                       # Project instructions
└── .gitignore                      # Git exclusions
```

## Build & Scripts
- `npm run dev` — Start Vite dev server with HMR
- `npm run build` — Type check (`tsc`) then build to `/dist`
- `npm run preview` — Preview production build locally

## Key Config
- **Vite 7.2.4** — Modern bundler with SCSS support
- **TypeScript 5.9.3** — Strict mode, ES2022 target
- **No framework** — Vanilla TS + SCSS only

## SCSS Import Order (in main.scss)
```scss
// 1. Abstracts (no CSS output)
@forward 'abstracts/variables';
@forward 'abstracts/functions';
@forward 'abstracts/mixins';

// 2. Base
@forward 'base/reset';
@forward 'base/typography';
@forward 'base/utilities';

// 3. Layout
@forward 'layout/grid';
@forward 'layout/header';
@forward 'layout/section';
@forward 'layout/footer';

// 4. Components
@forward 'components/button';
@forward 'components/card';
@forward 'components/skill-badge';
@forward 'components/theme-toggle';

// 5. Themes (last to override)
@forward 'themes/light';
@forward 'themes/dark';
```

## Deployment
- GitHub Pages at `https://realmbs.github.io`
- Build output: `/dist` directory

# CURRENT TASK: STYLING FOUNDATION
1. Create SCSS abstracts

write to _variables.scss with color palette, spacing scale, breakpoints, font families, z-index layers
write to _mixins.scss with responsive breakpoint mixins, flexbox/grid utilities
write to _functions.scss with rem conversion, color manipulation helpers

2. Create base styles

write to _reset.scss with CSS reset or normalize
write to _typography.scss with font imports, base font sizes, heading styles, body text
write to _utilities.scss with container classes, visibility helpers, spacing utilities

3. Create theme system

write to _light.scss with CSS custom properties for light mode colors
write to _dark.scss with CSS custom properties for dark mode colors
Define color tokens (background, text, accent, borders)
Plan theme switching mechanism (class or data attribute)

4. Create main SCSS entry

write to main.scss that imports everything in correct order
Import order: abstracts → base → themes → layout → components
Update main.ts to import main.scss

5. Test styling system

Add temporary HTML to index.html to test colors
Verify CSS custom properties work
Check responsive breakpoints
Test in browser dev tools