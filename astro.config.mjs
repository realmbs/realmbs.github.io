import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://realmbs.github.io',
  base: '/portfolio',
  output: 'static',
  build: {
    assets: 'assets'
  }
});