import { defineConfig } from 'astro/config';
import sass from '@astrojs/sass';

export default defineConfig({
  integrations: [sass()],
  site: 'https://realmbs.github.io',
  base: '/portfolio',
  output: 'static',
  build: {
    assets: 'assets'
  }
});