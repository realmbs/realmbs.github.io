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

# CURRENT TASK: STYLES IMPROVEMENTS
1. single page scrolling
* PROBLEM: single page scrolling not working perfectly, each page should be clearly marked on the viewport with a clean border and scrolling down with the mouse should snap on to the next page
2. featured projects modal redesign
* PROBLEM: this section should be redesigned to include a clean modal design with arrows to display all featured projects
3. other improvements of your choice
* thoroughly review the entire styles directory and implement improvements using your best judgement and modern responsive web design principles  

# COMPLETED TASKS
1. STYLING FOUNDATION
2. HTML STRUCTURE
3. DATA (resume.json schema, resume.d.ts)
4. COMPONENT STYLES
5. CORE TS FUNCTIONALITY