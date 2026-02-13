# realmbs.github.io

A cybersecurity portfolio and lab writeup site built with TypeScript, SCSS, and Vite — hosted on GitHub Pages.

---

## Site Plan

### Purpose

Personal portfolio for a recent cybersecurity graduate. Highlights cybersecurity projects, technical skills, and (in the future) OSCP-prep lab writeups.

### Tech Stack

| Category         | Choice                     | Notes                                              |
| ---------------- | -------------------------- | -------------------------------------------------- |
| Language          | TypeScript (~5.9)          | Strict mode, ES2022 target                         |
| Build Tool        | Vite 8                     | Dev server, SCSS support, Markdown plugin          |
| Styling           | SCSS                       | Nesting, variables, mixins via Vite's built-in support |
| Routing           | Hash-based (`#/`)          | Works natively with GitHub Pages, no server config |
| Markdown          | Build-time rendering       | Lab writeups converted to HTML at build via Vite plugin |
| Font              | JetBrains Mono             | Loaded from Google Fonts or self-hosted            |
| Deployment        | GitHub Actions CI/CD       | Push to `main` triggers build and deploy           |

### Visual Design

- **Theme:** Dark background, professional terminal-inspired aesthetic (not overdone)
- **Accent color:** Cyan / Teal (`#00d4ff` primary, with supporting shades)
- **Background:** Near-black (`#0a0a0a` or similar)
- **Typography:** JetBrains Mono for headings and code; clean sans-serif (system font stack) for body text
- **Style notes:** Subtle terminal cues (monospace headings, muted borders, cursor-blink animations) balanced with clean whitespace and professional layout

### Site Structure (Multi-Page, Hash Router)

```
#/            → Home / Hero + About Me
#/projects    → Projects showcase
#/skills      → Skills & tech stack
#/writeups    → Lab writeups index (Markdown-based)
#/writeups/:slug → Individual writeup page
#/contact     → Contact info & links
```

### Pages & Sections

#### Home / Hero (`#/`)
- Name, title ("Cybersecurity Graduate" or similar), short tagline
- Brief bio paragraph
- Photo or avatar (optional)
- Call-to-action links (view projects, download resume)

#### Projects (`#/projects`)
- Grid or card layout of cybersecurity projects
- Each card: title, description, tags (tools/tech used), links (GitHub, live demo, writeup)
- Data sourced from `src/data/projects.json`

#### Skills (`#/skills`)
- Categorized skill display (e.g., Security Tools, Programming, Networking, Cloud/DevOps)
- Data sourced from `src/data/skills.json`

#### Lab Writeups (`#/writeups`)
- Index page listing all writeups with title, date, tags, and short description
- Individual writeup pages rendered from Markdown files in `src/content/writeups/`
- Writeup metadata via frontmatter (title, date, tags, difficulty, platform)
- Code syntax highlighting for commands and scripts

#### Contact (`#/contact`)
- Links to GitHub, LinkedIn, email
- Optional: simple contact form (e.g., Formspree or similar)
- Downloadable PDF resume link

### Content Management

| Content Type       | Format                     | Location                          |
| ------------------ | -------------------------- | --------------------------------- |
| Bio / personal info | JSON                       | `src/data/resume.json`            |
| Projects           | JSON                       | `src/data/projects.json`          |
| Skills             | JSON                       | `src/data/skills.json`            |
| Lab writeups       | Markdown (with frontmatter)| `src/content/writeups/*.md`       |
| Resume PDF         | Static file                | `public/resume.pdf`              |

### TypeScript Data Types

Type definitions for all JSON data structures will live in `src/types/`:
- `resume.d.ts` — bio, education, certifications, experience
- `projects.d.ts` — project schema
- `skills.d.ts` — skills categories and items

### Extras

- **Downloadable PDF resume** — served from `public/resume.pdf`, linked from hero and contact sections
- **SEO meta tags + Open Graph** — proper `<meta>` tags for search engines and social media link previews
- **Analytics** — Plausible Analytics (privacy-friendly, cookie-free, lightweight script tag)

### Deployment

GitHub Actions workflow (`.github/workflows/deploy.yml`):
1. Trigger on push to `main`
2. Install dependencies (`npm ci`)
3. Build (`npm run build`)
4. Deploy `dist/` to GitHub Pages

### Project File Structure (Target)

```
realmbs.github.io/
├── .github/
│   └── workflows/
│       └── deploy.yml              # GitHub Actions CI/CD
├── public/
│   ├── resume.pdf                  # Downloadable resume
│   └── favicon.svg                 # Site favicon
├── src/
│   ├── content/
│   │   └── writeups/               # Markdown lab writeups
│   │       └── example-writeup.md
│   ├── data/
│   │   ├── resume.json             # Bio, education, certs
│   │   ├── projects.json           # Project entries
│   │   └── skills.json             # Skills categories
│   ├── types/
│   │   ├── resume.d.ts             # Resume type definitions
│   │   ├── projects.d.ts           # Project type definitions
│   │   └── skills.d.ts             # Skills type definitions
│   ├── components/                 # Reusable UI components (TS)
│   │   ├── nav.ts                  # Navigation bar
│   │   ├── footer.ts               # Site footer
│   │   ├── project-card.ts         # Project card component
│   │   └── writeup-card.ts         # Writeup list item component
│   ├── pages/                      # Page renderers
│   │   ├── home.ts
│   │   ├── projects.ts
│   │   ├── skills.ts
│   │   ├── writeups.ts
│   │   └── contact.ts
│   ├── styles/
│   │   ├── _variables.scss         # Color palette, fonts, spacing
│   │   ├── _mixins.scss            # Reusable SCSS mixins
│   │   ├── _base.scss              # Reset and base styles
│   │   ├── _nav.scss               # Navigation styles
│   │   ├── _hero.scss              # Hero section styles
│   │   ├── _projects.scss          # Projects page styles
│   │   ├── _skills.scss            # Skills page styles
│   │   ├── _writeups.scss          # Writeups page styles
│   │   ├── _contact.scss           # Contact page styles
│   │   └── main.scss               # Main entry, imports all partials
│   ├── router.ts                   # Hash-based router
│   ├── markdown.ts                 # Markdown rendering utilities
│   └── main.ts                     # App entry point
├── index.html                      # HTML shell
├── package.json
├── tsconfig.json
├── CLAUDE.md
└── README.md
```

### Implementation Order

1. **Foundation** — Install SCSS, set up file structure, configure Vite plugins
2. **Router** — Implement hash-based router with page mounting
3. **Layout** — Build nav and footer components, base page shell
4. **Styles** — SCSS variables, base theme, typography (JetBrains Mono)
5. **Data layer** — Define TypeScript types, create JSON data files with placeholder content
6. **Home page** — Hero section with bio, CTA links
7. **Projects page** — Card grid sourced from projects.json
8. **Skills page** — Categorized skill display from skills.json
9. **Contact page** — Links, resume download
10. **Writeups system** — Vite Markdown plugin, frontmatter parsing, writeup index + detail pages
11. **SEO & meta** — Open Graph tags, favicon, page titles
12. **Analytics** — Add Plausible script
13. **Deployment** — GitHub Actions workflow, test full build and deploy
14. **Content** — Replace placeholder content with real data
