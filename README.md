# https://realmbs.github.io

A modern and responsive personal website built with Astro, TypeScript, and Sass, deployed using Github Actions

## Data Management

The website's content is dynamically managed through src/data/data.json, making it easy to update

## Project Structure
```text
.
├── astro.config.mjs            # Astro config file
├── public
│   └── resume.pdf              # Resume
├── README.md
├── src
│   ├── assets
│   │   ├── favicon.svg
│   ├── data
│   │   └── data.json           # Resume data in json format
│   ├── layouts
│   │   └── BaseLayout.astro    # Main layout component
│   ├── pages
│   │   └── index.astro         # Homepage
│   ├── styles
│   │   └── global.scss         # Global styles & variables
│   └── types.d.ts
└── tsconfig.json
```