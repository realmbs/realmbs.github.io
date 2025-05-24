import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://realmbs.github.io',
  output: 'static',
  build: {
    assets: 'assets'
  }
});