# realmbs@github.io

A modern personal website built with Astro, TypeScript, and Sass, deployed using Github Pages

## Project Structure
```text
.
├── astro.config.mjs            # Astro config file
├── package.json
├── pnpm-lock.yaml
├── public
│   ├── favicon.svg
│   └── resume.pdf              # Resume
├── README.md
├── src
│   ├── assets
│   │   ├── astro.svg
│   │   ├── background.svg
│   ├── data
│   │   └── data.json           # Resume data in json format
│   ├── env.d.ts
│   ├── layouts
│   │   └── BaseLayout.astro    # Main layout component
│   ├── pages
│   │   └── index.astro         # Homepage
│   ├── styles
│   │   └── global.scss         # Global styles & variables
│   └── types.d.ts
└── tsconfig.json
```

## Data Management

The website's content is dynamically managed through src/data/data.json, making it easy to update